'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Edit, Trash2, Save, X, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AcademicPeriod {
    id: number;
    name: string;
    code: string;
    year: number;
    semester: number;
    start_date: string;
    end_date: string;
    uts_week: number;
    uas_week: number;
    is_active: boolean;
}

export default function AcademicCalendarManager() {
    const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const [formData, setFormData] = useState<Partial<AcademicPeriod>>({});

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/akademik/kalender');
            const data = await res.json();
            if (data.data) {
                setPeriods(data.data);
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
            toast.error('Gagal mengambil data kalender akademik');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (period: AcademicPeriod) => {
        setEditingId(period.id);
        setFormData({
            ...period,
            start_date: new Date(period.start_date).toISOString().split('T')[0],
            end_date: new Date(period.end_date).toISOString().split('T')[0],
        });
    };

    const handleAddNew = () => {
        setEditingId('new');
        const currentYear = new Date().getFullYear();
        setFormData({
            name: `Semester Ganjil ${currentYear}/${currentYear + 1}`,
            code: `${currentYear}1`,
            year: currentYear,
            semester: 1,
            start_date: `${currentYear}-09-01`,
            end_date: `${currentYear + 1}-01-31`,
            uts_week: 8,
            uas_week: 16,
            is_active: false,
        });
    };

    const handleApplyTemplate = (type: 'ganjil' | 'genap') => {
        const currentYear = formData.year || new Date().getFullYear();
        if (type === 'ganjil') {
            setFormData({
                ...formData,
                name: `Semester Ganjil ${currentYear}/${currentYear + 1}`,
                code: `${currentYear}1`,
                semester: 1,
                start_date: `${currentYear}-09-01`,
                end_date: `${currentYear + 1}-02-28`,
                uts_week: 8,
                uas_week: 16,
            });
        } else {
            setFormData({
                ...formData,
                name: `Semester Genap ${currentYear - 1}/${currentYear}`,
                code: `${currentYear - 1}2`,
                semester: 2,
                start_date: `${currentYear}-03-01`,
                end_date: `${currentYear}-08-31`,
                uts_week: 8,
                uas_week: 16,
            });
        }
        toast.success(`Template ${type} diterapkan`);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code || !formData.start_date || !formData.end_date) {
            toast.error('Harap lengkapi semua field utama');
            return;
        }

        try {
            const url = editingId === 'new'
                ? '/api/akademik/kalender'
                : `/api/akademik/kalender?id=${editingId}`;

            const method = editingId === 'new' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();
            if (result.success) {
                toast.success(result.message);
                setEditingId(null);
                fetchPeriods();
            } else {
                toast.error(result.error || 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Error saving period:', error);
            toast.error('Kesalahan jaringan');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus periode ini?')) return;

        try {
            const res = await fetch(`/api/akademik/kalender?id=${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                toast.success(result.message);
                fetchPeriods();
            } else {
                toast.error(result.error || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error deleting period:', error);
            toast.error('Kesalahan jaringan');
        }
    };

    const toggleStatus = async (period: AcademicPeriod) => {
        try {
            const res = await fetch(`/api/akademik/kalender?id=${period.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !period.is_active }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Periode ${period.name} ${!period.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
                fetchPeriods();
            }
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Pengaturan Kalender Akademik
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kelola periode perkuliahan, UTS, dan UAS dalam satu tempat.
                    </p>
                </div>
                {!editingId && (
                    <Button onClick={handleAddNew} className="flex gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Periode Baru
                    </Button>
                )}
            </div>

            {editingId && (
                <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>{editingId === 'new' ? 'Tambah Periode Baru' : 'Edit Periode Akademik'}</CardTitle>
                        <CardDescription>
                            Gunakan template atau isi data secara manual untuk membuat periode akademik baru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2 mb-4">
                            <Label className="w-full text-xs text-muted-foreground mb-2 block">Cepat Isi dari Template:</Label>
                            <Button variant="outline" size="sm" onClick={() => handleApplyTemplate('ganjil')} className="text-xs">
                                <RotateCcw className="h-3 w-3 mr-1" /> Template Ganjil
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleApplyTemplate('genap')} className="text-xs">
                                <RotateCcw className="h-3 w-3 mr-1" /> Template Genap
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Periode</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Semester Ganjil 2024/2025"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Periode (Unique)</Label>
                                <Input
                                    id="code"
                                    value={formData.code || ''}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Contoh: 20241"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Tahun</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={formData.year || ''}
                                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Select
                                    value={formData.semester?.toString()}
                                    onValueChange={v => setFormData({ ...formData, semester: parseInt(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Ganjil (1)</SelectItem>
                                        <SelectItem value="2">Genap (2)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date || ''}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Selesai</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="uts_week">Minggu UTS (1-18)</Label>
                                <Input
                                    id="uts_week"
                                    type="number"
                                    value={formData.uts_week || ''}
                                    onChange={e => setFormData({ ...formData, uts_week: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="uas_week">Minggu UAS (1-18)</Label>
                                <Input
                                    id="uas_week"
                                    type="number"
                                    value={formData.uas_week || ''}
                                    onChange={e => setFormData({ ...formData, uas_week: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4">
                            <Switch
                                id="active-mode"
                                checked={formData.is_active}
                                onCheckedChange={v => setFormData({ ...formData, is_active: v })}
                            />
                            <Label htmlFor="active-mode">Langsung Aktifkan Periode Ini</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="ghost" onClick={() => setEditingId(null)} className="flex gap-2">
                                <X className="h-4 w-4" /> Batal
                            </Button>
                            <Button onClick={handleSave} className="flex gap-2">
                                <Save className="h-4 w-4" /> Simpan Perubahan
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {periods.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">Belum ada periode akademik.</p>
                        <p className="text-muted-foreground mb-4">Klik tombol di atas untuk membuat periode pertama.</p>
                        <Button onClick={handleAddNew}>Buat Sekarang</Button>
                    </div>
                ) : (
                    periods.map((period) => (
                        <Card key={period.id} className={`transition-all ${period.is_active ? 'border-primary/40 bg-primary/5' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold">{period.name}</h3>
                                            <Badge variant={period.is_active ? 'default' : 'secondary'} className="px-3">
                                                {period.is_active ? 'AKTIF' : 'TIDAK AKTIF'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                                                ID: {period.code}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Rentang Waktu</p>
                                                <p className="text-sm">
                                                    {new Date(period.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    <span className="mx-2 text-muted-foreground">→</span>
                                                    {new Date(period.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">UTS / UAS</p>
                                                <p className="text-sm">Mgg {period.uts_week} / Mgg {period.uas_week}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Tahun / Semester</p>
                                                <p className="text-sm">{period.year} / {period.semester === 1 ? 'Ganjil' : 'Genap'}</p>
                                            </div>
                                            <div className="flex items-center justify-end md:justify-start">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={period.is_active}
                                                        onCheckedChange={() => toggleStatus(period)}
                                                        aria-label="Toggle status aktif"
                                                    />
                                                    <span className="text-xs font-medium">{period.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(period)} className="flex-1 md:flex-none gap-2">
                                            <Edit className="h-4 w-4" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(period.id)} className="flex-1 md:flex-none gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" /> Hapus
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
