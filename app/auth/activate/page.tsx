'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, ShieldCheck, User, Key, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { claimAccount } from '@/app/actions/auth-actions';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Loading fallback
function ActivateLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-blue-200/50">Memuat...</p>
            </div>
        </div>
    );
}

// Wrapper component yang menggunakan useSearchParams
function ActivateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const idParam = searchParams.get('id') || '';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        id: idParam,
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (idParam) {
            setFormData(prev => ({ ...prev, id: idParam }));
        }
    }, [idParam]);

    const handleNext = () => {
        if (formData.id.length < 5) {
            setMessage({ type: 'error', text: 'NIM atau NIDN tidak valid' });
            return;
        }
        setMessage(null);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const result = await claimAccount({
                id: formData.id,
                email: formData.email,
                username: formData.username,
                password: formData.password
            });

            if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Aktivasi berhasil!' });
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Terjadi kesalahan' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Gagal menghubungi server' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 font-sans antialiased selection:bg-blue-500/30">
            {/* Background patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg z-10"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 backdrop-blur-sm shadow-xl shadow-blue-500/5">
                            <GraduationCap className="h-10 w-10 text-blue-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm uppercase">
                        Aktivasi Akun <span className="text-blue-400">ALIFA</span>
                    </h1>
                    <p className="text-blue-200/60 mt-2 font-medium">Selesaikan langkah berikut untuk mengakses dashboard Anda</p>
                </div>

                <Card className="bg-[#1e293ba6] border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                    <CardHeader>
                        <CardTitle className="text-white text-xl flex items-center gap-2">
                            {step === 1 ? <ShieldCheck className="h-5 w-5 text-blue-400" /> : <User className="h-5 w-5 text-indigo-400" />}
                            {step === 1 ? 'Verifikasi Identitas' : 'Pengaturan Akun'}
                        </CardTitle>
                        <CardDescription className="text-blue-100/50">
                            {step === 1
                                ? 'Masukkan NIM (Mahasiswa) atau NIDN (Dosen) Anda yang terdaftar.'
                                : 'Pilih username dan alamat email resmi Anda.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="id" className="text-blue-100/70 text-xs font-semibold uppercase tracking-wider">Nomor Identitas (NIM/NIDN)</Label>
                                        <div className="relative group/input">
                                            <div className="absolute left-3 top-3 text-blue-400 group-focus-within/input:text-white transition-colors">
                                                <GraduationCap className="h-4 w-4" />
                                            </div>
                                            <Input
                                                id="id"
                                                placeholder="Contoh: 202401001"
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-10 transition-all focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
                                                value={formData.id}
                                                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-blue-100/70 text-xs font-semibold uppercase tracking-wider">Username</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                                <Input
                                                    id="username"
                                                    placeholder="JhonDoe123"
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-10 transition-all focus:ring-2 focus:ring-indigo-500/50"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-blue-100/70 text-xs font-semibold uppercase tracking-wider">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="mahasiswa@email.com"
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-10 transition-all focus:ring-2 focus:ring-indigo-500/50"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-blue-100/70 text-xs font-semibold uppercase tracking-wider">Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                className="bg-white/5 border-white/10 text-white pl-10 h-10 transition-all focus:ring-2 focus:ring-indigo-500/50"
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-blue-100/70 text-xs font-semibold uppercase tracking-wider">Konfirmasi Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                className="bg-white/5 border-white/10 text-white pl-10 h-10 transition-all focus:ring-2 focus:ring-indigo-500/50"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mt-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}
                            >
                                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                                <p className="text-sm font-medium">{message.text}</p>
                            </motion.div>
                        )}
                    </CardContent>

                    <CardFooter className="flex gap-3">
                        {step === 2 && (
                            <Button
                                variant="ghost"
                                className="text-blue-200/50 hover:text-white"
                                onClick={() => setStep(1)}
                                disabled={isSubmitting}
                            >
                                Kembali
                            </Button>
                        )}

                        {step === 1 ? (
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-11"
                                onClick={handleNext}
                            >
                                Selanjutnya
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                className={`flex-1 ${message?.type === 'success'
                                    ? 'bg-green-600 hover:bg-green-500'
                                    : 'bg-indigo-600 hover:bg-indigo-500'
                                    } text-white shadow-lg shadow-indigo-500/20 h-11 transition-all`}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></span>
                                        Memproses...
                                    </span>
                                ) : message?.type === 'success' ? 'Aktivasi Berhasil!' : 'Minta Akses Sekarang'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                <div className="mt-8 text-center text-blue-100/30 text-xs">
                    <p>© 2025 ALIFA Institute. Sudah punya akun? <Link href="/login" className="text-blue-400 hover:underline">Masuk di sini</Link></p>
                </div>
            </motion.div>
        </div>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={<ActivateLoading />}>
            <ActivateContent />
        </Suspense>
    );
}
