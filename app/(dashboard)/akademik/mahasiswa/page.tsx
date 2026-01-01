// app/(dashboard)/akademik/mahasiswa/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Filter,
  Download,
  Plus,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Mahasiswa {
  id: number;
  user_id: number | null;
  nama: string;
  nim: string;
  email: string;
  program_studi: string;
  semester: number;
  status: string;
  tanggal_daftar: string;
}

interface KRSSubmission {
  id: number;
  mahasiswa_id: number;
  semester: string;
  mata_kuliah: any[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  total_sks: number;
  catatan?: string;
  mahasiswa?: {
    nama: string;
    nim: string;
    program_studi: string;
  };
}

export default function ManajemenMahasiswaPage() {
  const { data: session } = useSession();
  const [tabAktif, setTabAktif] = useState('semua');
  const [pencarian, setPencarian] = useState('');
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [pengajuanKRS, setPengajuanKRS] = useState<KRSSubmission[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [filterProgramStudi, setFilterProgramStudi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (session?.user.role === 'staff_akademik' || session?.user.role === 'super_admin') {
      muatData();
    }
  }, [session]);

  const muatData = async () => {
    try {
      setSedangMemuat(true);

      const [responseMahasiswa, responseKRS] = await Promise.all([
        fetch('/api/akademik/mahasiswa'),
        fetch('/api/akademik/krs/pending')
      ]);

      if (responseMahasiswa.ok) {
        const data = await responseMahasiswa.json();
        setMahasiswa(data.data || []);
      }

      if (responseKRS.ok) {
        const data = await responseKRS.json();
        setPengajuanKRS(data.data || []);
      }
    } catch (error) {
      console.error('Gagal memuat data:', error);
      // Fallback data untuk development
      setMahasiswa(dapatkanMahasiswaFallback());
      setPengajuanKRS(dapatkanKRSFallback());
    } finally {
      setSedangMemuat(false);
    }
  };

  // Fallback data untuk development
  const dapatkanMahasiswaFallback = (): Mahasiswa[] => [
    {
      id: 1,
      user_id: 101,
      nama: 'Ahmad Wijaya',
      nim: '202401001',
      email: 'ahmad@email.com',
      program_studi: 'Teknik Informatika',
      semester: 3,
      status: 'active',
      tanggal_daftar: '2024-01-15'
    },
    {
      id: 2,
      user_id: null,
      nama: 'Sari Dewi',
      nim: '202401002',
      email: 'sari@email.com',
      program_studi: 'Sistem Informasi',
      semester: 2,
      status: 'active',
      tanggal_daftar: '2024-01-16'
    },
    {
      id: 3,
      user_id: 103,
      nama: 'Budi Santoso',
      nim: '202401003',
      email: 'budi@email.com',
      program_studi: 'Teknik Informatika',
      semester: 4,
      status: 'active',
      tanggal_daftar: '2024-01-17'
    }
  ];

  const dapatkanKRSFallback = (): KRSSubmission[] => [
    {
      id: 1,
      mahasiswa_id: 1,
      semester: '2024-1',
      mata_kuliah: [
        { mata_kuliah_id: 1, kode_mata_kuliah: 'CS101', nama_mata_kuliah: 'Pemrograman Dasar', sks: 3 },
        { mata_kuliah_id: 2, kode_mata_kuliah: 'MT201', nama_mata_kuliah: 'Kalkulus Lanjut', sks: 4 }
      ],
      status: 'pending',
      submitted_at: '2024-01-20T10:00:00Z',
      total_sks: 7,
      mahasiswa: {
        nama: 'Ahmad Wijaya',
        nim: '202401001',
        program_studi: 'Teknik Informatika'
      }
    },
    {
      id: 2,
      mahasiswa_id: 2,
      semester: '2024-1',
      mata_kuliah: [
        { mata_kuliah_id: 3, kode_mata_kuliah: 'FI301', nama_mata_kuliah: 'Fisika Dasar', sks: 3 }
      ],
      status: 'pending',
      submitted_at: '2024-01-19T14:30:00Z',
      total_sks: 3,
      mahasiswa: {
        nama: 'Sari Dewi',
        nim: '202401002',
        program_studi: 'Sistem Informasi'
      }
    }
  ];

  const pengajuanTertunda = pengajuanKRS.filter(krs => krs.status === 'pending');
  const pengajuanDisetujui = pengajuanKRS.filter(krs => krs.status === 'approved');
  const pengajuanDitolak = pengajuanKRS.filter(krs => krs.status === 'rejected');

  // Filter mahasiswa berdasarkan pencarian
  const mahasiswaTersaring = mahasiswa.filter(mhs =>
    mhs.nama.toLowerCase().includes(pencarian.toLowerCase()) ||
    mhs.nim.includes(pencarian) ||
    mhs.email.toLowerCase().includes(pencarian.toLowerCase())
  ).filter(mhs =>
    filterProgramStudi ? mhs.program_studi === filterProgramStudi : true
  ).filter(mhs =>
    filterStatus ? mhs.status === filterStatus : true
  );

  const programStudi = Array.from(new Set(mahasiswa.map(mhs => mhs.program_studi)));

  const prosesKRS = async (id: number, status: 'approved' | 'rejected', catatan?: string) => {
    try {
      const response = await fetch('/api/akademik/krs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          krs_id: id,
          status: status,
          catatan: catatan
        })
      });

      if (response.ok) {
        alert(`KRS berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
        muatData(); // Reload data
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal memproses KRS');
      }
    } catch (error) {
      console.error('Error memproses KRS:', error);
      alert('Terjadi kesalahan saat memproses KRS');
    }
  };

  const dapatkanBadgeStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Non-Aktif</Badge>;
      case 'graduated':
        return <Badge variant="outline">Lulus</Badge>;
      case 'dropped_out':
        return <Badge variant="destructive">Keluar</Badge>;
      case 'leave':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Cuti</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const dapatkanBadgeStatusKRS = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-sky-100 text-sky-800">
          <CheckCircle className="h-3 w-3 mr-1" />Disetujui
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />Ditolak
        </Badge>;
      default:
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />Menunggu
        </Badge>;
    }
  };

  if (sedangMemuat) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Mahasiswa</h1>
        <p className="text-muted-foreground">
          Kelola data mahasiswa dan persetujuan KRS
        </p>
      </div>

      {/* Statistik Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mahasiswa</p>
                <p className="text-2xl font-bold">{mahasiswa.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">KRS Menunggu</p>
                <p className="text-2xl font-bold">{pengajuanTertunda.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">KRS Disetujui</p>
                <p className="text-2xl font-bold">{pengajuanDisetujui.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">KRS Ditolak</p>
                <p className="text-2xl font-bold">{pengajuanDitolak.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tabAktif} onValueChange={setTabAktif} className="space-y-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="semua" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Semua Mahasiswa
            <Badge variant="secondary" className="ml-2">{mahasiswa.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="krs-pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            KRS Menunggu
            <Badge variant="secondary" className="ml-2">{pengajuanTertunda.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="riwayat-krs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Riwayat KRS
            <Badge variant="secondary" className="ml-2">{pengajuanKRS.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Semua Mahasiswa */}
        <TabsContent value="semua" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Daftar Mahasiswa</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari mahasiswa..."
                      className="pl-10"
                      value={pencarian}
                      onChange={(e) => setPencarian(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md text-sm"
                    value={filterProgramStudi}
                    onChange={(e) => setFilterProgramStudi(e.target.value)}
                  >
                    <option value="">Semua Program Studi</option>
                    {programStudi.map(prodi => (
                      <option key={prodi} value={prodi}>{prodi}</option>
                    ))}
                  </select>

                  <select
                    className="px-3 py-2 border rounded-md text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                    <option value="graduated">Lulus</option>
                    <option value="dropped_out">Dikeluarkan</option>
                    <option value="leave">Cuti</option>
                  </select>
                  <Button asChild>
                    <Link href="/akademik/mahasiswa/tambah">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mahasiswaTersaring.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada mahasiswa ditemukan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mahasiswaTersaring.map((mhs) => (
                    <div key={mhs.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center relative">
                          <User className="h-6 w-6 text-primary" />
                          {!mhs.user_id && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" title="Belum Aktivasi"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{mhs.nama}</h3>
                            {dapatkanBadgeStatus(mhs.status)}
                            {!mhs.user_id && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Belum Aktivasi</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {mhs.nim}
                            </span>
                            <span>{mhs.program_studi}</span>
                            <span>Semester {mhs.semester}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!mhs.user_id && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const url = `${window.location.origin}/auth/activate?id=${mhs.nim}`;
                              navigator.clipboard.writeText(url);
                              alert('Link aktivasi berhasil disalin ke clipboard!');
                            }}
                          >
                            Undang
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/akademik/mahasiswa/${mhs.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: KRS Menunggu Persetujuan */}
        <TabsContent value="krs-pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengajuan KRS Menunggu Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuanTertunda.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada pengajuan KRS yang menunggu persetujuan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pengajuanTertunda.map((krs) => (
                    <Card key={krs.id} className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{krs.mahasiswa?.nama}</h3>
                              <Badge variant="outline">{krs.mahasiswa?.nim}</Badge>
                              <Badge variant="secondary">{krs.mahasiswa?.program_studi}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Semester {krs.semester} • {krs.total_sks} SKS •
                              Diajukan {new Date(krs.submitted_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Menunggu
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {krs.mata_kuliah.map((mk, index) => (
                            <div key={index} className="text-sm p-2 bg-white border rounded">
                              <strong>{mk.kode_mata_kuliah}</strong> - {mk.nama_mata_kuliah} ({mk.sks} SKS)
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => prosesKRS(krs.id, 'approved')}
                            className="bg-sky-600 hover:bg-sky-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const catatan = prompt('Alasan penolakan:');
                              if (catatan !== null) {
                                prosesKRS(krs.id, 'rejected', catatan);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/akademik/mahasiswa/${krs.mahasiswa_id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Profil
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Riwayat KRS */}
        <TabsContent value="riwayat-krs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Semua Pengajuan KRS</CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuanKRS.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada riwayat pengajuan KRS</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pengajuanKRS.map((krs) => (
                    <Card key={krs.id} className={
                      krs.status === 'approved' ? 'bg-sky-50 border-sky-200' :
                        krs.status === 'rejected' ? 'bg-red-50 border-red-200' :
                          'bg-yellow-50 border-yellow-200'
                    }>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{krs.mahasiswa?.nama}</h3>
                              <Badge variant="outline">{krs.mahasiswa?.nim}</Badge>
                              <Badge variant="secondary">{krs.mahasiswa?.program_studi}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Semester {krs.semester} • {krs.total_sks} SKS •
                              {new Date(krs.submitted_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          {dapatkanBadgeStatusKRS(krs.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {krs.mata_kuliah.map((mk, index) => (
                            <div key={index} className="text-sm p-2 bg-white border rounded">
                              <strong>{mk.kode_mata_kuliah}</strong> - {mk.nama_mata_kuliah} ({mk.sks} SKS)
                            </div>
                          ))}
                        </div>

                        {krs.catatan && (
                          <div className="mt-3 p-3 bg-white border rounded text-sm">
                            <strong>Catatan:</strong> {krs.catatan}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}