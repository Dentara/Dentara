// src/app/api/patients/add/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/* ------------ helpers ------------- */
function safe(s?: any) {
  if (s === null || s === undefined) return "";
  return String(s).trim();
}
function toLowerOrNull(s?: any) {
  const v = safe(s);
  return v ? v.toLowerCase() : null;
}
function calcAge(d?: string) {
  if (!d) return null;
  const dob = new Date(d);
  if (isNaN(dob.getTime())) return null;
  const t = new Date();
  let age = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--;
  return age;
}
/** YYYY-MM-DD string → Date | null (timezone sürüşməsiz, yerli 00:00) */
function parseDobYMD(d?: string | null) {
  if (!d) return null;
  const s = String(d).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [, yy, mm, dd] = m;
  const dt = new Date(Number(yy), Number(mm) - 1, Number(dd));
  return isNaN(dt.getTime()) ? null : dt;
}
/** Date → YYYY-MM-DD */
function toYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
async function saveFile(file: File, folder: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });
  const stamp = Date.now();
  const clean = String(file.name).replace(/[^\w.\-]+/g, "_");
  const fileName = `${stamp}_${clean}`;
  const filePath = path.join(uploadsDir, fileName);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buf);
  return `/uploads/${folder}/${fileName}`;
}
async function getClinicId() {
  const session = await getServerSession(authOptions);
  const user: any = session?.user;
  if (!user?.id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const clinicId = user.role === "clinic" ? user.id : user.clinicId || null;
  if (!clinicId) throw Object.assign(new Error("No clinicId bound"), { status: 403 });
  return { clinicId, user };
}

/* ------------- POST --------------- */
/**
 * Qəbul edilən field-lər (form və ya JSON):
 *  - firstName, lastName, fullName | name
 *  - email, phone, altPhone
 *  - gender, dob ("YYYY-MM-DD")
 *  - address, city, state, zip
 *  - condition, doctor, status
 *  - image (File: avatar/profilePhoto/patientPhoto/picture)
 */
export async function POST(req: Request) {
  try {
    const { clinicId } = await getClinicId();

    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, any> = {};
    let imageUrl: string | null = null;

    // Bu dəyişənlər DOB-u təhlükəsiz saxlamaq üçün əlavə edilib
    let dobRaw: string | null = null;     // gələn mətn (YYYY-MM-DD gözlənilir)
    let dobDate: Date | null = null;      // parse olunmuş tarix

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      // ad
      const firstName = safe(form.get("firstName"));
      const lastName  = safe(form.get("lastName"));
      const fullName  = safe(form.get("fullName")) || safe(form.get("name")) || [firstName, lastName].filter(Boolean).join(" ").trim();
      if (!fullName) return NextResponse.json({ error: "Name is required" }, { status: 400 });

      // şəkil (istənilən açarla gəlsə saxlayırıq)
      const imgKey = ["image", "avatar", "profilePhoto", "patientPhoto", "picture"].find(k => form.get(k) instanceof File);
      if (imgKey) {
        const f = form.get(imgKey) as File;
        if (f && typeof f === "object" && f.size > 0) imageUrl = await saveFile(f, "patients");
      }

      dobRaw = safe(form.get("dob")) || null;
      dobDate = parseDobYMD(dobRaw);

      payload = {
        name: fullName,
        email: toLowerOrNull(form.get("email")),
        phone: safe(form.get("phone")),
        altPhone: safe(form.get("altPhone")),
        gender: safe(form.get("gender")),
        dob: dobRaw || null, // mətni saxlayırıq (audit üçün), DB-ə isə dobDate gedəcək
        address: safe(form.get("address")),
        city: safe(form.get("city")),
        state: safe(form.get("state")),
        zip: safe(form.get("zip")),
        condition: safe(form.get("condition")) || "",
        doctor: safe(form.get("doctor")) || "Dr. Unknown",
        status: safe(form.get("status")) || "Active",
      };
    } else {
      // JSON
      const body = await req.json();
      const firstName = safe(body.firstName);
      const lastName  = safe(body.lastName);
      const fullName  = safe(body.fullName) || safe(body.name) || [firstName, lastName].filter(Boolean).join(" ").trim();
      if (!fullName) return NextResponse.json({ error: "Name is required" }, { status: 400 });

      dobRaw = safe(body.dob) || null;
      dobDate = parseDobYMD(dobRaw) || (body.dob ? new Date(String(body.dob)) : null); // fallback: ISO gəlirsə

      payload = {
        name: fullName,
        email: toLowerOrNull(body.email),
        phone: safe(body.phone),
        altPhone: safe(body.altPhone),
        gender: safe(body.gender),
        dob: dobRaw || null,
        address: safe(body.address),
        city: safe(body.city),
        state: safe(body.state),
        zip: safe(body.zip),
        condition: safe(body.condition) || "",
        doctor: safe(body.doctor) || "Dr. Unknown",
        status: safe(body.status) || "Active",
      };
      imageUrl = safe(body.image) || null;
    }

    // yaş tələb olunur (frontend filter istifadə edir), DB-də də age var → hesablayırıq
    // calcAge() string qəbul edir — ən stabil format üçün parse olunmuş dobDate varsa onu YMD-yə çevirib veririk
    const age = dobDate ? calcAge(toYMD(dobDate)) : (payload.dob ? calcAge(payload.dob) : null);

    // 1) Patient cədvəli (global)
    const created = await prisma.patient.create({
      data: {
        name: payload.name,
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        altPhone: payload.altPhone ?? "",
        // IMPORTANT: boşdursa bugünkü tarixi qoymuruq
        dob: dobDate ?? (payload.dob ? new Date(payload.dob) : null),
        gender: payload.gender || "",
        address: payload.address || "",
        city: payload.city || "",
        state: payload.state || "",
        zip: payload.zip || "",
        age: typeof age === "number" && !isNaN(age) ? age : 0, // schema Int tələb edirsə 0 saxlayırıq
        bloodType: "",
        height: 0,
        weight: 0,
        allergies: [],
        currentMedications: "",
        chronicConditions: "",
        pastSurgeries: "",
        hospitalizations: "",
        familyHistoryNotes: "",
        smoking: "",
        alcohol: "",
        exercise: "",
        diet: "",
        insuranceProvider: "",
        policyNumber: "",
        groupNumber: "",
        policyHolder: "",
        relationship: "",
        insurancePhone: "",
        billingMethod: "",
        primaryDoctor: payload.doctor || "Dr. Unknown",
        registrationDate: new Date(),
        conditions: [],
        status: payload.status || "Active",
        lastVisit: null,
        condition: payload.condition || "",
        doctor: payload.doctor || "Dr. Unknown",
        image: imageUrl || "",
      },
      select: {
        id: true, name: true, email: true, phone: true, image: true,
        gender: true, dob: true, status: true, condition: true, doctor: true
      },
    });

    // 2) ClinicPatient – klinikaya bağlanma (başqa modullar üçün)
    await prisma.clinicPatient.create({
      data: {
        clinicId,
        fullName: created.name,
        birthDate: dobDate ?? created.dob ?? null, // parse olunmuş DOB varsa onu yazırıq
        phone: created.phone,
        email: created.email,
        image: created.image || "",
        gender: payload.gender || "",
      },
    });

    return NextResponse.json({ success: true, patient: created }, { status: 201 });
  } catch (e: any) {
    const status = e?.status || 500;
    if (status !== 500) return NextResponse.json({ error: e.message }, { status });
    console.error("POST /api/patients/add error:", e);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
