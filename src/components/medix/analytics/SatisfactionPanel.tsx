"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

export default function SatisfactionPanel() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/clinic/analytics/patient-satisfaction")
      .then((res) => res.json())
      .then((data) => setData(data))
  }, [])

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>{item.title}</span>
            <span>{item.value}%</span>
          </div>
          <Progress value={item.value} className="h-2 [&>*]:bg-green-500" />
        </div>
      ))}
    </div>
  )
}
