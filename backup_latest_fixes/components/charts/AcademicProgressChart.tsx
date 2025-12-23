// components/charts/AcademicProgressChart.tsx

'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

interface AcademicProgressData {
  semester_label: string;
  credits_completed: number;
  semester_gpa: number;
}

interface AcademicProgressChartProps {
  data: AcademicProgressData[];
}

export default function AcademicProgressChart({ data }: AcademicProgressChartProps) {
  // Format data untuk chart
  const chartData = data.map(item => ({
    semester: item.semester_label,
    sks: item.credits_completed,
    ipk: item.semester_gpa // Skala 0 - 4.0
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm" style={{ color: entry.color }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorIpk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorSks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
          
          <XAxis 
            dataKey="semester" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748B', fontSize: 12 }}
            dy={10}
          />

          <YAxis 
            yAxisId="ipk" 
            orientation="left" 
            domain={[0, 4]} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8B5CF6', fontSize: 12 }}
            label={{ value: 'IPK', angle: -90, position: 'insideLeft', fill: '#8B5CF6', fontSize: 12, fontWeight: 600 }}
          />

          <YAxis 
            yAxisId="sks" 
            orientation="right" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#3ECF8E', fontSize: 12 }}
            label={{ value: 'SKS', angle: 90, position: 'insideRight', fill: '#3ECF8E', fontSize: 12, fontWeight: 600 }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle" 
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }}
          />
          
          <Bar 
            yAxisId="ipk" 
            dataKey="ipk" 
            name="IPK Semester" 
            fill="url(#colorIpk)" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
          />
          
          <Bar 
            yAxisId="sks" 
            dataKey="sks" 
            name="SKS Selesai" 
            fill="url(#colorSks)" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}