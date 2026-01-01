'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    GraduationCap,
    Users,
    BookOpen,
    MessageCircle,
    Coins,
    BarChart3,
    Calendar,
    FileText,
    Globe,
    Mail,
    ArrowRight,
    CheckCircle2,
    Zap,
    Shield,
    Globe2,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';

// Sky blue accent color
const ACCENT_COLOR = "#0ea5e9";

const features = [
    {
        icon: <GraduationCap size={24} />,
        title: "Manajemen Perkuliahan",
        description: "Kelola jadwal, KRS, penugasan, dan progres akademik dalam satu alur kerja yang terotomatisasi."
    },
    {
        icon: <MessageCircle size={24} />,
        title: "Pusat Komunikasi",
        description: "Forum diskusi cerdas dan pesan instan untuk kolaborasi efektif antar civitas akademika."
    },
    {
        icon: <BarChart3 size={24} />,
        title: "Analitik Mendalam",
        description: "Visualisasi data real-time untuk memantau performa mahasiswa dan efisiensi pengajaran."
    },
    {
        icon: <Coins size={24} />,
        title: "Keuangan Terintegrasi",
        description: "Sistem pembayaran aman dengan verifikasi otomatis dan laporan keuangan transparan."
    },
    {
        icon: <Calendar size={24} />,
        title: "Perencanaan Cerdas",
        description: "Kalender akademik interaktif memastikan setiap fase pembelajaran berjalan sesuai jadwal."
    },
    {
        icon: <FileText size={24} />,
        title: "Pusat Dokumentasi",
        description: "Penyimpanan dokumen digital terorganisir dengan sistem verifikasi dan arsip aman."
    }
];

interface LandingPageContentProps {
    dbStats: {
        students: number;
        lecturers: number;
        studyPrograms: number;
        satisfaction: string;
    };
}

export function LandingPageContent({ dbStats }: LandingPageContentProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const stats = [
        { value: dbStats.students.toLocaleString('id-ID'), label: "Mahasiswa" },
        { value: dbStats.lecturers.toLocaleString('id-ID'), label: "Dosen" },
        { value: dbStats.studyPrograms.toString(), label: "Program Studi" },
        { value: dbStats.satisfaction, label: "Kepuasan" }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans selection:bg-[#0ea5e9]/20 transition-colors">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/logo-alifa-white.png"
                            alt="ALIFA Logo"
                            width={200}
                            height={200}
                            className="object-contain"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Link href="/login" className="hover:text-[#0ea5e9] transition-colors">Masuk</Link>
                        <Link href="/akademik" className="hover:text-[#0ea5e9] transition-colors">Akademik</Link>
                        <Link href="/forum" className="hover:text-[#0ea5e9] transition-colors">Forum</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        {mounted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="h-9 w-9"
                            >
                                {theme === 'dark' ? (
                                    <Sun size={18} className="text-slate-400" />
                                ) : (
                                    <Moon size={18} className="text-slate-600" />
                                )}
                            </Button>
                        )}

                        <Button asChild className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold hidden md:flex">
                            <Link href="/login">Mulai</Link>
                        </Button>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-9 w-9"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] px-6 py-4 space-y-4"
                    >
                        <Link href="/login" className="block py-2 text-sm font-medium hover:text-[#0ea5e9]">Masuk</Link>
                        <Link href="/akademik" className="block py-2 text-sm font-medium hover:text-[#0ea5e9]">Akademik</Link>
                        <Link href="/forum" className="block py-2 text-sm font-medium hover:text-[#0ea5e9]">Forum</Link>
                        <Button asChild className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold">
                            <Link href="/login">Mulai</Link>
                        </Button>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section - Unified "Hero Card" Design */}
            <section className="py-4 md:py-8 px-4 md:px-8 flex items-center justify-center">
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative w-full max-w-[1400px] mx-auto rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl lg:aspect-[2/1] min-h-[700px] lg:min-h-0 flex items-center justify-center"
                >

                    {/* Background Image - Inside the Card */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/doc alifa-1.webp"
                            alt="Campus Atmosphere"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay to ensure text readability while keeping image visible */}
                        <div className="absolute inset-0 bg-white/60 dark:bg-[#0f172a]/60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/40 dark:to-transparent" />
                    </div>

                    {/* Content - Centered on top of the image inside the card */}
                    <div className="relative z-10 w-full max-w-5xl px-6 py-20 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                                <Zap size={14} className="text-[#0ea5e9] fill-current" />
                                <span>Digital Campus Experience</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
                                Pembelajaran Modern <br className="hidden lg:block" />
                                <span className="text-[#0ea5e9]">
                                    Pendidikan Masa Depan
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
                                Bergabunglah di ekosistem akademik ALIFA Institute yang mengutamakan kolaborasi,
                                teknologi, dan integritas pendidikan tingkat global.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                                <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 rounded-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
                                    <Link href="/login">
                                        Mulai Sekarang
                                        <ArrowRight size={20} className="ml-2" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-slate-900 dark:text-white font-bold text-lg transition-all hover:scale-105">
                                    <Link href="#features">Pelajari Fitur</Link>
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12 border-t border-slate-900/5 dark:border-white/10">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50 dark:bg-[#0f172a]">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[#0ea5e9] text-sm font-medium mb-4">FITUR</p>
                        <h2 className="text-3xl md:text-4xl font-bold">Semua yang Anda butuhkan</h2>
                    </motion.div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="group"
                            >
                                <Card className="h-full bg-white dark:bg-[#1e293b]/50 border-slate-200 dark:border-white/5 hover:border-[#0ea5e9]/30 transition-all duration-300 p-6">
                                    <div className="w-12 h-12 rounded-xl bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] mb-4 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 dark:text-white">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 border-y border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#1e293b]/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center">
                                <Shield size={32} className="text-[#0ea5e9]" />
                            </div>
                            <h3 className="font-semibold text-lg dark:text-white">Aman & Terpercaya</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Keamanan tingkat enterprise untuk data Anda</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center">
                                <Globe2 size={32} className="text-[#0ea5e9]" />
                            </div>
                            <h3 className="font-semibold text-lg dark:text-white">Selalu Tersedia</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Akses 24/7 dari mana saja</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-[#0ea5e9]" />
                            </div>
                            <h3 className="font-semibold text-lg dark:text-white">Mudah Digunakan</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Antarmuka intuitif untuk semua orang</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-[#0ea5e9]/10 to-slate-100 dark:to-[#1e293b] rounded-3xl p-12 border border-[#0ea5e9]/20"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Siap untuk memulai?</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                            Bergabunglah dengan ribuan mahasiswa dan dosen yang sudah menggunakan ALIFA Institute.
                        </p>
                        <Button asChild size="lg" className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold h-12 px-10">
                            <Link href="/login">
                                Masuk Sekarang
                                <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-white/10 py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/logo-alifa-white.png"
                                alt="ALIFA Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                            <Link href="#" className="hover:text-[#0ea5e9] transition-colors">Privasi</Link>
                            <Link href="#" className="hover:text-[#0ea5e9] transition-colors">Ketentuan</Link>
                            <Link href="#" className="hover:text-[#0ea5e9] transition-colors">Kontak</Link>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            © 2025 ALIFA Institute
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
