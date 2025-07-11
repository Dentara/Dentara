// src/app/api/patient/add/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const get = (key: string) => formData.get(key)?.toString() || "";

    const firstName = get("first-name");
    const lastName = get("last-name");
    const name = `${firstName} ${lastName}`.trim() || "Unnamed Patient";

    const email = get("email");
    const phone = get("phone");
    const altPhone = get("alt-phone");
    const dobRaw = get("dob");
    const gender = get("gender");
    const address = get("address");
    const city = get("city");
    const state = get("state");
    const zip = get("zip");
    const bloodType = get("blood-type");
    const height = Number(get("height"));
    const weight = Number(get("weight"));
    const allergiesRaw = get("allergies");
    const currentMedications = get("current-medications");
    const chronicConditions = get("chronic-conditions");
    const pastSurgeries = get("past-surgeries");
    const hospitalizations = get("hospitalizations");
    const familyHistoryNotes = get("family-history-notes");
    const smoking = get("smoking");
    const alcohol = get("alcohol");
    const exercise = get("exercise");
    const diet = get("diet");
    const insuranceProvider = get("insurance-provider");
    const policyNumber = get("policy-number");
    const groupNumber = get("group-number");
    const policyHolder = get("policy-holder");
    const relationship = get("relationship");
    const insurancePhone = get("insurance-phone");
    const billingMethod = get("billing-method");
    const primaryDoctor = get("primaryDoctor");

    const registrationDate = new Date();
    const createdAt = new Date();
    const lastVisit = new Date();

    const dob = new Date(dobRaw);
    const today = new Date();
    const age =
      today.getFullYear() -
      dob.getFullYear() -
      (today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);

    const allergies = allergiesRaw
      ? allergiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
      : [];

    let imagePath = "";
    const file = formData.get("photo") as File | null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadPath = path.join(process.cwd(), "public/uploads", file.name);
      await writeFile(uploadPath, buffer);
      imagePath = `/uploads/${file.name}`;
    }


    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        phone,
        altPhone,
        dob,
        gender,
        address,
        city,
        state,
        zip,
        age,
        bloodType,
        height,
        weight,
        allergies,
        currentMedications,
        chronicConditions,
        pastSurgeries,
        hospitalizations,
        familyHistoryNotes,
        smoking,
        alcohol,
        exercise,
        diet,
        insuranceProvider,
        policyNumber,
        groupNumber,
        policyHolder,
        relationship,
        insurancePhone,
        billingMethod,
        primaryDoctor,
        registrationDate,
        createdAt,
        conditions: [],
        status: "Active",
        lastVisit,
        condition: chronicConditions || "N/A", // eyni ola bilər
        doctor: primaryDoctor || "Dr. Unknown",
        image: imagePath,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("⛔ Error in API:", error);
    return NextResponse.json({ message: "Failed to register patient" }, { status: 500 });
  }
}
