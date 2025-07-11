"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AddDoctorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [secondarySpecialization, setSecondarySpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState<Date | undefined>(new Date());
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailAccount, setEmailAccount] = useState("");
  const [accessPatients, setAccessPatients] = useState(false);
  const [accessPrescriptions, setAccessPrescriptions] = useState(false);
  const [accessBilling, setAccessBilling] = useState(false);
  const [accessReports, setAccessReports] = useState(false);
  const [notifyAppointments, setNotifyAppointments] = useState(true);
  const [notifyPatients, setNotifyPatients] = useState(true);
  const [notifySystem, setNotifySystem] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<Date | undefined>(new Date());
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Yeni stomatoloji siyahılar
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const doctorData = {
      fullName: `${firstName} ${lastName}`.trim(),
      profilePhoto: "",
      dob,
      gender,
      address,
      city,
      state,
      zip,
      email,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      specialization,
      secondarySpecialization,
      licenseNumber,
      licenseExpiryDate,
      qualifications,
      experience,
      education,
      certifications,
      department,
      position,
      username,
      password,
      emailAccount,
      accessPatients,
      accessPrescriptions,
      accessBilling,
      accessReports,
      notifyAppointments,
      notifyPatients,
      notifySystem,
    };
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorData),
      });
      if (!res.ok) throw new Error("Failed to add doctor");
      const newDoctor = await res.json();
      router.push(`/dashboard/doctors/${newDoctor.id}`);
    } catch (err) {
      console.error("Error adding doctor:", err);
      alert("Failed to add doctor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
   
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/doctors">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Add Doctor</h1>
          <p className="text-muted-foreground">Add a new doctor to your clinic.</p>
        </div>
      </div>

      <Tabs defaultValue="professional" className="space-y-4">
        <TabsList>
          <TabsTrigger value="professional">Professional Details</TabsTrigger>
        </TabsList>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Enter the doctor's professional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Primary Specialization</Label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger id="specialization">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-specialization">Secondary Specialization (Optional)</Label>
                  <Select value={secondarySpecialization} onValueChange={setSecondarySpecialization}>
                    <SelectTrigger id="secondary-specialization">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Doctor"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
