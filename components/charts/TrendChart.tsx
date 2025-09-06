'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  subscriptions: number;
}

interface TrendChartProps {
  data: TrendData[];
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No trend data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4, fill: '#ef4444' }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="subscriptions"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
            name="Subscriptions"
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8b5cf6' }}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
            name="Savings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
