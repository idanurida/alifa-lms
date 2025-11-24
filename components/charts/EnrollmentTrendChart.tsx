// components/charts/EnrollmentTrendChart.tsx
'use client';

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EnrollmentTrendData {
  month: string;
  enrolled: number;
  dropped: number;
}

interface EnrollmentTrendChartProps {
  data: EnrollmentTrendData[];
}

export default function EnrollmentTrendChart({ data }: EnrollmentTrendChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDropped" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff7300" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'enrolled') return [value, 'Ambil KRS'];
              if (name === 'dropped') return [value, 'Drop Kelas'];
              return [value, name];
            }}
            labelFormatter={(label) => `Bulan: ${label}`}
          />
          <Area yAxisId="left" type="monotone" dataKey="enrolled" name="Ambil KRS" stroke="#8884d8" fillOpacity={1} fill="url(#colorEnrolled)" />
          <Area yAxisId="left" type="monotone" dataKey="dropped" name="Drop Kelas" stroke="#ff7300" fillOpacity={1} fill="url(#colorDropped)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}