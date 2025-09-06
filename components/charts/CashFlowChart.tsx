'use client';

import React from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface CashFlowData {
  period: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
  height?: number;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, height = 400 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No cash flow data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toLocaleString('en-US', { 
                minimumFractionDigits: 2 
              })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => {
              if (Math.abs(value) >= 1000) {
                return `$${(value / 1000).toFixed(0)}k`;
              }
              return `$${value}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Zero line reference */}
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
          
          {/* Income bars */}
          <Bar 
            dataKey="income" 
            fill="#10b981" 
            name="Income"
            radius={[2, 2, 0, 0]}
          />
          
          {/* Expenses bars */}
          <Bar 
            dataKey="expenses" 
            fill="#ef4444" 
            name="Expenses"
            radius={[2, 2, 0, 0]}
          />
          
          {/* Net cash flow area */}
          <Area
            type="monotone"
            dataKey="netCashFlow"
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#3b82f6"
            strokeWidth={2}
            name="Net Cash Flow"
          />
          
          {/* Cumulative cash flow line */}
          <Area
            type="monotone"
            dataKey="cumulativeCashFlow"
            fill="#8b5cf6"
            fillOpacity={0.2}
            stroke="#8b5cf6"
            strokeWidth={3}
            name="Cumulative Cash Flow"
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
