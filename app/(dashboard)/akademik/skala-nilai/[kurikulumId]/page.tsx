// app/(dashboard)/akademik/skala-nilai/[kurikulumId]/page.tsx
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function SkalaNilaiPage({ params }: { params: { kurikulumId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>
          <p className="text-muted-foreground mt-2">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const kurikulumId = parseInt(params.kurikulumId);
  if (isNaN(kurikulumId)) notFound();

  let kurikulum, gradeScales;
  
  try {
    // Ambil data kurikulum dengan join study_programs
    const [curriculumResult] = await sql`
      SELECT 
        c.id, 
        c.name, 
        c.code, 
        c.total_credits,
        c.is_active,
        c.created_at,
        sp.name as study_program_name,
        sp.id as study_program_id
      FROM curricula c
      LEFT JOIN study_programs sp ON c.study_program_id = sp.id
      WHERE c.id = ${kurikulumId}
    `;
    
    kurikulum = curriculumResult;
    if (!kurikulum) notFound();

    // Ambil data grade_scales sesuai struktur database
    gradeScales = await sql`
      SELECT 
        id,
        curriculum_id,
        grade_char,
        grade_value,
        min_score,
        max_score,
        description
      FROM grade_scales 
      WHERE curriculum_id = ${kurikulumId} 
      ORDER BY min_score DESC
    `;

  } catch (error) {
    console.error('Failed to fetch data:', error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Skala Nilai</h1>
          <p className="text-muted-foreground">
            Kelola skala penilaian untuk {kurikulum.name}
            {kurikulum.study_program_name && ` - ${kurikulum.study_program_name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/akademik/kurikulum`}>
              Kembali ke Kurikulum
            </Link>
          </Button>
          {['super_admin', 'staff_akademik'].includes(session.user.role as string) && (
            <Button asChild>
              <Link href={`/akademik/skala-nilai/${kurikulumId}/tambah`}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Skala
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Info Kurikulum */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kurikulum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama Kurikulum</p>
              <p className="font-semibold">{kurikulum.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kode</p>
              <p className="font-mono font-semibold">{kurikulum.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total SKS</p>
              <p className="font-semibold">{kurikulum.total_credits || 144}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={kurikulum.is_active ? "default" : "secondary"}>
                {kurikulum.is_active ? "Aktif" : "Non-Aktif"}
              </Badge>
            </div>
            {kurikulum.study_program_name && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Program Studi</p>
                <p className="font-semibold">{kurikulum.study_program_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabel Skala Nilai */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tabel Skala Nilai</CardTitle>
          <Badge variant="outline">
            {gradeScales.length} skala nilai
          </Badge>
        </CardHeader>
        <CardContent>
          {gradeScales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">
                <FileText className="h-12 w-12 mx-auto text-gray-300" />
              </div>
              <p className="text-lg font-medium mb-2">Belum ada skala nilai</p>
              <p className="text-sm mb-4">
                Tambah skala nilai untuk menentukan konversi nilai huruf dan angka.
              </p>
              {['super_admin', 'staff_akademik'].includes(session.user.role as string) && (
                <Button asChild>
                  <Link href={`/akademik/skala-nilai/${kurikulumId}/tambah`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Skala Nilai Pertama
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Huruf</th>
                    <th className="text-left p-4 font-medium">Nilai Angka</th>
                    <th className="text-left p-4 font-medium">Rentang Nilai</th>
                    <th className="text-left p-4 font-medium">Deskripsi</th>
                    {['super_admin', 'staff_akademik'].includes(session.user.role as string) && (
                      <th className="text-left p-4 font-medium">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {gradeScales.map((scale: any) => (
                    <tr key={scale.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-lg text-center">{scale.grade_char}</td>
                      <td className="p-4 font-mono font-medium text-center">{scale.grade_value}</td>
                      <td className="p-4 text-center">
                        <span className="font-medium">
                          {scale.min_score} - {scale.max_score || '100'}
                        </span>
                      </td>
                      <td className="p-4">{scale.description || '-'}</td>
                      {['super_admin', 'staff_akademik'].includes(session.user.role as string) && (
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/akademik/skala-nilai/${kurikulumId}/edit/${scale.id}`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informasi Sistem Penilaian */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-300 text-lg">
            Panduan Skala Nilai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Ketentuan Umum</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Skala nilai menentukan konversi nilai angka ke huruf</li>
                <li>• Rentang nilai harus berurutan dan tidak tumpang tindih</li>
                <li>• Nilai huruf A biasanya untuk nilai 85-100</li>
                <li>• Nilai E untuk nilai di bawah 50 (gagal)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Penggunaan</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Digunakan untuk menghitung IPK mahasiswa</li>
                <li>• Berlaku untuk semua mata kuliah dalam kurikulum</li>
                <li>• Dapat berbeda antar kurikulum</li>
                <li>• Pastikan konsisten dengan kebijakan institusi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}