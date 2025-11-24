// app/(dashboard)/staff-keuangan/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, TrendingUp, CheckCircle, AlertTriangle, Users, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

export default function StaffKeuanganDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Dashboard Staff Keuangan</h1>
        <p className="text-muted-foreground">
          Selamat datang, {session?.user?.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 2.4M</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tunggakan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 480Jt</div>
            <p className="text-xs text-muted-foreground">Perlu penagihan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Rate pembayaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifikasi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Menunggu</p>
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
            <Link href="/keuangan" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Manajemen Keuangan</span>
              </div>
              <p className="text-sm text-muted-foreground">Kelola semua modul keuangan</p>
            </Link>

            <Link href="/keuangan/bukti-transfer" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium">Bukti Transfer</span>
              </div>
              <p className="text-sm text-muted-foreground">Daftar bukti transfer</p>
            </Link>

            <Link href="/keuangan/verifikasi" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Verifikasi</span>
              </div>
              <p className="text-sm text-muted-foreground">Antrian verifikasi</p>
            </Link>

            <Link href="/laporan" className="text-left p-4 border rounded-lg hover:bg-muted transition-colors block">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Laporan Keuangan</span>
              </div>
              <p className="text-sm text-muted-foreground">Akses laporan pembayaran</p>
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
            <CardTitle>Pembayaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Ahmad Rizki', amount: 'Rp 7.500.000', status: 'Lunas', date: '2 jam lalu' },
                { name: 'Sari Dewi', amount: 'Rp 7.500.000', status: 'Lunas', date: '5 jam lalu' },
                { name: 'Budi Santoso', amount: 'Rp 3.750.000', status: 'DP', date: '1 hari lalu' }
              ].map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{payment.name}</div>
                    <div className="text-sm text-muted-foreground">{payment.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{payment.amount}</div>
                    <div className="text-sm text-green-600">{payment.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Lunas</span>
                <span className="font-medium">1,024 (89%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              
              <div className="flex justify-between">
                <span>DP</span>
                <span className="font-medium">78 (7%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '7%' }}></div>
              </div>
              
              <div className="flex justify-between">
                <span>Belum Bayar</span>
                <span className="font-medium">42 (4%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '4%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}