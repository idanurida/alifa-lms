import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <GraduationCap className="h-16 w-16 text-[#0ea5e9] mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Tentang ALIFA Institute</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          ALIFA Institute adalah platform Learning Management System (LMS) terintegrasi 
          yang dirancang untuk mendukung proses pembelajaran modern. Sistem ini menghubungkan 
          mahasiswa, dosen, dan staf akademik dalam satu ekosistem digital yang efisien.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
          <div className="p-4 border rounded-xl">
            <h3 className="font-bold mb-1">📚 Akademik</h3>
            <p className="text-sm text-muted-foreground">Manajemen kurikulum, KRS, dan penilaian.</p>
          </div>
          <div className="p-4 border rounded-xl">
            <h3 className="font-bold mb-1">💰 Keuangan</h3>
            <p className="text-sm text-muted-foreground">Pembayaran dan verifikasi terintegrasi.</p>
          </div>
          <div className="p-4 border rounded-xl">
            <h3 className="font-bold mb-1">💬 Komunikasi</h3>
            <p className="text-sm text-muted-foreground">Forum diskusi dan chat real-time.</p>
          </div>
        </div>
        <Link href="/" className="text-[#0ea5e9] hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
