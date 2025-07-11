"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function StaffPerformancePanel() {
  const [staff, setStaff] = useState([])

  useEffect(() => {
    fetch("/api/clinic/analytics/staff-performance")
      .then((res) => res.json())
      .then((data) => setStaff(data))
  }, [])

  return (
    <div className="space-y-4">
      {staff.map((person, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{person.name.split(" ")[1]?.[0] || person.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-xs text-muted-foreground">{person.role}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{person.patients} patients</p>
            <p className="text-xs text-muted-foreground">Rating: {person.rating}/5</p>
          </div>
        </div>
      ))}
    </div>
  )
}
