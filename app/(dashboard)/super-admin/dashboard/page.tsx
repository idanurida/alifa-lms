// app/(dashboard)/super-admin/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, DollarSign, Settings, Activity, Shield, Database, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>
        <p className="text-muted-foreground">
          Selamat datang, {session?.user?.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,458</div>
            <p className="text-xs text-muted-foreground">Aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 8.2M</div>
            <p className="text-xs text-muted-foreground">Tahun ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivitas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/superadmin" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Manajemen Sistem</span>
              </div>
              <p className="text-sm text-muted-foreground">Akses semua fitur super admin</p>
            </Link>

            <Link href="/superadmin/pengaturan-sistem" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-green-600" />
                <span className="font-medium">Pengaturan Sistem</span>
              </div>
              <p className="text-sm text-muted-foreground">Konfigurasi & backup</p>
            </Link>

            <Link href="/akademik" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Manajemen Akademik</span>
              </div>
              <p className="text-sm text-muted-foreground">Kelola data akademik</p>
            </Link>

            <Link href="/keuangan" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Manajemen Keuangan</span>
              </div>
              <p className="text-sm text-muted-foreground">Kelola keuangan & pembayaran</p>
            </Link>

            <Link href="/laporan" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                <span className="font-medium">Semua Laporan</span>
              </div>
              <p className="text-sm text-muted-foreground">Akses laporan lengkap</p>
            </Link>

            <Link href="/pengaturan" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Pengaturan</span>
              </div>
              <p className="text-sm text-muted-foreground">Profil dan keamanan akun</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Mahasiswa', count: '1,248', status: 'Aktif' },
                { category: 'Dosen', count: '84', status: 'Aktif' },
                { category: 'Staff Akademik', count: '12', status: 'Aktif' },
                { category: 'Staff Keuangan', count: '8', status: 'Aktif' },
                { category: 'Mata Kuliah', count: '156', status: 'Aktif' },
                { category: 'Kelas', count: '48', status: 'Berjalan' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="font-medium">{item.category}</div>
                  <div className="text-right">
                    <div>{item.count}</div>
                    <div className="text-sm text-green-600">{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'User admin login dari IP 192.168.1.100',
                'Update data mahasiswa oleh staff_akademik',
                'Verifikasi pembayaran oleh staff_keuangan',
                'Backup database otomatis',
                'Update sistem ke versi 2.1.0'
              ].map((log, index) => (
                <div key={index} className="text-sm p-2 border-l-4 border-gray-300 pl-3">
                  <div className="font-medium">{log}</div>
                  <div className="text-xs text-muted-foreground">5 menit lalu</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}