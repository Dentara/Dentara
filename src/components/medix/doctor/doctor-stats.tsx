"use client";

import { ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DoctorStats({ visitsData = [], satisfactionData = [] }: { visitsData?: any[]; satisfactionData?: any[] }) {
  // real statistik data gələcəkdə props və ya backend ilə gələcək

  return (
    <Tabs defaultValue="visits">
      <TabsList>
        <TabsTrigger value="visits">Patient Visits</TabsTrigger>
        <TabsTrigger value="satisfaction">Patient Satisfaction</TabsTrigger>
      </TabsList>

      <TabsContent value="visits" className="space-y-4">
        <div className="w-full h-[300px] min-w-0 flex items-center justify-center text-muted-foreground">
          {visitsData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* BarChart burada olacaq */}
            </ResponsiveContainer>
          ) : (
            <span>No visits data</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Daily</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Yearly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">--</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="satisfaction" className="space-y-4">
        <div className="w-full h-[300px] min-w-0 flex items-center justify-center text-muted-foreground">
          {satisfactionData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* LineChart burada olacaq */}
            </ResponsiveContainer>
          ) : (
            <span>No satisfaction data</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">--</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">--</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
