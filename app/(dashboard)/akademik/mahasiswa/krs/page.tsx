// app/(dashboard)/akademik/mahasiswa/krs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Trash2, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MataKuliah {
  id: number;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  prasyarat?: string[];
  is_active: boolean;
  kurikulum_id: number;
}

interface KRSItem {
  mata_kuliah_id: number;
  kode_mata_kuliah: string;
  nama_mata_kuliah: string;
  sks: number;
  kelas_id?: number;
}

interface KRSSubmission {
  id: number;
  semester: string;
  mata_kuliah: KRSItem[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  total_sks: number;
  catatan?: string;
}

export default function KRSMahasiswaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [mataKuliahTersedia, setMataKuliahTersedia] = useState<MataKuliah[]>([]);
  const [mataKuliahTerpilih, setMataKuliahTerpilih] = useState<KRSItem[]>([]);
  const [riwayatKRS, setRiwayatKRS] = useState<KRSSubmission[]>([]);
  const [pencarian, setPencarian] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangMengajukan, setSedangMengajukan] = useState(false);
  const [semesterSekarang, setSemesterSekarang] = useState('2024-1');
  const [infoMahasiswa, setInfoMahasiswa] = useState<any>(null);

  // Redirect jika bukan mahasiswa
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'mahasiswa') {
      router.push('/tidak-diizinkan');
    }
  }, [session, status, router]);

  // Load data saat component mount
  useEffect(() => {
    if (session?.user.role === 'mahasiswa') {
      muatDataKRS();
    }
  }, [session]);

  const muatDataKRS = async () => {
    try {
      setSedangMemuat(true);
      
      // Load data dari API
      const [responseMataKuliah, responseKRS, responseMahasiswa] = await Promise.all([
        fetch('/api/akademik/mata-kuliah/tersedia'),
        fetch('/api/akademik/krs'),
        fetch('/api/akademik/mahasiswa/profil')
      ]);

      if (responseMataKuliah.ok) {
        const dataMataKuliah = await responseMataKuliah.json();
        setMataKuliahTersedia(dataMataKuliah.data || []);
      } else {
        console.error('Gagal memuat mata kuliah:', await responseMataKuliah.text());
      }

      if (responseKRS.ok) {
        const dataKRS = await responseKRS.json();
        setRiwayatKRS(dataKRS.data || []);
      } else {
        console.error('Gagal memuat riwayat KRS:', await responseKRS.text());
      }

      if (responseMahasiswa.ok) {
        const dataMahasiswa = await responseMahasiswa.json();
        setInfoMahasiswa(dataMahasiswa.data);
      } else {
        console.error('Gagal memuat profil mahasiswa:', await responseMahasiswa.text());
      }

    } catch (error) {
      console.error('Gagal memuat data KRS:', error);
      // Fallback data untuk development
      setMataKuliahTersedia(dapatkanMataKuliahFallback());
      setRiwayatKRS(dapatkanRiwayatKRSFallback());
    } finally {
      setSedangMemuat(false);
    }
  };

  // Fallback data untuk development
  const dapatkanMataKuliahFallback = (): MataKuliah[] => [
    {
      id: 1,
      kode: 'CS101',
      nama: 'Pemrograman Dasar',
      sks: 3,
      semester: 1,
      is_active: true,
      kurikulum_id: 1
    },
    {
      id: 2,
      kode: 'MT201',
      nama: 'Kalkulus Lanjut',
      sks: 4,
      semester: 2,
      is_active: true,
      kurikulum_id: 1
    },
    {
      id: 3,
      kode: 'FI301',
      nama: 'Fisika Dasar',
      sks: 3,
      semester: 1,
      is_active: true,
      kurikulum_id: 1
    },
    {
      id: 4,
      kode: 'BD401',
      nama: 'Basis Data',
      sks: 3,
      semester: 3,
      is_active: true,
      kurikulum_id: 1
    },
    {
      id: 5,
      kode: 'AL501',
      nama: 'Algoritma dan Struktur Data',
      sks: 4,
      semester: 4,
      is_active: true,
      kurikulum_id: 1
    },
    {
      id: 6,
      kode: 'PW601',
      nama: 'Pemrograman Web',
      sks: 3,
      semester: 5,
      is_active: true,
      kurikulum_id: 1
    }
  ];

  const dapatkanRiwayatKRSFallback = (): KRSSubmission[] => [
    {
      id: 1,
      semester: '2023-2',
      mata_kuliah: [
        { mata_kuliah_id: 1, kode_mata_kuliah: 'CS101', nama_mata_kuliah: 'Pemrograman Dasar', sks: 3 },
        { mata_kuliah_id: 3, kode_mata_kuliah: 'FI301', nama_mata_kuliah: 'Fisika Dasar', sks: 3 }
      ],
      status: 'approved',
      submitted_at: '2023-12-15T10:00:00Z',
      total_sks: 6
    }
  ];

  const mataKuliahTersaring = mataKuliahTersedia.filter(mk =>
    mk.is_active && (
      mk.nama.toLowerCase().includes(pencarian.toLowerCase()) ||
      mk.kode.toLowerCase().includes(pencarian.toLowerCase())
    )
  );

  const tambahMataKuliah = (mataKuliah: MataKuliah) => {
    if (!mataKuliah.is_active) return;
    
    const sudahDitambahkan = mataKuliahTerpilih.find(item => item.mata_kuliah_id === mataKuliah.id);
    if (sudahDitambahkan) {
      alert('Mata kuliah sudah dipilih!');
      return;
    }

    const itemBaru: KRSItem = {
      mata_kuliah_id: mataKuliah.id,
      kode_mata_kuliah: mataKuliah.kode,
      nama_mata_kuliah: mataKuliah.nama,
      sks: mataKuliah.sks
    };

    setMataKuliahTerpilih(prev => [...prev, itemBaru]);
  };

  const hapusMataKuliah = (mataKuliahId: number) => {
    setMataKuliahTerpilih(prev => prev.filter(item => item.mata_kuliah_id !== mataKuliahId));
  };

  const dapatkanTotalSKS = () => {
    return mataKuliahTerpilih.reduce((total, mk) => total + mk.sks, 0);
  };

  const ajukanKRS = async () => {
    if (mataKuliahTerpilih.length === 0) {
      alert('Pilih minimal satu mata kuliah!');
      return;
    }

    const totalSKS = dapatkanTotalSKS();
    if (totalSKS > 24) {
      alert('Total SKS tidak boleh lebih dari 24!');
      return;
    }

    if (totalSKS < 12) {
      alert('Total SKS minimal 12 untuk semester aktif!');
      return;
    }

    try {
      setSedangMengajukan(true);
      
      const response = await fetch('/api/akademik/krs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          semester: semesterSekarang,
          mata_kuliah: mataKuliahTerpilih
        })
      });

      const hasil = await response.json();

      if (response.ok) {
        alert('KRS berhasil diajukan! Menunggu persetujuan akademik.');
        setMataKuliahTerpilih([]);
        muatDataKRS(); // Reload history
      } else {
        alert(hasil.error || 'Gagal mengajukan KRS');
      }
    } catch (error) {
      console.error('Gagal mengajukan KRS:', error);
      alert('Gagal mengajukan KRS. Silakan coba lagi.');
    } finally {
      setSedangMengajukan(false);
    }
  };

  const dapatkanBadgeStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
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

  const memilikiPengajuanTertunda = riwayatKRS.some(sub => 
    sub.status === 'pending' && sub.semester === semesterSekarang
  );

  if (status === 'loading' || sedangMemuat) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Memuat data KRS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Kartu Rencana Studi (KRS)</h1>
        <p className="text-muted-foreground">
          Pilih mata kuliah untuk semester {semesterSekarang}
          {infoMahasiswa && ` - ${infoMahasiswa.name} (${infoMahasiswa.nim})`}
        </p>
      </div>

      {/* Alert untuk KRS tertunda */}
      {memilikiPengajuanTertunda && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  KRS Semester {semesterSekarang} Menunggu Persetujuan
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Pengajuan KRS Anda sedang dalam proses review oleh staff akademik
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Daftar Mata Kuliah Tersedia */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mata Kuliah Tersedia
              <Badge variant="outline">{mataKuliahTersaring.length} mata kuliah</Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari mata kuliah (nama atau kode)..."
                className="pl-10"
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mataKuliahTersaring.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada mata kuliah tersedia</p>
                  <p className="text-sm">Coba gunakan kata kunci pencarian lain</p>
                </div>
              ) : (
                mataKuliahTersaring.map((mataKuliah) => (
                  <div
                    key={mataKuliah.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      mataKuliah.is_active 
                        ? 'hover:bg-muted/50 border-border' 
                        : 'bg-muted/30 border-muted cursor-not-allowed'
                    } ${
                      mataKuliahTerpilih.find(item => item.mata_kuliah_id === mataKuliah.id) 
                        ? 'bg-primary/10 border-primary' 
                        : ''
                    }`}
                    onClick={() => mataKuliah.is_active && tambahMataKuliah(mataKuliah)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{mataKuliah.kode}</h3>
                          <span className="text-muted-foreground">-</span>
                          <h3 className="font-medium">{mataKuliah.nama}</h3>
                          {!mataKuliah.is_active && (
                            <Badge variant="outline" className="text-xs">Tidak Tersedia</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {mataKuliah.sks} SKS
                          </span>
                          <span>Semester {mataKuliah.semester}</span>
                          {mataKuliah.prasyarat && mataKuliah.prasyarat.length > 0 && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Prasyarat: {mataKuliah.prasyarat.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      {mataKuliah.is_active && (
                        <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kolom 2: KRS yang Dipilih */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rencana Studi
              <Badge variant="outline">{dapatkanTotalSKS()} SKS</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mataKuliahTerpilih.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada mata kuliah dipilih</p>
                <p className="text-sm">Pilih dari daftar mata kuliah tersedia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mataKuliahTerpilih.map((mataKuliah) => (
                  <div key={mataKuliah.mata_kuliah_id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{mataKuliah.kode_mata_kuliah}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{mataKuliah.nama_mata_kuliah}</div>
                      <div className="text-xs text-muted-foreground">{mataKuliah.sks} SKS</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => hapusMataKuliah(mataKuliah.mata_kuliah_id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total SKS:</span>
                    <span className="font-medium">{dapatkanTotalSKS()}</span>
                  </div>
                  
                  {dapatkanTotalSKS() > 24 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Maksimal 24 SKS per semester</span>
                    </div>
                  )}
                  
                  {dapatkanTotalSKS() < 12 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Minimal 12 SKS untuk semester aktif</span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={ajukanKRS}
                    disabled={
                      sedangMengajukan || 
                      dapatkanTotalSKS() > 24 || 
                      dapatkanTotalSKS() < 12 || 
                      mataKuliahTerpilih.length === 0 ||
                      memilikiPengajuanTertunda
                    }
                  >
                    {sedangMengajukan ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Mengajukan...
                      </>
                    ) : (
                      'Ajukan KRS'
                    )}
                  </Button>

                  {memilikiPengajuanTertunda && (
                    <p className="text-xs text-center text-muted-foreground">
                      Anda sudah memiliki pengajuan KRS untuk semester ini
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Riwayat KRS */}
      {riwayatKRS.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pengajuan KRS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riwayatKRS.map((pengajuan) => (
                <div key={pengajuan.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">Semester {pengajuan.semester}</h3>
                      <p className="text-sm text-muted-foreground">
                        Diajukan pada {new Date(pengajuan.submitted_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {dapatkanBadgeStatus(pengajuan.status)}
                      <Badge variant="outline">{pengajuan.total_sks} SKS</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {pengajuan.mata_kuliah.map((mk, index) => (
                      <div key={index} className="text-sm p-2 bg-muted/30 rounded flex justify-between">
                        <span>
                          <strong>{mk.kode_mata_kuliah}</strong> - {mk.nama_mata_kuliah}
                        </span>
                        <span className="text-muted-foreground">{mk.sks} SKS</span>
                      </div>
                    ))}
                  </div>
                  
                  {pengajuan.catatan && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <strong>Catatan dari akademik:</strong> {pengajuan.catatan}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}