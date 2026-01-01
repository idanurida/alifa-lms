// app/(dashboard)/akademik/dosen/presensi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Filter, Download, Upload, Plus, Users, Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Mahasiswa {
  id: number;
  nama: string;
  nim: string;
}

interface Presensi {
  id: number;
  mahasiswa_id: number;
  pertemuan: number;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  tanggal: string;
  catatan?: string;
}

interface Kelas {
  id: number;
  class_code: string;
  class_name: string;
  course_name: string;
}

export default function PresensiDosenPage() {
  const { data: session } = useSession();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelasTerpilih, setKelasTerpilih] = useState<string>('');
  const [pertemuanTerpilih, setPertemuanTerpilih] = useState<string>('1');
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [presensi, setPresensi] = useState<Presensi[]>([]);
  const [pencarian, setPencarian] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [tanggalPresensi, setTanggalPresensi] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    muatDataKelas();
  }, []);

  useEffect(() => {
    if (kelasTerpilih) {
      muatDataPresensi(kelasTerpilih, parseInt(pertemuanTerpilih));
    }
  }, [kelasTerpilih, pertemuanTerpilih]);

  const muatDataKelas = async () => {
    try {
      // Simulasi API call
      setTimeout(() => {
        setKelasList([
          { id: 1, class_code: 'CS101-A', class_name: 'Pemrograman Dasar A', course_name: 'Pemrograman Dasar' },
          { id: 2, class_code: 'MT201-B', class_name: 'Kalkulus Lanjut B', course_name: 'Kalkulus Lanjut' },
          { id: 3, class_code: 'AL501-C', class_name: 'Algoritma C', course_name: 'Algoritma dan Struktur Data' }
        ]);
        setSedangMemuat(false);
      }, 1000);
    } catch (error) {
      console.error('Gagal memuat data kelas:', error);
      setSedangMemuat(false);
    }
  };

  const muatDataPresensi = async (kelasId: string, pertemuan: number) => {
    try {
      // Simulasi data mahasiswa
      const dataMahasiswa: Mahasiswa[] = [
        { id: 1, nama: 'Ahmad Wijaya', nim: '202401001' },
        { id: 2, nama: 'Sari Dewi', nim: '202401002' },
        { id: 3, nama: 'Budi Santoso', nim: '202401003' },
        { id: 4, nama: 'Rina Melati', nim: '202401004' },
        { id: 5, nama: 'Dodi Pratama', nim: '202401005' }
      ];

      // Simulasi data presensi
      const dataPresensi: Presensi[] = dataMahasiswa.map(mhs => ({
        id: mhs.id,
        mahasiswa_id: mhs.id,
        pertemuan: pertemuan,
        status: 'hadir', // Default status
        tanggal: tanggalPresensi,
        catatan: ''
      }));

      setMahasiswa(dataMahasiswa);
      setPresensi(dataPresensi);
    } catch (error) {
      console.error('Gagal memuat data presensi:', error);
    }
  };

  const updatePresensi = (mahasiswaId: number, status: Presensi['status'], catatan?: string) => {
    setPresensi(prev => 
      prev.map(p => 
        p.mahasiswa_id === mahasiswaId 
          ? { ...p, status, catatan: catatan || p.catatan }
          : p
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircle className="h-4 w-4 text-sky-600" />;
      case 'izin': return <MinusCircle className="h-4 w-4 text-yellow-600" />;
      case 'sakit': return <MinusCircle className="h-4 w-4 text-orange-600" />;
      case 'alpha': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <MinusCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir': return <Badge variant="default" className="bg-sky-100 text-sky-800">Hadir</Badge>;
      case 'izin': return <Badge variant="outline" className="text-yellow-600">Izin</Badge>;
      case 'sakit': return <Badge variant="outline" className="text-orange-600">Sakit</Badge>;
      case 'alpha': return <Badge variant="destructive">Alpha</Badge>;
      default: return <Badge variant="outline">-</Badge>;
    }
  };

  const hitungStatistik = () => {
    const total = presensi.length;
    const hadir = presensi.filter(p => p.status === 'hadir').length;
    const izin = presensi.filter(p => p.status === 'izin').length;
    const sakit = presensi.filter(p => p.status === 'sakit').length;
    const alpha = presensi.filter(p => p.status === 'alpha').length;

    return { total, hadir, izin, sakit, alpha };
  };

  const simpanPresensi = async () => {
    try {
      // Simulasi save ke database
      console.log('Menyimpan presensi:', presensi);
      alert('Presensi berhasil disimpan!');
    } catch (error) {
      console.error('Gagal menyimpan presensi:', error);
      alert('Gagal menyimpan presensi');
    }
  };

  const mahasiswaTersaring = mahasiswa.filter(mhs =>
    mhs.nama.toLowerCase().includes(pencarian.toLowerCase()) ||
    mhs.nim.includes(pencarian)
  );

  const statistik = hitungStatistik();

  if (!session || session.user.role !== 'dosen') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Tidak Diizinkan</h2>
          <p className="text-muted-foreground mt-2">Hanya dosen yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Presensi</h1>
        <p className="text-muted-foreground">
          Input dan kelola kehadiran mahasiswa untuk kelas yang Anda ampu
        </p>
      </div>

      {/* Filter Kelas & Pertemuan */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kelas & Pertemuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kelas</label>
              <select 
                value={kelasTerpilih} 
                onChange={(e) => setKelasTerpilih(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih kelas...</option>
                {kelasList.map(kelas => (
                  <option key={kelas.id} value={kelas.id.toString()}>
                    {kelas.class_code} - {kelas.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pertemuan</label>
              <select 
                value={pertemuanTerpilih} 
                onChange={(e) => setPertemuanTerpilih(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(pert => (
                  <option key={pert} value={pert.toString()}>
                    Pertemuan {pert}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tanggal Presensi</label>
              <Input
                type="date"
                value={tanggalPresensi}
                onChange={(e) => setTanggalPresensi(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {kelasTerpilih && (
        <>
          {/* Statistik Presensi */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{statistik.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hadir</p>
                    <p className="text-2xl font-bold text-sky-600">{statistik.hadir}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-sky-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Izin</p>
                    <p className="text-2xl font-bold text-yellow-600">{statistik.izin}</p>
                  </div>
                  <MinusCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sakit</p>
                    <p className="text-2xl font-bold text-orange-600">{statistik.sakit}</p>
                  </div>
                  <MinusCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alpha</p>
                    <p className="text-2xl font-bold text-red-600">{statistik.alpha}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Presensi */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Input Presensi - Pertemuan {pertemuanTerpilih}</CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari mahasiswa..."
                      className="pl-10"
                      value={pencarian}
                      onChange={(e) => setPencarian(e.target.value)}
                    />
                  </div>
                  <Button onClick={simpanPresensi}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Simpan Presensi
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
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>NIM</TableHead>
                        <TableHead>Nama Mahasiswa</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mahasiswaTersaring.map((mhs, index) => {
                        const dataPresensi = presensi.find(p => p.mahasiswa_id === mhs.id);
                        const status = dataPresensi?.status || 'alpha';
                        
                        return (
                          <TableRow key={mhs.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{mhs.nim}</TableCell>
                            <TableCell>{mhs.nama}</TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(status)}
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Catatan (opsional)"
                                value={dataPresensi?.catatan || ''}
                                onChange={(e) => updatePresensi(mhs.id, status, e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant={status === 'hadir' ? 'default' : 'outline'}
                                  onClick={() => updatePresensi(mhs.id, 'hadir')}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'izin' ? 'default' : 'outline'}
                                  onClick={() => updatePresensi(mhs.id, 'izin')}
                                  className="h-8 w-8 p-0"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'sakit' ? 'default' : 'outline'}
                                  onClick={() => updatePresensi(mhs.id, 'sakit')}
                                  className="h-8 w-8 p-0"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'alpha' ? 'destructive' : 'outline'}
                                  onClick={() => updatePresensi(mhs.id, 'alpha')}
                                  className="h-8 w-8 p-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4">
                  <Download className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Export Presensi</div>
                    <div className="text-xs text-muted-foreground">Download Excel/PDF</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <Upload className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Import Presensi</div>
                    <div className="text-xs text-muted-foreground">Upload dari file</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <Calendar className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Rekap Bulanan</div>
                    <div className="text-xs text-muted-foreground">Lihat statistik</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto py-4">
                  <Users className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Presensi Massal</div>
                    <div className="text-xs text-muted-foreground">Set semua hadir</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}