// app/(dashboard)/akademik/dosen/materi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Search, Filter, Download, Upload, Plus, FileText, Video, Link, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Materi {
  id: number;
  judul: string;
  deskripsi: string;
  tipe: 'file' | 'video' | 'link';
  nama_file?: string;
  url?: string;
  tanggal_upload: string;
  kelas_id: number;
  kelas?: {
    class_code: string;
    course_name: string;
  };
}

interface Kelas {
  id: number;
  class_code: string;
  class_name: string;
  course_name: string;
}

export default function MateriDosenPage() {
  const { data: session } = useSession();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelasTerpilih, setKelasTerpilih] = useState<string>('');
  const [tipeFilter, setTipeFilter] = useState<string>('semua');
  const [materi, setMateri] = useState<Materi[]>([]);
  const [pencarian, setPencarian] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    muatDataKelas();
  }, []);

  useEffect(() => {
    if (kelasTerpilih) {
      muatDataMateri(kelasTerpilih);
    }
  }, [kelasTerpilih, tipeFilter]);

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

  const muatDataMateri = async (kelasId: string) => {
    try {
      // Simulasi data materi
      const dataMateri: Materi[] = [
        {
          id: 1,
          judul: 'Slide Pertemuan 1 - Pengenalan Pemrograman',
          deskripsi: 'Materi pengenalan dasar pemrograman dan algoritma',
          tipe: 'file',
          nama_file: 'slide-pertemuan-1.pdf',
          tanggal_upload: '2024-01-15T10:00:00Z',
          kelas_id: 1,
          kelas: { class_code: 'CS101-A', course_name: 'Pemrograman Dasar' }
        },
        {
          id: 2,
          judul: 'Video Tutorial Setup Environment',
          deskripsi: 'Panduan instalasi dan setup environment programming',
          tipe: 'video',
          url: 'https://youtube.com/watch?v=abc123',
          tanggal_upload: '2024-01-16T14:30:00Z',
          kelas_id: 1,
          kelas: { class_code: 'CS101-A', course_name: 'Pemrograman Dasar' }
        },
        {
          id: 3,
          judul: 'Link Referensi Belajar',
          deskripsi: 'Kumpulan link website untuk belajar pemrograman',
          tipe: 'link',
          url: 'https://developer.mozilla.org',
          tanggal_upload: '2024-01-17T09:15:00Z',
          kelas_id: 1,
          kelas: { class_code: 'CS101-A', course_name: 'Pemrograman Dasar' }
        },
        {
          id: 4,
          judul: 'Soal Latihan Kalkulus',
          deskripsi: 'Kumpulan soal latihan untuk persiapan UTS',
          tipe: 'file',
          nama_file: 'soal-latihan-kalkulus.pdf',
          tanggal_upload: '2024-01-18T16:45:00Z',
          kelas_id: 2,
          kelas: { class_code: 'MT201-B', course_name: 'Kalkulus Lanjut' }
        }
      ];

      // Filter berdasarkan kelas dan tipe
      let materiTersaring = dataMateri.filter(m => m.kelas_id.toString() === kelasId);
      
      if (tipeFilter !== 'semua') {
        materiTersaring = materiTersaring.filter(m => m.tipe === tipeFilter);
      }

      setMateri(materiTersaring);
    } catch (error) {
      console.error('Gagal memuat data materi:', error);
    }
  };

  const getIconByTipe = (tipe: string) => {
    switch (tipe) {
      case 'file': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (tipe: string) => {
    switch (tipe) {
      case 'file': return 'default';
      case 'video': return 'secondary';
      case 'link': return 'outline';
      default: return 'default';
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const materiTersaring = materi.filter(m =>
    m.judul.toLowerCase().includes(pencarian.toLowerCase()) ||
    m.deskripsi.toLowerCase().includes(pencarian.toLowerCase())
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
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Materi Pembelajaran</h1>
        <p className="text-muted-foreground">
          Upload dan kelola materi pembelajaran untuk kelas yang Anda ampu
        </p>
      </div>

      {/* Filter Kelas */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={kelasTerpilih}
              onChange={(e) => setKelasTerpilih(e.target.value)}
              className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Pilih kelas...</option>
              <option value="all">Semua Kelas</option>
              {kelasList.map((kelas) => (
                <option key={kelas.id} value={kelas.id.toString()}>
                  {kelas.class_code} - {kelas.course_name}
                </option>
              ))}
            </select>

            {kelasTerpilih && (
              <div className="flex gap-2 flex-wrap">
                <select 
                  value={tipeFilter}
                  onChange={(e) => setTipeFilter(e.target.value)}
                  className="flex h-10 w-full sm:w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="semua">Semua Tipe</option>
                  <option value="file">File</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>

                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Materi
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {kelasTerpilih && (
        <>
          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Materi</p>
                    <p className="text-2xl font-bold">{materi.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">File</p>
                    <p className="text-2xl font-bold">
                      {materi.filter(m => m.tipe === 'file').length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Video</p>
                    <p className="text-2xl font-bold">
                      {materi.filter(m => m.tipe === 'video').length}
                    </p>
                  </div>
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Link</p>
                    <p className="text-2xl font-bold">
                      {materi.filter(m => m.tipe === 'link').length}
                    </p>
                  </div>
                  <Link className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daftar Materi */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Daftar Materi</CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari materi..."
                      className="pl-10"
                      value={pencarian}
                      onChange={(e) => setPencarian(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {materiTersaring.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada materi untuk kelas ini</p>
                  <p className="text-sm">Klik "Tambah Materi" untuk mengupload materi pertama</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {materiTersaring.map((materi) => (
                    <Card key={materi.id} className="bg-card border-border hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getIconByTipe(materi.tipe)}
                              <h3 className="font-semibold">{materi.judul}</h3>
                              <Badge variant={getBadgeVariant(materi.tipe)}>
                                {materi.tipe}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{materi.deskripsi}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTanggal(materi.tanggal_upload)}
                              </span>
                              <span>{materi.kelas?.class_code}</span>
                              {materi.nama_file && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {materi.nama_file}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {materi.tipe === 'file' && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                            {(materi.tipe === 'video' || materi.tipe === 'link') && materi.url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={materi.url} target="_blank" rel="noopener noreferrer">
                                  <Link className="h-4 w-4 mr-1" />
                                  Buka
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Upload Materi */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Tambah Materi Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Judul Materi</label>
                      <Input placeholder="Masukkan judul materi..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deskripsi</label>
                      <Input placeholder="Deskripsi singkat materi..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipe Materi</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <option value="">Pilih tipe</option>
                        <option value="file">File (PDF, PPT, DOC)</option>
                        <option value="video">Video</option>
                        <option value="link">Link Eksternal</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Upload File</label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop file di sini atau klik untuk upload
                        </p>
                        <Button variant="outline" className="mt-2">
                          Pilih File
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowForm(false)}>
                        Batal
                      </Button>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Materi
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}