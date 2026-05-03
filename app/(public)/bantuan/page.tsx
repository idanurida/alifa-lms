import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function BantuanPage() {
  const faqs = [
    { q: 'Bagaimana cara login?', a: 'Gunakan email dan password yang diberikan oleh admin. Pilih role Anda (Mahasiswa/Dosen/Staff) sebelum login.' },
    { q: 'Bagaimana cara mengajukan KRS?', a: 'Login sebagai Mahasiswa → klik KRS Saya → pilih mata kuliah → Ajukan KRS.' },
    { q: 'Bagaimana cara upload bukti transfer?', a: 'Login → menu Keuangan → Bukti Transfer → Upload Bukti Transfer.' },
    { q: 'Lupa password?', a: 'Klik "Lupa password?" di halaman login. Masukkan email terdaftar untuk menerima link reset.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <HelpCircle className="h-16 w-16 text-[#0ea5e9] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Pusat Bantuan</h1>
          <p className="text-muted-foreground">Pertanyaan yang sering diajukan</p>
        </div>
        <div className="space-y-4 mb-8">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 border rounded-xl">
              <h3 className="font-bold mb-1">{faq.q}</h3>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/" className="text-[#0ea5e9] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
