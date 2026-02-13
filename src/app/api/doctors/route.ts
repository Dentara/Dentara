import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function safeFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}
async function saveFile(file: File, folder: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}_${safeFilename(file.name)}`;
  const filePath = path.join(uploadsDir, fileName);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buf);
  return `/uploads/${folder}/${fileName}`;
}
async function requireClinicId() {
  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) throw Object.assign(new Error("No clinicId bound"), { status: 403 });
  return { clinicId, user };
}

/* =========================
   GET /api/doctors
========================= */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const clinicIdFromQuery = url.searchParams.get("clinicId") || undefined;

    // Əgər query ilə clinicId gəlibsə onu istifadə edirik; gəlməyibsə əvvəlki kimi session-dan alırıq
    let clinicId: string | undefined = undefined;
    if (clinicIdFromQuery && clinicIdFromQuery !== "null" && clinicIdFromQuery !== "undefined") {
      // query ilə clinicId gəlibsə — heç bir guard tətbiq etmirik
      clinicId = clinicIdFromQuery;
    } else {
      // patient tərəfdən gələndə session olmaya bilər → 403 atma, sadəcə boş siyahı qaytar
      try {
        const ctx = await requireClinicId();
        clinicId = ctx.clinicId;
      } catch {
        return NextResponse.json([]); // << 403 əvəzinə [] — UI sabit qalır
      }
    }


    const where: any = { clinicId };
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { primarySpecialization: { contains: q, mode: "insensitive" } },
        { secondarySpecialization: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        primarySpecialization: true,
        secondarySpecialization: true,
        diplomaFile: true,
        status: true,
        experience: true, // STRING
      },
      orderBy: { fullName: "asc" },
    });

    const doctors = rows.map((d) => ({
      id: d.id,
      fullName: d.fullName,
      specialization: d.primarySpecialization || d.secondarySpecialization || null,
      image: d.profilePhoto || null,
      email: d.email || null,
      phone: d.phone || null,
      licenseFile: d.diplomaFile || null,
      status: d.status || null,
      experience: d.experience || null,
    }));

    return NextResponse.json(doctors);
  } catch (e: any) {
    const status = e?.status || 500;
    if (status !== 500) return NextResponse.json({ error: e.message }, { status });
    console.error("GET /api/doctors error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/* =========================
   POST /api/doctors
========================= */
export async function POST(req: Request) {
  try {
    const { clinicId, user } = await requireClinicId();
    const form = await req.formData();

    // — Personal
    const firstName = (form.get("firstName") || "").toString().trim();
    const lastName  = (form.get("lastName")  || "").toString().trim();
    const fullName  = `${firstName} ${lastName}`.trim();
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    const fatherName  = (form.get("fatherName")  || "").toString().trim() || null;
    const gender      = (form.get("gender")      || "").toString().trim() || null;
    const birthDate   = (form.get("birthDate")   || "").toString().trim() || null;

    // Email/phone normalize
    const emailRaw = (form.get("email") || "").toString().trim();
    const email    = emailRaw ? emailRaw.toLowerCase() : null;
    const phone    = (form.get("phone") || "").toString().trim() || null;

    const nationality = (form.get("nationality") || "").toString().trim() || null;
    const passportNum = (form.get("passportNumber") || "").toString().trim() || null;
    const address     = (form.get("address") || "").toString().trim() || null;
    const city        = (form.get("city") || "").toString().trim() || null;
    const zip         = (form.get("zip") || "").toString().trim() || null;
    const country     = (form.get("country") || "").toString().trim() || null;

    // Foto
    let profilePhoto: string | null = null;
    const profileFile = form.get("profilePhoto") as File | null;
    if (profileFile && typeof profileFile === "object" && profileFile.size > 0) {
      profilePhoto = await saveFile(profileFile, "doctors");
    }

    // — Professional
    const primarySpecialization   = (form.get("primarySpecialization")   || "").toString().trim() || null;
    const secondarySpecialization = (form.get("secondarySpecialization") || "").toString().trim() || null;
    const department              = (form.get("department")              || "").toString().trim() || null;
    const bio                     = (form.get("bio") || "").toString().trim() || null;

    // EXPERIENCE (STRING)
    const experienceRaw = (form.get("experience") || form.get("experienceYears") || "").toString().trim();
    const experience: string | null = experienceRaw ? experienceRaw : null;

    // Workplaces (JSON)
    let workplaces: any = null;
    const workplacesRaw = form.get("workplaces")?.toString();
    if (workplacesRaw) { try { workplaces = JSON.parse(workplacesRaw); } catch {} }

    // Diplomas
    let diplomaFile: string | null = null;
    const diploma = form.get("diplomaFile") as File | null;
    if (diploma && typeof diploma === "object" && diploma.size > 0) {
      diplomaFile = await saveFile(diploma, "doctors");
    }

    // diplomaAdditions[*]
    const diplomaAdditions: string[] = [];
    const keys = Array.from(form.keys()).filter(k => k.startsWith("diplomaAdditions" + "["));
    for (const key of keys) {
      const file = form.get(key) as File | null;
      if (file && typeof file === "object" && file.size > 0) {
        const url = await saveFile(file, "doctors");
        diplomaAdditions.push(url);
      }
    }

    // certificates[i][title|file]
    const certIdxSet = new Set<number>();
    for (const k of form.keys()) {
      const m = k.match(/^certificates\[(\d+)\]\[(title|file)\]$/);
      if (m) certIdxSet.add(Number(m[1]));
    }
    const certificates: { title: string; fileUrl: string }[] = [];
    for (const idx of certIdxSet) {
      const title = (form.get(`certificates[${idx}][title]`) || "").toString().trim();
      let fileUrl = "";
      const f = form.get(`certificates[${idx}][file]`) as File | null;
      if (f && typeof f === "object" && f.size > 0) {
        fileUrl = await saveFile(f, "doctors");
      }
      if (title || fileUrl) certificates.push({ title, fileUrl });
    }

    // Optional ayrıca licenseFile
    let licenseFile: string | null = null;
    const lic = form.get("licenseFile") as File | null;
    if (lic && typeof lic === "object" && lic.size > 0) {
      licenseFile = await saveFile(lic, "doctors");
    }

    // FK fallback
    const fallbackClinicEmail =
      (user?.email ? String(user.email).toLowerCase() : null) ||
      `${clinicId}@clinics.local`;

    await prisma.clinic.upsert({
      where: { id: clinicId },
      update: {},
      create: {
        id: clinicId,
        name: user?.fullname || user?.name || "Clinic",
        email: fallbackClinicEmail,
        phone: null,
        address: null,
        website: null,
        licenseFile: null,
      },
    });

    // UNIQUE email in clinic
    if (email) {
      const exists = await prisma.doctor.findFirst({
        where: { clinicId, email },
        select: { id: true },
      });
      if (exists) {
        return NextResponse.json(
          { error: "A doctor with this email already exists in this clinic.", code: "EMAIL_EXISTS" },
          { status: 409 }
        );
      }
    }

    // CREATE
    try {
      const created = await prisma.doctor.create({
        data: {
          clinicId,
          fullName,
          fatherName,
          gender,
          birthDate: birthDate ? new Date(birthDate) : null,
          email,
          phone,
          nationality,
          passportNumber: passportNum,
          address,
          city,
          zip,
          country,

          profilePhoto,
          primarySpecialization,
          secondarySpecialization,
          department,
          experience, // STRING
          bio,

          workplaces,
          diplomaFile,
          diplomaAdditions: diplomaAdditions.length ? diplomaAdditions : undefined,
          certificates: certificates.length ? certificates : undefined,

          ...(licenseFile ? { licenseFile } : {}),
        },
        select: {
          id: true,
          clinicId: true,
          fullName: true,
          primarySpecialization: true,
          email: true,
          phone: true,
          profilePhoto: true,
          diplomaFile: true,
          certificates: true,
          workplaces: true,
        },
      });

      return NextResponse.json({ success: true, doctor: created });
    } catch (err: any) {
      if (err?.code === "P2002") {
        const target = (err.meta?.target || []) as string[];
        if (target.includes("email")) {
          return NextResponse.json(
            { error: "Email is already in use for a doctor.", code: "EMAIL_EXISTS" },
            { status: 409 }
          );
        }
      }
      throw err;
    }
  } catch (e: any) {
    const status = e?.status || 500;
    if (status !== 500) return NextResponse.json({ error: e.message }, { status });
    console.error("POST /api/doctors error:", e);
    return NextResponse.json({ error: "Doctor creation failed." }, { status: 500 });
  }
}
