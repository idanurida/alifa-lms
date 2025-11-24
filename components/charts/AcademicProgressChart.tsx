// components/charts/AcademicProgressChart.tsx

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* Sumbu X untuk Semester */}
        <XAxis dataKey="semester" />

        {/* 1. Sumbu Y Kiri untuk IPK (Skala 0 - 4.0) */}
        <YAxis 
          yAxisId="ipk" 
          orientation="left" 
          domain={[0, 4]} // Skala wajib 0 sampai 4 untuk IPK
          stroke="#8884d8"
          label={{ value: 'IPK (0-4.0)', angle: -90, position: 'insideLeft' }}
        />

        {/* 2. Sumbu Y Kanan untuk SKS (Skala SKS/Semester) */}
        <YAxis 
          yAxisId="sks" 
          orientation="right" 
          stroke="#82ca9d" 
          label={{ value: 'Total SKS', angle: 90, position: 'insideRight' }}
        />
        
        <Tooltip />
        <Legend />
        
        {/* Bar untuk IPK - Menggunakan Sumbu Y Kiri (id="ipk") */}
        <Bar yAxisId="ipk" dataKey="ipk" name="IPK Semester" fill="#8884d8" />
        
        {/* Bar untuk SKS - Menggunakan Sumbu Y Kanan (id="sks") */}
        <Bar yAxisId="sks" dataKey="sks" name="SKS Selesai" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}