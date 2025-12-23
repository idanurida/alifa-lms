'use client';

// app/page.tsx
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
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion'; // Import motion dari framer-motion
// Pastikan komponen ini sudah dibuat sesuai instruksi sebelumnya
import { ModeToggle } from '@/components/layout/ModeToggle';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - TANPA LOGO */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Hapus bagian logo ini */}
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

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-supabase-green to-purple-500 bg-clip-text text-transparent"
          >
            Sistem Pembelajaran Terpadu
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Platform modern untuk dosen, mahasiswa, dan staff akademik.
            Tempat kolaborasi, manajemen kelas, dan pelacakan progres akademik.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/login?role=mahasiswa">
                <GraduationCap size={16} />
                Masuk Sebagai Mahasiswa
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/login?role=dosen">
                <Users size={16} />
                Masuk Sebagai Dosen
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/login?role=staff_akademik">
                <Building size={16} />
                Masuk Sebagai Staff
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Dengan animasi stagger */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Fitur Utama
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1, // Delay antar item child
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<GraduationCap className="text-supabase-green" size={24} />}
              title="Manajemen Perkuliahan"
              description="Jadwal, KRS, penugasan dosen, dan progress akademik real-time."
            />
            <FeatureCard
              icon={<MessageCircle className="text-supabase-green" size={24} />}
              title="Forum Diskusi"
              description="Diskusi kelas, tanya-jawab lintas prodi, dan kolaborasi dosen-mahasiswa."
            />
            <FeatureCard
              icon={<BarChart3 className="text-supabase-green" size={24} />}
              title="Progress Tracking"
              description="Pantau perkembangan belajar & mengajar dalam satu dashboard."
            />
            <FeatureCard
              icon={<Coins className="text-supabase-green" size={24} />}
              title="Keuangan & Pembayaran"
              description="Upload bukti transfer, verifikasi otomatis, dan laporan keuangan."
            />
            <FeatureCard
              icon={<Calendar className="text-supabase-green" size={24} />}
              title="Kalender Akademik"
              description="Jadwal UTS, UAS, libur nasional, dan peristiwa penting lainnya."
            />
            <FeatureCard
              icon={<FileText className="text-supabase-green" size={24} />}
              title="Laporan & Statistik"
              description="Generate laporan akademik dan keuangan secara instan."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Academic Info & Contact - Dengan animasi */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-muted/30"
      >
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-center"
          >
            Informasi Perkuliahan
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="glass-effect dark:glass-effect-dark">
              <CardHeader>
                <CardTitle>Kalender Akademik 2024/2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Semester Ganjil</h3>
                    <p className="text-sm text-muted-foreground">2 Sept 2024 – 31 Jan 2025</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">UTS</h3>
                    <p className="text-sm text-muted-foreground">21–25 Oktober 2024</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">UAS</h3>
                    <p className="text-sm text-muted-foreground">16–20 Des 2024</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">Pengumuman Penting</h3>
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
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="glass-effect dark:glass-effect-dark">
              <CardHeader>
                <CardTitle>Hubungi Kami</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-sm">Alamat</h4>
                    <p className="text-sm text-muted-foreground">
                      Jl. Pagar Alam #102.B, Segalamider, Tanjung Karang Barat,
                      Kota Bandar Lampung, Provinsi Lampung, Indonesia. 35152
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-sm">Telepon</h4>
                    <p className="text-sm text-muted-foreground">(021) 12345678</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-sm">WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">(+62) 811 79 1114</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-sm">Email</h4>
                    <p className="text-sm text-muted-foreground">info@alifa.ac.id</p>
                    <p className="text-sm text-muted-foreground">sties.akbid.alifa@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="text-muted-foreground mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-sm">Website</h4>
                    <Link href="https://alifa.ac.id" className="text-sm text-primary hover:underline">
                      https://alifa.ac.id
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section - Dengan animasi */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-20 bg-gradient-to-r from-supabase-green to-purple-500 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Siap untuk Belajar Secara Digital?</h2>
          <p className="text-lg opacity-90">
            Bergabunglah dengan ribuan dosen dan mahasiswa yang sudah menggunakan Alifa LMS.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" variant="secondary" className="text-supabase-green">
              <Link href="/login">
                Mulai Sekarang
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer - Diperbarui untuk menampilkan logo */}
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
              <span className="font-medium">Alifa Institute</span>
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
            <h3 className="font-medium mb-4">Tautan</h3>
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
            <h3 className="font-medium mb-4">Dukungan</h3>
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
            <h3 className="font-medium mb-4">Kontak</h3>
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

// Komponen FeatureCard untuk animasi stagger
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <motion.div
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
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};