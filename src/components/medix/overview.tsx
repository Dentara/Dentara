"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

export function Overview() {
  const [chartHeight, setChartHeight] = useState(350)
  const [chartWidth, setChartWidth] = useState('100%')
  const [data, setData] = useState([])

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setChartHeight(200)
        setChartWidth(width - 40 as unknown as string)
      } else if (width < 1024) {
        setChartHeight(300)
        setChartWidth('100%')
      } else {
        setChartHeight(350)
        setChartWidth('100%')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetch("/api/clinic/stats/monthly")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Failed to fetch overview data", err))
  }, [])

  return (   
    <ResponsiveContainer width={chartWidth} height={chartHeight}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} className="fill-blue-600" />
        <Bar dataKey="patients" fill="#4ade80" radius={[4, 4, 0, 0]} className="fill-green-600" />
      </BarChart>
    </ResponsiveContainer>    
  )
}
