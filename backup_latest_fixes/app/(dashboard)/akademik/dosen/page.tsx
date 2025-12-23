export const dynamic = 'force-dynamic'

// app/(dashboard)/akademik/dosen/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import DosenTable from '@/components/tables/DosenTable';

export default async function DosenPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return (
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
          <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
        </div>
      );
    }

    if (!['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
      return (
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-muted-foreground">Role {session.user.role} tidak memiliki akses ke halaman ini.</p>
        </div>
      );
    }

    let data: any[] = [];
    try {
      console.log('🔍 Fetching lecturers data...');
      const result = await sql`
        SELECT 
          l.id, 
          l.user_id, 
          l.nidn, 
          l.name, 
          l.expertise,
          u.email, 
          u.is_active,
          COUNT(DISTINCT c.id) as total_classes
        FROM lecturers l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN classes c ON l.id = c.lecturer_id
        GROUP BY l.id, l.user_id, l.nidn, l.name, l.expertise, u.email, u.is_active
        ORDER BY l.name
      `;

      console.log('✅ Data fetched:', result.length, 'records');

      data = result.map(row => ({
        id: row.id,
        user_id: row.user_id,
        nidn: row.nidn,
        name: row.name,
        expertise: row.expertise || 'Tidak ditentukan',
        email: row.email,
        is_active: row.is_active,
        total_classes: parseInt(row.total_classes) || 0
      }));

    } catch (error) {
      console.error('❌ Failed to fetch lecturers:', error);
      // Fallback data untuk development
      data = [
        {
          id: 1,
          user_id: 1,
          nidn: '0023056601',
          name: 'Dr. Ahmad S.T., M.T.',
          expertise: 'Pemrograman Web',
          email: 'ahmad@alifa.ac.id',
          is_active: true,
          total_classes: 3
        },
        {
          id: 2,
          user_id: 2,
          nidn: '0023056602',
          name: 'Dr. Siti M.Kom.',
          expertise: 'Basis Data',
          email: 'siti@alifa.ac.id',
          is_active: true,
          total_classes: 2
        }
      ];
    }

    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Manajemen Dosen</h1>
            <p className="text-muted-foreground text-sm">
              Daftar dosen, profil, dan kelas yang diampu. Total: {data.length} dosen
            </p>
          </div>
          <Button asChild>
            <Link href="/akademik/dosen/tambah">
              <Plus size={16} className="mr-2" />
              Tambah Dosen
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Dosen</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.length}</div>
              <p className="text-xs text-muted-foreground">Terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dosen Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.filter(d => d.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Sedang mengajar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.reduce((sum, d) => sum + d.total_classes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Kelas aktif</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Dosen</CardTitle>
          </CardHeader>
          <CardContent>
            <DosenTable data={data} />
          </CardContent>
        </Card>
      </div>
    );

  } catch (error) {
    console.error('❌ Error in DosenPage:', error);
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-muted-foreground">Terjadi kesalahan saat memuat halaman.</p>
        <pre className="mt-4 text-sm text-left bg-gray-100 p-4 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
