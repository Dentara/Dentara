import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("GET /api/patient/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// ✅ PATCH /api/patient/:id
export async function PATCH(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const body = await req.json();

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        age: body.age,
        gender: body.gender,
        dob: new Date(body.dob),
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        bloodType: body.bloodType,
        height: body.height,
        weight: body.weight,
        allergies: body.allergies,
        currentMedications: body.currentMedications,
        chronicConditions: body.chronicConditions,
        pastSurgeries: body.pastSurgeries,
        hospitalizations: body.hospitalizations,
        familyHistoryNotes: body.familyHistoryNotes,
        smoking: body.smoking,
        alcohol: body.alcohol,
        exercise: body.exercise,
        diet: body.diet,
        insuranceProvider: body.insuranceProvider,
        policyNumber: body.policyNumber,
        groupNumber: body.groupNumber,
        policyHolder: body.policyHolder,
        relationship: body.relationship,
        insurancePhone: body.insurancePhone,
        billingMethod: body.billingMethod,
        primaryDoctor: body.primaryDoctor,
        condition: body.condition,
        status: body.status,
        lastVisit: new Date(body.lastVisit),
        doctor: body.doctor,
        image: body.image,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/patient/[id] error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
