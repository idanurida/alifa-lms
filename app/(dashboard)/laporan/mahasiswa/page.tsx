// app/(dashboard)/laporan/mahasiswa/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function LaporanMahasiswaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data: any[] = [];
  try {
    const result = await sql`
      SELECT 
        s.nim, s.name, s.email, s.phone, s.status, s.year_entry,
        sp.name as study_program_name, sp.code as study_program_code,
        'Kurikulum Default' as curriculum_name
      FROM students s
      LEFT JOIN study_programs sp ON s.study_program_num_id = sp.id
      ORDER BY s.nim
    `;
    data = result;
  } catch (error) {
    console.error('Failed to fetch student report data:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Laporan</p>
        <p className="text-muted-foreground text-sm">
          Laporan Daftar Mahasiswa
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan Mahasiswa</CardTitle>
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
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Prodi</th>
                  <th className="text-left p-2">Kurikulum</th>
                  <th className="text-left p-2">Angkatan</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((mhs: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-mono">{mhs.nim}</td>
                    <td className="p-2 font-medium">{mhs.name}</td>
                    <td className="p-2">{mhs.email}</td>
                    <td className="p-2">
                      <span className="text-xs px-2 py-1 bg-muted rounded">
                        {mhs.study_program_code}
                      </span>
                    </td>
                    <td className="p-2">{mhs.curriculum_name}</td>
                    <td className="p-2">{mhs.year_entry}</td>
                    <td className="p-2">{mhs.status}</td>
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
