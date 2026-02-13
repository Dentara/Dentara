import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorAppointments } from "@/components/medix/doctor/doctor-appointments";
import { DoctorCalendar } from "@/components/medix/doctor/doctor-upcoming";
import { DoctorPatients } from "@/components/medix/doctor/doctor-patients";
import { DoctorTasks } from "@/components/medix/doctor/doctor-tasks";
import { PatientNotes } from "@/components/medix/doctor/patient-notes";
import { RecentPrescriptions } from "@/components/medix/doctor/recent-prescriptions";
import { DoctorStats } from "@/components/medix/doctor/doctor-stats";

export default function DoctorDashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Doctor Dashboard</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p>--</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="md:grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <DoctorAppointments />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <DoctorCalendar />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="md:grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Today's Patients</CardTitle>
                </CardHeader>
                <CardContent className="!pt-0">
                  <DoctorPatients />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Patient Notes</CardTitle>
                </CardHeader>
                <CardContent className="!pt-0">
                  <PatientNotes />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="md:grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <DoctorTasks />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentPrescriptions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorStats />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
