"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

export default function DentalChartPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Dental Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h4 className="text-muted-foreground font-medium mb-2">Upper Arch</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {upperTeeth.map((tooth) => (
                <Badge key={tooth} variant="secondary" className="w-10 justify-center">
                  {tooth}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-muted-foreground font-medium mb-2">Lower Arch</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {lowerTeeth.map((tooth) => (
                <Badge key={tooth} variant="secondary" className="w-10 justify-center">
                  {tooth}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
