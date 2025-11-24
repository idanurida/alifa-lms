// app/(public)/page.tsx
'use client'; // Kita gunakan 'use client' agar bisa menggunakan motion dan Link Next.js

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Coins, 
  BarChart3, 
  Calendar, 
  FileText, 
  Building,
  Home,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion
// Pastikan komponen ini sudah dibuat sesuai instruksi sebelumnya
import { ModeToggle } from '@/components/layout/ModeToggle'; 
import { Navbar } from '@/components/layout/Navbar'; 

export default function HomePage() {
  const featureItems = [
    {
      icon: <GraduationCap className="text-supabase-green" size={24} />,
      title: "Manajemen Perkuliahan",
      description: "Jadwal, KRS, penugasan dosen, dan progress akademik real-time."
    },
    {
      icon: <MessageCircle className="text-supabase-green" size={24} />,
      title: "Forum Diskusi",
      description: "Diskusi kelas, tanya-jawab lintas prodi, dan kolaborasi dosen-mahasiswa."
    },
    {
      icon: <BarChart3 className="text-supabase-green" size={24} />,
      title: "Progress Tracking",
      description: "Pantau perkembangan belajar & mengajar dalam satu dashboard."
    },
    {
      icon: <Coins className="text-supabase-green" size={24} />,
      title: "Keuangan & Pembayaran",
      description: "Upload bukti transfer, verifikasi otomatis, dan laporan keuangan."
    },
    {
      icon: <Calendar className="text-supabase-green" size={24} />,
      title: "Kalender Akademik",
      description: "Jadwal UTS, UAS, libur nasional, dan peristiwa penting lainnya."
    },
    {
      icon: <FileText className="text-supabase-green" size={24} />,
      title: "Laporan & Statistik",
      description: "Generate laporan akademik dan keuangan secara instan."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Gunakan motion.div untuk animasi */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-20 text-center"
      >
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Logo di Hero - Dihilangkan sesuai permintaan sebelumnya */}
          {/* <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <img
                src="/images/logo-alifa-white.png" 
                alt=""
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div> */}

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-supabase-green to-purple-500 bg-clip-text text-transparent text-lg">
            Sistem Pembelajaran Terpadu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform modern untuk dosen, mahasiswa, dan staff akademik. 
            Tempat kolaborasi, manajemen kelas, dan pelacakan progres akademik.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                <GraduationCap size={16} />
                Masuk ke LMS
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/tentang">
                <FileText size={16} />
                Pelajari Lebih Lanjut
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Features Section - Gunakan motion.div dan animasi stagger */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12 text-lg" // Perbesar font heading
          >
            Fitur Utama
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureItems.map((item, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }} // Animasi hover
              >
                <Card className="glass-effect dark:glass-effect-dark hover:shadow-md transition-shadow h-full">
                  <CardHeader className="items-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle> {/* Perbesar font title */}
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-muted-foreground text-center"> {/* Perbesar font description */}
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Academic Info & Contact */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <h2 className="text-2xl font-bold text-center text-lg">Informasi Perkuliahan</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect dark:glass-effect-dark">
              <CardHeader>
                <CardTitle className="text-lg">Kalender Akademik 2024/2025</CardTitle> {/* Perbesar font title */}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-base">Semester Ganjil</h3> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">2 Sept 2024 – 31 Jan 2025</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-base">UTS</h3> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">21–25 Oktober 2024</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-base">UAS</h3> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">16–20 Des 2024</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium text-base">Pengumuman Penting</h3> {/* Perbesar font */}
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    <li>KRS dibuka 25–30 Agustus 2024</li>
                    <li>Workshop Penggunaan LMS: 20 Agustus 2024</li>
                    <li>Libur Nasional: 16–17 Agustus 2024</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-effect dark:glass-effect-dark">
              <CardHeader>
                <CardTitle className="text-lg">Hubungi Kami</CardTitle> {/* Perbesar font title */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-base">Alamat</h4> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">
                      Jl. Pagar Alam #102.B, Segalamider, Tanjung Karang Barat, 
                      Kota Bandar Lampung, Provinsi Lampung, Indonesia. 35152
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-base">Telepon</h4> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">(021) 12345678</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-base">WhatsApp</h4> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">(+62) 811 79 1114</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-base">Email</h4> {/* Perbesar font */}
                    <p className="text-sm text-muted-foreground">info@alifa.ac.id</p>
                    <p className="text-sm text-muted-foreground">sties.akbid.alifa@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-base">Website</h4> {/* Perbesar font */}
                    <Link href="https://alifa.ac.id" className="text-sm text-primary hover:underline">
                      https://alifa.ac.id
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Gunakan motion.div untuk animasi */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 bg-gradient-to-r from-supabase-green to-purple-500 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-lg">Bergabunglah dengan Kami!</h2> {/* Perbesar font heading */}
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Jelajahi peluang pendidikan tinggi di Alifa Institute. 
            Daftar sekarang dan mulai perjalanan akademik Anda bersama kami.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" variant="secondary" className="text-supabase-green">
              <Link href="/login">
                Masuk Sekarang
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo Footer - Diperbesar 3x, tanpa teks alt */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 relative"> {/* Ukuran 3x lipat dari 40px */}
                <img
                  src="/images/logo-alifa-white.png" // Pastikan path ini benar
                  alt="" // Tidak ada teks alt
                  className="w-full h-full object-contain" // Pastikan gambar mengisi kontainer dan tetap proporsional
                />
              </div>
              <span className="font-medium text-lg">Alifa Institute</span> {/* Perbesar font */}
            </div>
            <p className="text-sm text-muted-foreground">
              Sistem Pembelajaran Terpadu untuk Perguruan Tinggi Modern.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="font-medium mb-4 text-lg">Tautan</h3> {/* Perbesar font */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tentang" className="hover:text-primary">Tentang Kami</Link></li>
              <li><Link href="/akademik" className="hover:text-primary">Akademik</Link></li>
              <li><Link href="/keuangan" className="hover:text-primary">Keuangan</Link></li>
              <li><Link href="/kontak" className="hover:text-primary">Kontak</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="font-medium mb-4 text-lg">Dukungan</h3> {/* Perbesar font */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/bantuan" className="hover:text-primary">Pusat Bantuan</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="/pengaturan" className="hover:text-primary">Panduan Pengguna</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className="font-medium mb-4 text-lg">Kontak</h3> {/* Perbesar font */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 Jl. Pagar Alam #102.B, Bandar Lampung</li>
              <li>📞 (+62) 811 79 1114</li>
              <li>✉️ info@alifa.ac.id</li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-7xl mx-auto mt-8 pt-8 text-center text-sm text-muted-foreground border-t border-white/10"
        >
          <p>© 2025 Alifa Institute. Hak Cipta Dilindungi.</p>
        </motion.div>
      </footer>
    </div>
  );
}