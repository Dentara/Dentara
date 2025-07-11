import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("[GET /api/doctors]", error);
    return new NextResponse("Failed to fetch doctors", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "clinic") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clinicId = "cmbg9438i0000czaialurf01u";
    const body = await req.json();

    // Email təkrarı yoxlanışı
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email: body.email },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { message: "A doctor with this email already exists." },
        { status: 400 }
      );
    }

    // Yeni həkim əlavə et
    const newDoctor = await prisma.doctor.create({
      data: {
        fullName: body.fullName,
        profilePhoto: body.profilePhoto || "",
        gender: body.gender,
        dob: new Date(body.dob),
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        email: body.email,
        phone: body.phone,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        profilePhoto: body.profilePhoto || "",
        specialization: body.specialization,
        secondarySpecialization: body.secondarySpecialization,
        licenseNumber: body.licenseNumber,
        licenseExpiryDate: new Date(body.licenseExpiryDate),
        qualifications: body.qualifications,
        experience: parseInt(body.experience),
        education: body.education,
        certifications: body.certifications,
        department: body.department,
        position: body.position,
        username: body.username,
        password: body.password,
        emailAccount: body.emailAccount,
        accessPatients: body.accessPatients,
        accessPrescriptions: body.accessPrescriptions,
        accessBilling: body.accessBilling,
        accessReports: body.accessReports,
        notifyAppointments: body.notifyAppointments,
        notifyPatients: body.notifyPatients,
        notifySystem: body.notifySystem,
        status: "Active",
        clinic: {
          connect: { id: clinicId },
        },
      },
    });

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error("[POST /api/doctors]", error);
    return new NextResponse("Failed to create doctor", { status: 500 });
  }
}
