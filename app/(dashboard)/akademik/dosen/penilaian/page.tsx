// app/(dashboard)/akademik/dosen/penilaian/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Search, Filter, Download, Upload, Plus, Save, Users, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Mahasiswa {
  id: number;
  nama: string;
  nim: string;
}

interface KomponenNilai {
  id: number;
  nama: string;
  persentase: number;
  nilai?: number;
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
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [komponenNilai, setKomponenNilai] = useState<KomponenNilai[]>([]);
  const [pencarian, setPencarian] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(true);

  useEffect(() => {
    // Load data kelas dosen
    muatDataKelas();
  }, []);

  useEffect(() => {
    if (kelasTerpilih) {
      muatDataPenilaian(kelasTerpilih);
    }
  }, [kelasTerpilih]);

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

  const muatDataPenilaian = async (kelasId: string) => {
    try {
      // Simulasi data mahasiswa dan komponen nilai
      const dataMahasiswa: Mahasiswa[] = [
        { id: 1, nama: 'Ahmad Wijaya', nim: '202401001' },
        { id: 2, nama: 'Sari Dewi', nim: '202401002' },
        { id: 3, nama: 'Budi Santoso', nim: '202401003' },
        { id: 4, nama: 'Rina Melati', nim: '202401004' },
        { id: 5, nama: 'Dodi Pratama', nim: '202401005' }
      ];

      const dataKomponen: KomponenNilai[] = [
        { id: 1, nama: 'Tugas 1', persentase: 10 },
        { id: 2, nama: 'Tugas 2', persentase: 10 },
        { id: 3, nama: 'UTS', persentase: 30 },
        { id: 4, nama: 'Tugas 3', persentase: 10 },
        { id: 5, nama: 'UAS', persentase: 40 }
      ];

      setMahasiswa(dataMahasiswa);
      setKomponenNilai(dataKomponen);
    } catch (error) {
      console.error('Gagal memuat data penilaian:', error);
    }
  };

  const updateNilai = (mahasiswaId: number, komponenId: number, nilai: string) => {
    const nilaiNum = nilai === '' ? undefined : parseInt(nilai);
    setKomponenNilai(prev => 
      prev.map(komp => 
        komp.id === komponenId 
          ? { ...komp, nilai: nilaiNum }
          : komp
      )
    );
  };

  const hitungNilaiAkhir = (nilaiKomponen: KomponenNilai[]) => {
    const total = nilaiKomponen.reduce((sum, komp) => {
      return sum + ((komp.nilai || 0) * komp.persentase / 100);
    }, 0);
    return Math.round(total);
  };

  const mahasiswaTersaring = mahasiswa.filter(mhs =>
    mhs.nama.toLowerCase().includes(pencarian.toLowerCase()) ||
    mhs.nim.includes(pencarian)
  );

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

      {/* Filter Kelas */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={kelasTerpilih} onValueChange={setKelasTerpilih}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Pilih kelas..." />
              </SelectTrigger>
              <SelectContent>
                {kelasList.map(kelas => (
                  <SelectItem key={kelas.id} value={kelas.id.toString()}>
                    {kelas.class_code} - {kelas.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {kelasTerpilih && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Komponen
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {kelasTerpilih && (
        <>
          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <p className="text-sm font-medium text-muted-foreground">Komponen Nilai</p>
                    <p className="text-2xl font-bold">{komponenNilai.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nilai Terinput</p>
                    <p className="text-2xl font-bold">
                      {komponenNilai.filter(k => k.nilai !== undefined).length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Penilaian */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Input Nilai Mahasiswa</CardTitle>
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
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Semua
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No</TableHead>
                          <TableHead>NIM</TableHead>
                          <TableHead>Nama Mahasiswa</TableHead>
                          {komponenNilai.map(komp => (
                            <TableHead key={komp.id} className="text-center">
                              <div>{komp.nama}</div>
                              <div className="text-xs text-muted-foreground">{komp.persentase}%</div>
                            </TableHead>
                          ))}
                          <TableHead className="text-center">Nilai Akhir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mahasiswaTersaring.map((mhs, index) => (
                          <TableRow key={mhs.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{mhs.nim}</TableCell>
                            <TableCell>{mhs.nama}</TableCell>
                            {komponenNilai.map(komp => (
                              <TableCell key={komp.id} className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="w-20 mx-auto text-center"
                                  placeholder="0"
                                  value={komp.nilai || ''}
                                  onChange={(e) => updateNilai(mhs.id, komp.id, e.target.value)}
                                />
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-semibold">
                              {hitungNilaiAkhir(komponenNilai) || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ringkasan Komponen Nilai */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Komponen Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {komponenNilai.map(komp => (
                  <Card key={komp.id} className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{komp.nama}</p>
                          <p className="text-sm text-muted-foreground">{komp.persentase}% dari nilai akhir</p>
                        </div>
                        <Badge variant={komp.nilai !== undefined ? "default" : "outline"}>
                          {komp.nilai !== undefined ? `${komp.nilai}/100` : 'Belum diinput'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}