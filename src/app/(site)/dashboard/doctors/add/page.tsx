"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

// Sən dinamik olaraq array-ləri də əlavə etmisən
export default function AddDoctorPage() {
  // Stepper
  const [step, setStep] = useState(1);

  // Step 1 - Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
  "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czechia (Czech Republic)",
  "Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini (fmr. Swaziland)","Ethiopia",
  "Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar (formerly Burma)",
  "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman",
  "Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar",
  "Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam",
  "Yemen",
  "Zambia","Zimbabwe"
];

  // Step 2 - Professional
  const [primarySpecialization, setPrimarySpecialization] = useState("");
  const [secondarySpecialization, setSecondarySpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  // Workplaces (dinamik)
  const [workplaces, setWorkplaces] = useState([{ name: "", role: "", years: "", clinicId: "" }]);

  // Diplom/Sertifikat
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [diplomaAdditions, setDiplomaAdditions] = useState<File[]>([]);
  const [certificates, setCertificates] = useState([{ title: "", file: null as File | null }]);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  // Handle file uploads & previews
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };
  const handleDiplomaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDiplomaFile(file);
  };
  const handleDiplomaAdditions = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDiplomaAdditions(files);
  };
  const handleCertificateTitle = (idx: number, val: string) => {
    const arr = [...certificates];
    arr[idx].title = val;
    setCertificates(arr);
  };
  const handleCertificateFile = (idx: number, file: File | null) => {
    const arr = [...certificates];
    arr[idx].file = file;
    setCertificates(arr);
  };
  const addCertificate = () => setCertificates([...certificates, { title: "", file: null }]);
  const removeCertificate = (idx: number) => setCertificates(certificates.filter((_, i) => i !== idx));

  // Workplaces handlers
  const handleWorkplaceChange = (idx: number, field: string, value: string) => {
    const arr = [...workplaces];
    (arr[idx] as any)[field] = value;
    setWorkplaces(arr);
  };
  const addWorkplace = () => setWorkplaces([...workplaces, { name: "", role: "", years: "", clinicId: "" }]);
  const removeWorkplace = (idx: number) => setWorkplaces(workplaces.filter((_, i) => i !== idx));

  // Diploma/License
  const handleLicenseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLicenseFile(file);
  };

  // Step 1 submit
  const handleNextStep1 = (e: any) => {
    e.preventDefault();
    if (!firstName || !lastName || !gender || !birthDate || !phone || !email || !passportNumber) {
      alert("Please fill all required fields.");
      return;
    }
    setStep(2);
  };

  // Step 2 submit
  const handleNextStep2 = (e: any) => {
    e.preventDefault();
    if (!primarySpecialization || !department || !experienceYears) {
      alert("Please fill all required fields.");
      return;
    }
    setStep(3);
  };

  // Final submit (Step 3)
  const handleFinalSubmit = async () => {
    const formData = new FormData();
    // Step 1 fields
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("fatherName", fatherName);
    formData.append("gender", gender);
    formData.append("birthDate", birthDate);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("nationality", nationality);
    formData.append("passportNumber", passportNumber);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("zip", zip);
    formData.append("country", country);
    // Step 2 fields
    formData.append("primarySpecialization", primarySpecialization);
    formData.append("secondarySpecialization", secondarySpecialization);
    formData.append("department", department);
    formData.append("experienceYears", experienceYears);
    formData.append("bio", bio);
    formData.append("workplaces", JSON.stringify(workplaces));
    // Diplomas/Sertificates
    if (diplomaFile) formData.append("diplomaFile", diplomaFile);
    diplomaAdditions.forEach((file, idx) => formData.append(`diplomaAdditions[${idx}]`, file));
    certificates.forEach((cert, idx) => {
      formData.append(`certificates[${idx}][title]`, cert.title);
      if (cert.file) formData.append(`certificates[${idx}][file]`, cert.file);
    });
    if (licenseFile) formData.append("licenseFile", licenseFile);

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add doctor");
      window.location.href = "/dashboard/doctors";
    } catch (err) {
      alert("Failed to submit doctor data. Please try again.");
    }
  };

  // Options
  const specialties = [
    "Orthodontics",
    "Periodontics",
    "Endodontics",
    "Prosthodontics",
    "Oral Surgery",
    "Pediatric Dentistry",
    "Preventive Dentistry",
    "Cosmetic Dentistry",
    "Diagnostics",
  ];
  const departments = [
    "Orthodontic Care",
    "Periodontal Therapy",
    "Endodontic Services",
    "Restorative Dentistry",
    "Oral Surgery Unit",
    "Pediatric Dental Care",
    "Preventive Services",
    "Aesthetic Unit",
    "Radiology & Imaging",
  ];

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-2">Add Doctor</h1>
      <Separator className="mb-6" />
      <form onSubmit={step === 1 ? handleNextStep1 : step === 2 ? handleNextStep2 : (e) => { e.preventDefault(); }}>
        {/* STEP 1: Personal & Contact */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div>
                <Label>Father’s Name</Label>
                <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
              </div>
              <div>
                <Label>Profile Photo</Label>
                <Input type="file" accept="image/*" onChange={handleProfilePhotoUpload} />
                {profilePhotoPreview && (
                  <Image src={profilePhotoPreview} alt="Profile Preview" width={64} height={64} className="rounded-full mt-2" />
                )}
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <Label>Nationality *</Label>
                <Select value={nationality} onValueChange={setNationality} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                 </Select>
              </div>
              <div>
                <Label>Passport/ID Number *</Label>
                <Input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} required />
              </div>
              <div>
                <Label>Country *</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                 </Select>
              </div>
              <div>
                <Label>City *</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Label>Address *</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div>
                <Label>ZIP Code *</Label>
                <Input value={zip} onChange={(e) => setZip(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
              <Button type="submit">Next</Button>
            </div>
          </>
        )}
        {/* STEP 2: Professional */}
        {step === 2 && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Professional Details</h2>
              <Separator className="mb-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Primary Specialization *</Label>
                <Select value={primarySpecialization} onValueChange={setPrimarySpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Secondary Specializations (optional, comma separated)</Label>
                <Input value={secondarySpecialization} onChange={(e) => setSecondarySpecialization(e.target.value)} />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Years of Experience *</Label>
                <Input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Label>Short Bio / Description</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
              </div>
            </div>
            {/* Workplaces (dinamik) */}
            <div className="mb-6 mt-8">
              <Label>Previous Workplaces (Clinics/Hospitals) *</Label>
              {workplaces.map((wp, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input placeholder="Name" value={wp.name} onChange={e => handleWorkplaceChange(idx, "name", e.target.value)} />
                  <Input placeholder="Role" value={wp.role} onChange={e => handleWorkplaceChange(idx, "role", e.target.value)} />
                  <Input placeholder="Years" type="number" value={wp.years} onChange={e => handleWorkplaceChange(idx, "years", e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => removeWorkplace(idx)} disabled={workplaces.length === 1}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addWorkplace}>+ Add Workplace</Button>
            </div>
            {/* Diplomas & Certificates */}
            <div className="mb-6">
              <Label>Diploma File (PDF/Image) *</Label>
              <Input type="file" accept="application/pdf,image/*" onChange={handleDiplomaUpload} required />
            </div>
            <div className="mb-6">
              <Label>Diploma Additions</Label>
              <Input type="file" accept="application/pdf,image/*" onChange={handleDiplomaAdditions} multiple />
            </div>
            <div className="mb-6">
              <Label>Certificates / Trainings</Label>
              {certificates.map((cert, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input placeholder="Title" value={cert.title} onChange={e => handleCertificateTitle(idx, e.target.value)} />
                  <Input type="file" accept="application/pdf,image/*" onChange={e => handleCertificateFile(idx, e.target.files?.[0] ?? null)} />
                  <Button type="button" variant="outline" onClick={() => removeCertificate(idx)} disabled={certificates.length === 1}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addCertificate}>+ Add Certificate</Button>
            </div>
            <div className="mb-6">
              <Label>License (optional)</Label>
              <Input type="file" accept="application/pdf,image/*" onChange={handleLicenseFile} />
            </div>
            <div className="flex justify-between gap-2 mt-8">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit">Next</Button>
            </div>
          </>
        )}
        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
              <Separator className="mb-4" />
              <p>Check all information. If you want to make any corrections, use the "Back" button.</p>
            </div>
            <div className="space-y-2">
              <div><b>Name:</b> {firstName} {lastName}</div>
              <div><b>Father’s Name:</b> {fatherName}</div>
              <div><b>Gender:</b> {gender}</div>
              <div><b>Date of Birth:</b> {birthDate}</div>
              <div><b>Email:</b> {email}</div>
              <div><b>Phone:</b> {phone}</div>
              <div><b>Nationality:</b> {nationality}</div>
              <div><b>Passport/ID:</b> {passportNumber}</div>
              <div><b>Address:</b> {address}, {city}, {country}, ZIP: {zip}</div>
              <div><b>Specialization:</b> {primarySpecialization}</div>
              <div><b>Experience:</b> {experienceYears} years</div>
              <div><b>Bio:</b> {bio}</div>
              {/* Burada diplom/sertifikat və s. yoxlamaq üçün qısa preview-lar əlavə edə bilərsən */}
            </div>
            <div className="flex justify-between gap-2 mt-8">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button type="button" onClick={handleFinalSubmit}>Finish & Save</Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
