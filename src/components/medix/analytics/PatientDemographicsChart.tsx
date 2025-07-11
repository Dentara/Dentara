"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

export default function PatientDemographicsChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/clinic/analytics/patient-demographics")
      .then((res) => res.json())
      .then((data) => setData(data))
  }, [])

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="ageGroup" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="male" fill="#2563eb" name="Male" />
        <Bar dataKey="female" fill="#ec4899" name="Female" />
      </BarChart>
    </ResponsiveContainer>
  )
}
