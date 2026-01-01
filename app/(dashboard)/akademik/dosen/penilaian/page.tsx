// app/(dashboard)/akademik/dosen/penilaian/page.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Filter, Download, Upload, Plus, Users, Clock, CheckCircle, XCircle, MinusCircle, BarChart3 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Mahasiswa {
  id: number;
  nama: string;
  nim: string;
}

interface Nilai {
  id: number;
  mahasiswa_id: number;
  jenis: 'tugas' | 'uts' | 'uas' | 'kuis';
  nilai: number;
  maksimal: number;
  bobot: number;
  tanggal: string;
  catatan?: string;
}

interface Kelas {
  id: number;
  class_code: string;
  class_name: string;
  course_name: string;
}

export default function PenilaianDosenPage() {
  const { data: session } = useSession();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelasTerpilih, setKelasTerpilih] = useState<string>('');
  const [jenisNilai, setJenisNilai] = useState<string>('tugas');
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [nilai, setNilai] = useState<Nilai[]>([]);
  const [pencarian, setPencarian] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(true);

  useEffect(() => {
    muatDataKelas();
  }, []);

  useEffect(() => {
    if (kelasTerpilih) {
      muatDataNilai(kelasTerpilih, jenisNilai);
    }
  }, [kelasTerpilih, jenisNilai]);

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

  const muatDataNilai = async (kelasId: string, jenis: string) => {
    try {
      // Simulasi data mahasiswa
      const dataMahasiswa: Mahasiswa[] = [
        { id: 1, nama: 'Ahmad Wijaya', nim: '202401001' },
        { id: 2, nama: 'Sari Dewi', nim: '202401002' },
        { id: 3, nama: 'Budi Santoso', nim: '202401003' },
        { id: 4, nama: 'Rina Melati', nim: '202401004' },
        { id: 5, nama: 'Dodi Pratama', nim: '202401005' }
      ];

      // Simulasi data nilai
      const dataNilai: Nilai[] = dataMahasiswa.map(mhs => ({
        id: mhs.id,
        mahasiswa_id: mhs.id,
        jenis: jenis as 'tugas' | 'uts' | 'uas' | 'kuis',
        nilai: 0, // Default nilai
        maksimal: 100,
        bobot: 20,
        tanggal: new Date().toISOString().split('T')[0],
        catatan: ''
      }));

      setMahasiswa(dataMahasiswa);
      setNilai(dataNilai);
    } catch (error) {
      console.error('Gagal memuat data nilai:', error);
    }
  };

  const updateNilai = (mahasiswaId: number, nilaiBaru: number, catatan?: string) => {
    setNilai(prev => 
      prev.map(n => 
        n.mahasiswa_id === mahasiswaId 
          ? { ...n, nilai: nilaiBaru, catatan: catatan || n.catatan }
          : n
      )
    );
  };

  const hitungStatistik = () => {
    const total = nilai.length;
    const lulus = nilai.filter(n => n.nilai >= 60).length;
    const tidakLulus = nilai.filter(n => n.nilai < 60).length;
    const rataRata = total > 0 ? nilai.reduce((sum, n) => sum + n.nilai, 0) / total : 0;
    const tertinggi = total > 0 ? Math.max(...nilai.map(n => n.nilai)) : 0;
    const terendah = total > 0 ? Math.min(...nilai.map(n => n.nilai)) : 0;

    return { total, lulus, tidakLulus, rataRata, tertinggi, terendah };
  };

  const simpanNilai = async () => {
    try {
      // Simulasi save ke database
      console.log('Menyimpan nilai:', nilai);
      alert('Nilai berhasil disimpan!');
    } catch (error) {
      console.error('Gagal menyimpan nilai:', error);
      alert('Gagal menyimpan nilai');
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
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Penilaian</h1>
        <p className="text-muted-foreground">
          Input dan kelola nilai mahasiswa untuk kelas yang Anda ampu
        </p>
      </div>

      {/* Filter Kelas & Jenis Nilai */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kelas & Jenis Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kelas</label>
              {/* PERBAIKAN: Ganti dengan native select */}
              <select 
                value={kelasTerpilih}
                onChange={(e) => setKelasTerpilih(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
              <label className="text-sm font-medium mb-2 block">Jenis Nilai</label>
              {/* PERBAIKAN: Ganti dengan native select */}
              <select 
                value={jenisNilai}
                onChange={(e) => setJenisNilai(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="tugas">Tugas</option>
                <option value="kuis">Kuis</option>
                <option value="uts">UTS</option>
                <option value="uas">UAS</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {kelasTerpilih && (
        <>
          {/* Statistik Nilai */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                    <p className="text-sm font-medium text-muted-foreground">Lulus</p>
                    <p className="text-2xl font-bold text-sky-600">{statistik.lulus}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-sky-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tidak Lulus</p>
                    <p className="text-2xl font-bold text-red-600">{statistik.tidakLulus}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata</p>
                    <p className="text-2xl font-bold text-blue-600">{statistik.rataRata.toFixed(1)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tertinggi</p>
                    <p className="text-2xl font-bold text-sky-600">{statistik.tertinggi}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-sky-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Terendah</p>
                    <p className="text-2xl font-bold text-red-600">{statistik.terendah}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Nilai */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Input Nilai - {jenisNilai.toUpperCase()}</CardTitle>
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
                  <Button onClick={simpanNilai}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Simpan Nilai
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
                        <TableHead className="text-center">Nilai</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mahasiswaTersaring.map((mhs, index) => {
                        const dataNilai = nilai.find(n => n.mahasiswa_id === mhs.id);
                        const nilaiSekarang = dataNilai?.nilai || 0;
                        const status = nilaiSekarang >= 60 ? 'Lulus' : 'Tidak Lulus';
                        
                        return (
                          <TableRow key={mhs.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{mhs.nim}</TableCell>
                            <TableCell>{mhs.nama}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={nilaiSekarang}
                                  onChange={(e) => updateNilai(mhs.id, parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <span>/ 100</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Catatan (opsional)"
                                value={dataNilai?.catatan || ''}
                                onChange={(e) => updateNilai(mhs.id, nilaiSekarang, e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={status === 'Lulus' ? 'default' : 'destructive'}>
                                {status}
                              </Badge>
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
        </>
      )}
    </div>
  );
}