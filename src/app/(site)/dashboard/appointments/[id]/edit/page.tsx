"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const getDoctors = () => [
  { id: "d1", name: "Dr. Sarah Johnson", department: "Orthodontic Care" },
  { id: "d2", name: "Dr. Michael Chen", department: "Endodontic Services" },
  { id: "d3", name: "Dr. Lisa Patel", department: "Periodontal Therapy" },
  { id: "d4", name: "Dr. James Wilson", department: "Restorative Dentistry" },
  { id: "d5", name: "Dr. Emily Rodriguez", department: "Radiology & Imaging" },
];

const getDepartments = () => [
  "Orthodontic Care", "Periodontal Therapy", "Endodontic Services",
  "Restorative Dentistry", "Oral Surgery Unit", "Pediatric Dental Care",
  "Preventive Services", "Aesthetic Unit", "Radiology & Imaging"
];

const getAppointmentTypes = () => [
  "Filling", "Root Canal", "Extraction", "Scaling",
  "Implant", "Crown", "X-ray", "Consultation"
];

const getProcedureTypes = () => [
  "Filling", "Root Canal", "Extraction", "Scaling",
  "Implant", "Crown", "X-ray", "Checkup"
];

const formSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  endTime: z.string().min(1),
  doctorId: z.string().min(1),
  department: z.string().min(1),
  type: z.string().min(1),
  duration: z.string().min(1),
  room: z.string().min(1),
  reasonForVisit: z.string().min(1),
  notes: z.string().optional(),
  toothNumber: z.string().min(1),
  procedureType: z.string().min(1),
  price: z.string().min(1),
});

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [appointment, setAppointment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const doctors = getDoctors();
  const departments = getDepartments();
  const appointmentTypes = getAppointmentTypes();
  const procedureTypes = getProcedureTypes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      time: "",
      endTime: "",
      doctorId: "",
      department: "",
      type: "",
      duration: "",
      room: "",
      reasonForVisit: "",
      notes: "",
      toothNumber: "",
      procedureType: "",
      price: "",
    },
    mode: "onChange",
  });

  const { reset } = form;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/clinic/appointments/${id}`);
        const data = await res.json();
        if (!data || !data.id) throw new Error("Invalid appointment");
        setAppointment(data);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        router.push(`/dashboard/appointments`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  useEffect(() => {
    if (appointment) {
      reset({
        date: appointment.date ?? "",
        time: appointment.time ?? "",
        endTime: appointment.endTime ?? "",
        doctorId: appointment.doctor?.id ?? "",
        department: appointment.department ?? "",
        type: appointment.type ?? "",
        duration: appointment.duration ?? "",
        room: appointment.room ?? "",
        reasonForVisit: appointment.reasonForVisit ?? "",
        notes: appointment.notes ?? "",
        toothNumber: appointment.toothNumber ?? "",
        procedureType: appointment.procedureType ?? "",
        price: appointment.price ?? "",
      });
    }
  }, [appointment, reset]);

  if (isLoading) return <div>Loading...</div>;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const payload = {
      ...values,
      date: appointmentDate?.toISOString().split("T")[0] ?? "",
    };

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({ title: "Appointment updated", description: "The appointment has been updated successfully." });
      router.push(`/appointments/${id}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast({ title: "Error", description: "Failed to update appointment." });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Tooth Number */}
                  <FormField
                    control={form.control}
                    name="toothNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tooth Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 11, 26" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Procedure Type */}
                  <FormField
                    control={form.control}
                    name="procedureType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Procedure</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select procedure" />
                            </SelectTrigger>
                            <SelectContent>
                              {procedureTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₼)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="e.g. 60" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="destructive" type="button">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel Appointment
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/appointments/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
