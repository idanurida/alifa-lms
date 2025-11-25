'use client';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
}

interface AttendanceRateChartProps {
  data: AttendanceData[];
}

export default function AttendanceRateChart({ data }: AttendanceRateChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Persentase']}
          />
          <Legend />
          <Bar dataKey="present" name="Hadir" fill="#82ca9d" />
          <Bar dataKey="absent" name="Tidak Hadir" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
