"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar1, Clock } from "lucide-react";
import { useForm } from "react-hook-form";

type Params = Promise<{ id: string }>;

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  reason: z.string().optional(),
  notifyPatient: z.boolean().default(true).optional(),
  notifyDoctor: z.boolean().default(true).optional(),
});

export default function RescheduleAppointmentPage({ params }: { params: Params }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [dateObj, setDateObj] = useState<Date | undefined>(new Date());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: "", time: "", endTime: "", reason: "", notifyPatient: true, notifyDoctor: true },
  });

  // Load appointment
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/clinic/appointments/${id}`, { cache: "no-store" });
        const data = await res.json();
        setAppointment(data);
        // Prefill form
        form.reset({
          date: data.date ?? "",
          time: data.time ?? "",
          endTime: data.endTime ?? "",
          reason: "",
          notifyPatient: true,
          notifyDoctor: true,
        });
        if (data.date) {
          const [y, m, d] = data.date.split("-").map((x: number) => parseInt(String(x), 10));
          setDateObj(new Date(y, m - 1, d));
        }
      } catch (e) {
        console.error("Failed to fetch appointment", e);
      }
    })();
  }, [id, form]);

  // keep form.date in sync with calendar popup
  useEffect(() => {
    if (dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      form.setValue("date", `${y}-${m}-${d}`, { shouldDirty: true });
    }
  }, [dateObj, form]);

  if (!appointment) return <div className="p-6">Loading...</div>;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // PATCH eyni endpoint: yalnız date/time dəyişir
      const res = await fetch(`/api/clinic/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: values.date, time: values.time, endTime: values.endTime, reasonForReschedule: values.reason }),
      });
      if (!res.ok) throw new Error("Reschedule failed");

      toast({ title: "Appointment rescheduled", description: "The appointment has been rescheduled successfully." });
      router.push(`/dashboard/appointments/${id}`);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Unable to reschedule the appointment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/appointments/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to appointment details</span>
            </Link>
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Reschedule Appointment</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reschedule Information</CardTitle>
            <CardDescription>Select a new date and time for the appointment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Calendar1 className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-medium">Current Appointment</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment?.date
                          ? `${new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "long", year: "numeric", month: "long", day: "numeric",
                            })} at ${appointment.time} - ${appointment.endTime ?? ""}`
                          : "No appointment data"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={() => (
                        <FormItem>
                          <FormLabel>New Date</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <span>{dateObj ? dateObj.toDateString() : "Pick a date"}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComp mode="single" selected={dateObj} onSelect={setDateObj} />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl><Input type="time" step={900} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="endTime" render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl><Input type="time" step={900} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                  </div>

                  <FormField control={form.control} name="reason" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Rescheduling</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please provide a reason" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>

                  <div className="space-y-2 pt-2">
                    <h3 className="font-medium">Notifications</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notifyPatient"
                          checked={!!form.watch("notifyPatient")}
                          onChange={(e) => form.setValue("notifyPatient", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <Label htmlFor="notifyPatient">Notify patient</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notifyDoctor"
                          checked={!!form.watch("notifyDoctor")}
                          onChange={(e) => form.setValue("notifyDoctor", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <Label htmlFor="notifyDoctor">Notify doctor</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2 flex-wrap">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/dashboard/appointments/${id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Rescheduling..." : (<><Calendar1 className="mr-2 h-4 w-4" />Reschedule Appointment</>)}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Appointment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-semibold">Duration</h3>
                  <p>{appointment?.duration ?? "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M15 8h1M15 12h1M15 16h1M14 3v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V3M5 21V7.6a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6V21"/></svg>
                <div>
                  <h3 className="font-semibold">Department</h3>
                  <p>{appointment?.department ?? "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
