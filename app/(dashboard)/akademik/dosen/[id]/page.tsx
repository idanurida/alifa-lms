import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, GraduationCap, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';

// HAPUS 'use client' - File ini adalah Server Component

interface Lecturer {
  id: number;
  user_id: string;
  nidn: string;
  name: string;
  email: string;
  phone: string | null;
  expertise: string | null;
  status: string;
  is_active: boolean;
}

export default async function DetailDosenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);

  // Authorization logic
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
          <p className="text-muted-foreground mt-2">Silakan login untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  const id = parseInt(idParam);
  if (isNaN(id)) notFound();

  let dosen: Lecturer;
  try {
    const result = await sql`
      SELECT 
        l.id, l.user_id, l.nidn, l.name, l.email, l.phone, l.expertise, l.status,
        u.is_active
      FROM lecturers l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ${id}
    `;

    // PERBAIKAN: Handle array result dengan benar
    if (!result || result.length === 0) {
      notFound();
    }

    dosen = result[0] as Lecturer;
  } catch (error) {
    console.error('Failed to fetch lecturer:', error);
    notFound();
  }

  // Check permissions: Dosen hanya bisa melihat profilnya sendiri
  if (session.user.role === 'dosen' && dosen.user_id !== session.user.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-muted-foreground mt-2">
            Anda hanya dapat melihat profil sendiri.
          </p>
        </div>
      </div>
    );
  }

  // Check permissions: Hanya Super Admin, Staff, dan Dosen (sesuai ID) yang boleh mengakses
  const allowedRoles = ['super_admin', 'staff_akademik', 'dosen'];
  if (!allowedRoles.includes(session.user.role as string)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="text-muted-foreground mt-2">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  // Menampilkan nama dosen jika user adalah super_admin atau staff_akademik
  const displayName = dosen.name;

  // Helper function untuk status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { variant: "default" | "secondary" | "outline" | "destructive", className: string } } = {
      'aktif': { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white" },
      'non-aktif': { variant: "secondary", className: "bg-red-500 hover:bg-red-600 text-white" },
      'cuti': { variant: "outline", className: "bg-yellow-500 hover:bg-yellow-600 text-white" }
    };

    const config = statusConfig[status] || { variant: "outline", className: "" };

    return (
      <Badge variant={config.variant} className={`capitalize ${config.className}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Detail Dosen: {displayName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Informasi lengkap profil dosen
          </p>
        </div>

        {/* Tombol Edit hanya untuk Super Admin */}
        {session.user.role === 'super_admin' && (
          <Link href={`/akademik/dosen/edit/${dosen.id}`}>
            <Button variant="secondary" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profil
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 shadow-lg bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informasi Utama
            </CardTitle>
            <Badge
              variant={dosen.is_active ? "default" : "secondary"}
              className={dosen.is_active
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
              }
            >
              {dosen.is_active ? 'Aktif' : 'Non-Aktif'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">NIDN</p>
              <p className="text-lg font-bold text-foreground">{dosen.nidn}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status Dosen</p>
              <div className="mt-1">
                {getStatusBadge(dosen.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact and Expertise Info */}
        <Card className="lg:col-span-2 shadow-lg bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-card-foreground">
              Kontak dan Keahlian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground font-medium break-all">{dosen.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Nomor Telepon</p>
                <p className="text-foreground font-medium">
                  {dosen.phone || (
                    <span className="text-muted-foreground italic">Tidak tersedia</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Bidang Keahlian</p>
                <p className="text-foreground font-medium">
                  {dosen.expertise || (
                    <span className="text-muted-foreground italic">Belum diisi</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for Teaching History/Classes */}
      <Card className="shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Riwayat Mengajar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Daftar mata kuliah yang pernah atau sedang diajar oleh dosen ini akan muncul di sini.
            </p>
            <Button variant="outline" className="mt-4" disabled>
              Lihat Riwayat Mengajar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}