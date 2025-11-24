// components/charts/GradeDistributionChart.tsx

'use client'; // 

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definisi Tipe Data (sesuaikan dengan data statistik nilai Anda)
interface GradeData {
  grade: string;
  count: number;
}

// Contoh data dummy (Anda akan menggantinya dengan data yang diambil dari API)
const dummyData: GradeData[] = [
  { grade: 'A', count: 15 },
  { grade: 'B', count: 45 },
  { grade: 'C', count: 30 },
  { grade: 'D', count: 5 },
  { grade: 'E', count: 2 }
];

interface GradeDistributionChartProps {
  data?: GradeData[]; // Menerima data sebagai prop
}

const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ data = dummyData }) => {
  return (
    <div className="h-[300px] w-full">
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Jumlah Mahasiswa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradeDistributionChart;