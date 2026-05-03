import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <Mail className="h-16 w-16 text-[#0ea5e9] mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Kontak Kami</h1>
        <div className="space-y-4 mb-8 text-left">
          <div className="flex items-center gap-3 p-4 border rounded-xl">
            <Mail className="h-5 w-5 text-[#0ea5e9]" />
            <div><p className="font-medium">Email</p><p className="text-sm text-muted-foreground">admin@alifa.ac.id</p></div>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-xl">
            <Phone className="h-5 w-5 text-[#0ea5e9]" />
            <div><p className="font-medium">Telepon</p><p className="text-sm text-muted-foreground">+62 21 1234 5678</p></div>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-xl">
            <MapPin className="h-5 w-5 text-[#0ea5e9]" />
            <div><p className="font-medium">Alamat</p><p className="text-sm text-muted-foreground">Jl. Pendidikan No. 123, Jakarta</p></div>
          </div>
        </div>
        <Link href="/" className="text-[#0ea5e9] hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
