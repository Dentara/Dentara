"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = use(params);

  const [formState, setFormState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) throw new Error("Failed to fetch patient");
        const data = await res.json();

        // name → first/last fallback (əgər modeldə yalnız `name` varsa)
        const [fn, ...lnParts] =
          data?.firstName && data?.lastName
            ? [data.firstName, data.lastName]
            : ((data?.name || "").trim().split(" "));
        const hydrated = {
          ...data,
          firstName: data?.firstName ?? (fn || ""),
          lastName: data?.lastName ?? (lnParts.join(" ") || ""),
        };

        setFormState(hydrated);
        setDob(data?.dob ? new Date(data.dob) : undefined);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [patientId]);

 async function handleSave() {
   setSaving(true);
   try {
     const fullName =
       `${formState?.firstName ?? ""} ${formState?.lastName ?? ""}`.trim() ||
       formState?.name ||
       null;

     const payload = {
       ...formState,
       name: fullName,
       dob: dob ? dob.toISOString() : null,
     };

     const res = await fetch(`/api/patients/${patientId}`, {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload),
     });

     if (!res.ok) {
       const txt = await res.text();
       alert(`Save failed: ${txt}`);
       return;
     }

     const updated = await res.json();
     const [ufn, ...ulnParts] =
       updated?.firstName && updated?.lastName
         ? [updated.firstName, updated.lastName]
         : ((updated?.name || "").trim().split(" "));
     setFormState({
       ...updated,
       firstName: updated?.firstName ?? (ufn || ""),
       lastName: updated?.lastName ?? (ulnParts.join(" ") || ""),
     });
     setDob(updated?.dob ? new Date(updated.dob) : undefined);

     setConfirmOpen(false);
     alert("Changes saved successfully.");
   } catch (e) {
     console.error("save error", e);
     alert("Save error");
   } finally {
     setSaving(false);
   }
 }

  if (loading) return <div className="p-10">Loading...</div>;
  if (!formState) return <div className="p-10 text-red-500">Patient not found</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Edit Patient</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Profile</CardTitle>
              <CardDescription>Update the patient's profile picture and status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={formState?.image || "/user.png"} alt="Patient" />
                <AvatarFallback>
                  {(formState?.firstName?.[0] || formState?.name?.[0] || "P").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full">Change Photo</Button>

              <div className="w-full space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="patient-status">Patient Status</Label>
                  <Switch
                    id="patient-status"
                    checked={(formState?.status ?? "Active") === "Active"}
                    onCheckedChange={(checked) =>
                      setFormState({ ...formState, status: checked ? "Active" : "Inactive" })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Active patients can book appointments and receive care.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="medical">Medical Information</TabsTrigger>
              {/* Insurance & Billing tabı ləğv edildi */}
            </TabsList>

            {/* PERSONAL */}
            <TabsContent value="personal" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Update the patient's personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={formState?.firstName || ""}
                        onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={formState?.lastName || ""}
                        onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <span>{dob ? dob.toDateString() : "Pick a date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={dob} onSelect={setDob} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formState?.gender ?? ""}
                        onValueChange={(v) => setFormState({ ...formState, gender: v })}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formState?.email || ""}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formState?.phone || ""}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formState?.address || ""}
                      onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formState?.city || ""}
                        onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formState?.state || ""}
                        onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input
                        id="zip"
                        value={formState?.zip || ""}
                        onChange={(e) => setFormState({ ...formState, zip: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact">Emergency Contact</Label>
                    <Input
                      id="emergency-contact"
                      value={formState?.emergencyContact || ""}
                      onChange={(e) => setFormState({ ...formState, emergencyContact: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MEDICAL */}
            <TabsContent value="medical" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>Update the patient's medical details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tooth-pref">Preferred Tooth Number</Label>
                    <Input
                      id="tooth-pref"
                      value={formState?.toothPref || ""}
                      onChange={(e) => setFormState({ ...formState, toothPref: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dental-notes">Chronic Dental Notes</Label>
                    <Textarea
                      id="dental-notes"
                      value={formState?.dentalNotes || ""}
                      onChange={(e) => setFormState({ ...formState, dentalNotes: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood-type">Blood Type</Label>
                    <Select
                      value={formState?.bloodType ?? ""}
                      onValueChange={(v) => setFormState({ ...formState, bloodType: v })}
                    >
                      <SelectTrigger id="blood-type">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a_positive">A+</SelectItem>
                        <SelectItem value="a_negative">A-</SelectItem>
                        <SelectItem value="b_positive">B+</SelectItem>
                        <SelectItem value="b_negative">B-</SelectItem>
                        <SelectItem value="ab_positive">AB+</SelectItem>
                        <SelectItem value="ab_negative">AB-</SelectItem>
                        <SelectItem value="o_positive">O+</SelectItem>
                        <SelectItem value="o_negative">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formState?.height ?? ""}
                      onChange={(e) => setFormState({ ...formState, height: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formState?.weight ?? ""}
                      onChange={(e) => setFormState({ ...formState, weight: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formState?.allergies || ""}
                      onChange={(e) => setFormState({ ...formState, allergies: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chronic-conditions">Chronic Conditions</Label>
                    <Textarea
                      id="chronic-conditions"
                      value={formState?.chronicConditions || ""}
                      onChange={(e) => setFormState({ ...formState, chronicConditions: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-medications">Current Medications</Label>
                    <Textarea
                      id="current-medications"
                      value={formState?.currentMedications || ""}
                      onChange={(e) => setFormState({ ...formState, currentMedications: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Smoking Status</Label>
                    <RadioGroup
                      value={formState?.smokingStatus ?? ""}
                      onValueChange={(v) => setFormState({ ...formState, smokingStatus: v })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="never" id="never" />
                        <Label htmlFor="never">Never Smoked</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="former" id="former" />
                        <Label htmlFor="former">Former Smoker</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="current" />
                        <Label htmlFor="current">Current Smoker</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance & Billing tamamilə ləğv edildi */}
          </Tabs>

          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/patients/${patientId}`}>Cancel</Link>
            </Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  The patient record will be updated with the changes you made.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Confirm Save"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

