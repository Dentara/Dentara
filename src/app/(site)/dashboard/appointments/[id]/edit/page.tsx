"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Save, Trash2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

/* dummy lists (sən backend-dən dolduracaqsan) */
const getProcedureTypes = () => ["Filling", "Root Canal", "Extraction", "Scaling", "Implant", "Crown", "X-ray", "Checkup"];

const formSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  endTime: z.string().min(1),
  doctorId: z.string().optional(),
  department: z.string().optional(),
  type: z.string().optional(),
  duration: z.string().optional(),
  room: z.string().optional(),
  reasonForVisit: z.string().optional(),
  notes: z.string().optional(),
  toothNumber: z.string().optional(),
  procedureType: z.string().optional(),
  price: z.string().optional(),
});

type Params = Promise<{ id: string }>;

export default function EditAppointmentPage({ params }: { params: Params }) {
  const router = useRouter();
  const { id } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<any | null>(null);
  const procedureTypes = getProcedureTypes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "", time: "", endTime: "", doctorId: "", department: "", type: "",
      duration: "", room: "", reasonForVisit: "", notes: "", toothNumber: "",
      procedureType: "", price: "",
    },
    mode: "onChange",
  });
  const { reset } = form;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/clinic/appointments/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!data?.id) throw new Error("Invalid appointment");
        setAppointment(data);
        reset({
          date: data.date ?? "",
          time: data.time ?? "",
          endTime: data.endTime ?? "",
          doctorId: data.doctor?.id ?? "",
          department: data.department ?? "",
          type: data.type ?? "",
          duration: (data.duration ?? "").toString(),
          room: data.room ?? "",
          reasonForVisit: data.reason ?? data.reasonForVisit ?? "",
          notes: data.notes ?? "",
          toothNumber: data.toothNumber ?? "",
          procedureType: data.procedureType ?? "",
          price: (data.price ?? "").toString(),
        });
      } catch (e) {
        console.error("Error fetching appointment:", e);
        router.push(`/dashboard/appointments`);
      }
    })();
  }, [id, reset, router]);

  if (!appointment) return <div className="p-6">Loading...</div>;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/clinic/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Update failed");
      toast({ title: "Appointment updated", description: "The appointment has been updated successfully." });
      router.push(`/dashboard/appointments/${id}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast({ title: "Error", description: "Failed to update appointment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/appointments/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Edit Appointment</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" step={900} {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" step={900} {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="room" render={({ field }) => (
                  <FormItem><FormLabel>Room</FormLabel><FormControl><Input {...field} placeholder="Room / Chair" /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Duration (min)</FormLabel><FormControl><Input type="number" inputMode="numeric" {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="reasonForVisit" render={({ field }) => (
                  <FormItem><FormLabel>Reason</FormLabel><FormControl><Input {...field} placeholder="Reason for visit" /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="procedureType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Procedure</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select procedure" /></SelectTrigger>
                        <SelectContent>
                          {procedureTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price (₼)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="toothNumber" render={({ field }) => (
                  <FormItem><FormLabel>Tooth Number</FormLabel><FormControl><Input {...field} placeholder="e.g. 11, 26" /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Input {...field} placeholder="Any notes" /></FormControl><FormMessage/></FormItem>
                )}/>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="destructive" type="button">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel Appointment
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/dashboard/appointments/${id}`}>Cancel</Link>
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
