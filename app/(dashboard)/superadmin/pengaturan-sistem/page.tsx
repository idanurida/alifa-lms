// app/(dashboard)/superadmin/pengaturan-sistem/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Database, Activity, FileText, Save } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function PengaturanSistemPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') {
    return <div>Unauthorized</div>;
  }

  // Ambil konfigurasi sistem dari database atau environment
  // Contoh sederhana: status sistem, versi, dll
  const systemConfig = {
    systemName: "ALIFA Institute LMS",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL ? "Configured" : "Not Set",
    maxFileSize: "10MB",
    allowedFileTypes: "image/*, .pdf, .doc, .docx",
    smtpConfigured: !!process.env.SMTP_HOST,
  };

  // Server Action untuk backup
  const performBackup = async () => {
    'use server'
    const currentSession = await getServerSession(authOptions);
    if (!currentSession || currentSession.user.role !== 'super_admin') {
      // Handle unauthorized
      return;
    }
    // Logika backup disini (misalnya dump database)
    console.log("Backup process started...");
    // Simulasi
    // const dump = await sql.unsafe("SELECT * FROM pg_dump ...");
    // fs.writeFileSync("backup.sql", dump);
    // toast.success("Backup completed successfully.");
  };

  // Server Action untuk clear cache (contoh)
  const clearCache = async () => {
    'use server'
    const currentSession = await getServerSession(authOptions);
    if (!currentSession || currentSession.user.role !== 'super_admin') {
      // Handle unauthorized
      return;
    }
    // Logika clear cache disini (misalnya Redis, Next.js cache)
    console.log("Cache cleared.");
    // Misalnya: await redis.flushall();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Super Admin Dashboard</p>
        <p className="text-muted-foreground text-sm">
          Pengaturan Sistem Global
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={18} />
            Konfigurasi Umum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Sistem</p>
              <p>{systemConfig.systemName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Versi</p>
              <p>{systemConfig.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Environment</p>
              <Badge variant={systemConfig.environment === 'production' ? 'destructive' : 'secondary'}>
                {systemConfig.environment}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Database</p>
              <p>{systemConfig.databaseUrl}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ukuran Maks. File Upload</p>
              <p>{systemConfig.maxFileSize}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jenis File Diizinkan</p>
              <p>{systemConfig.allowedFileTypes}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SMTP Terkonfigurasi</p>
              <Badge variant={systemConfig.smtpConfigured ? 'default' : 'destructive'}>
                {systemConfig.smtpConfigured ? 'Ya' : 'Tidak'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={18} />
            Manajemen Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form action={performBackup}>
              <Button variant="outline" type="submit">
                <FileText size={16} className="mr-2" />
                Backup Database
              </Button>
            </form>
            <form action={clearCache}>
              <Button variant="outline" type="submit">
                <Activity size={16} className="mr-2" />
                Clear Cache
              </Button>
            </form>
          </div>
          <p className="text-sm text-muted-foreground">
            Gunakan dengan hati-hati. Backup database secara berkala sangat disarankan sebelum melakukan perubahan besar.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={18} />
            Audit Log & Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fitur ini akan menampilkan log aktivitas pengguna dan sistem. Implementasi memerlukan tabel log tambahan.</p>
          <Button className="mt-4" variant="outline">
            Lihat Log Aktivitas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}