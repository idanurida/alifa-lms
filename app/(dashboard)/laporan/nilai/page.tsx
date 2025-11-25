// app/(dashboard)/laporan/nilai/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function LaporanNilaiPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data: any[] = [];
  // Contoh query untuk mendapatkan nilai akhir per mahasiswa per kelas
  // Query ini kompleks dan tergantung bagaimana nilai dihitung dari komponen-komponen
  try {
    const result = await sql`
      SELECT 
        s.nim, s.name as student_name,
        c.class_code, co.name as course_name,
        se.final_grade, se.final_score
      FROM student_enrollments se
      JOIN students s ON se.student_id = s.id
      JOIN classes c ON se.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE se.final_grade IS NOT NULL -- Hanya tampilkan yang sudah ada nilainya
      ORDER BY s.nim, c.class_code
    `;
    data = result;
  } catch (error) {
    console.error('Failed to fetch grade report data:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Laporan</p>
        <p className="text-muted-foreground text-sm">
          Laporan Nilai Mahasiswa
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan Nilai</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor ke Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">NIM</th>
                  <th className="text-left p-2">Nama</th>
                  <th className="text-left p-2">Kode Kelas</th>
                  <th className="text-left p-2">Mata Kuliah</th>
                  <th className="text-left p-2">Nilai Akhir</th>
                  <th className="text-left p-2">Skor Akhir</th>
                </tr>
              </thead>
              <tbody>
                {data.map((grade: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{grade.nim}</td>
                    <td className="p-2 font-medium">{grade.student_name}</td>
                    <td className="p-2 font-mono">{grade.class_code}</td>
                    <td className="p-2">{grade.course_name}</td>
                    <td className="p-2 font-bold">{grade.final_grade}</td>
                    <td className="p-2">{grade.final_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
