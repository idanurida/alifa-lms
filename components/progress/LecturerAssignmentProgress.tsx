// components/progress/LecturerAssignmentProgress.tsx
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LecturerClassProgress {
  class_code: string;
  syllabus: number;
  materials: number;
  evaluation: number;
  attendance: number;
  grades: number;
}

interface LecturerAssignmentProgressProps {
  data: LecturerClassProgress[];
}

export default function LecturerAssignmentProgress({ data }: LecturerAssignmentProgressProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="class_code" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Progress']}
            labelFormatter={(label) => `Kelas: ${label}`}
          />
          <Legend />
          <Line type="monotone" dataKey="syllabus" name="Silabus" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="materials" name="Materi" stroke="#82ca9d" />
          <Line type="monotone" dataKey="evaluation" name="Penilaian" stroke="#ffc658" />
          <Line type="monotone" dataKey="attendance" name="Presensi" stroke="#ff7300" />
          <Line type="monotone" dataKey="grades" name="Nilai" stroke="#00d0ff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}