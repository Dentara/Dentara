"use client";

import { useState } from "react";
import { Calendar, FileText, PieChart, Pills, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/medix/shell";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl xl:text-3xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground">Your dashboard</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Doctor
            </Button>
            <Button size="sm" className="h-9">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>--</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p>--</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <p>--</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p>--</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <p>--</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
