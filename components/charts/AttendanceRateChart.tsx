// components/charts/AttendanceRateChart.tsx
use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface AttendanceRateData {
  subject: string;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

interface AttendanceRateChartProps {
  data: AttendanceRateData[];
}

export default function AttendanceRateChart({ data }: AttendanceRateChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#ccc" opacity={0.3} />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar name="Hadir" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Radar name="Izin" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          <Radar name="Sakit" dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
          <Radar name="Alpha" dataKey="D" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
          <Radar name="Terlambat" dataKey="E" stroke="#ff6666" fill="#ff6666" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}