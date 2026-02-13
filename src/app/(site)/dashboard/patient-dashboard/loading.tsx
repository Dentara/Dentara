import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shell } from "@/components/medix/shell";

export default function PatientDashboardLoading() {
  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="mt-2 h-4 w-[200px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[130px]" />
            <Skeleton className="h-9 w-[130px]" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-4 w-[100px] mb-4" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
