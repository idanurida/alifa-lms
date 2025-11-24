// app/(dashboard)/akademik/kalender-akademik/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function KalenderAkademikPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let data = [];
  try {
    const result = await sql`SELECT * FROM academic_periods ORDER BY year DESC, semester ASC`;
    data = result;
  } catch (error) {
    console.error('Failed to fetch academic periods:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Manajemen Kalender Akademik</p>
        <p className="text-muted-foreground text-sm">
          Periode akademik, jadwal UTS/UAS.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Kalender Akademik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((period: any) => (
              <div key={period.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{period.name}</h3>
                    <p className="text-sm text-muted-foreground">{period.code}</p>
                  </div>
                  <Badge variant={period.is_active ? 'default' : 'secondary'}>
                    {period.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tahun</p>
                    <p>{period.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Semester</p>
                    <p>{period.semester === 1 ? 'Ganjil' : 'Genap'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mulai</p>
                    <p>{new Date(period.start_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Selesai</p>
                    <p>{new Date(period.end_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">UTS Minggu ke-</p>
                    <p>{period.uts_week}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">UAS Minggu ke-</p>
                    <p>{period.uas_week}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}