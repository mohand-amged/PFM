'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface SpendingChartProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919']

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
  }

  return (
    <div className="w-full h-64 sm:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              if (value >= 1000) return `$${(value/1000).toFixed(0)}k`;
              return `$${value}`;
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`]} 
            labelFormatter={(name) => `Category: ${name}`}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            name="Spending" 
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SpendingChart
