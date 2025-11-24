// components/progress/AcademicProgressChart.tsx
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AcademicProgressData {
  semester: string;
  credits: number;
  gpa: number;
}

interface AcademicProgressChartProps {
  data: AcademicProgressData[];
}

export default function AcademicProgressChart({ data }: AcademicProgressChartProps) {
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
          <XAxis dataKey="semester" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'gpa') return [value, 'IPK'];
              if (name === 'credits') return [value, 'SKS'];
              return [value, name];
            }}
            labelFormatter={(label) => `Semester ${label}`}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="gpa" name="IPK" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="credits" name="SKS Lulus" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}