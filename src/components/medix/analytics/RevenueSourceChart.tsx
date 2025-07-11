"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function RevenueSourceChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/clinic/analytics/revenue-sources")
      .then((res) => res.json())
      .then((data) => setData(data))
  }, [])

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart layout="vertical" data={data}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip />
        <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
