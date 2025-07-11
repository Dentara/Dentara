// 2-Cİ FAYL: /api/doctors/[id]/edit/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ PUT: Update doctor (from edit page)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const doctorId = params.id;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        name: body.fullName,
        email: body.email,
        phone: body.phone,
        image: body.image,
        specialty: body.specialty,
        experience: body.experience,
        status: body.status,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        gender: body.gender,
        dob: new Date(body.dob),
        licenseNumber: body.licenseNumber,
        licenseExpiry: new Date(body.licenseExpiry),
        department: body.department,
        position: body.position,
        education: body.education,
        certifications: body.certifications,
        qualifications: body.qualifications,
      },
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error("[DOCTOR_EDIT_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
