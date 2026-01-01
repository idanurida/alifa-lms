// components/keuangan/PaymentEvidenceTable.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PaymentEvidence {
  id: number;
  student_id: number;
  student_name: string;
  nim: string;
  email?: string;
  amount: number;
  transfer_date: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'verified' | 'rejected';
  academic_period_id: number;
  academic_period_name: string;
  evidence_path: string;
  created_at: string;
  verified_at?: string;
  verified_by?: number;
  notes?: string;
}

interface PaymentEvidenceTableProps {
  data: PaymentEvidence[];
  onVerify?: (id: number) => Promise<{ success: boolean; message: string }>;
  onReject?: (id: number, reason?: string) => Promise<{ success: boolean; message: string }>;
  showAllStatus?: boolean;
}

// PASTIKAN: Default export
export default function PaymentEvidenceTable({ 
  data = [], 
  onVerify, 
  onReject,
  showAllStatus = false
}: PaymentEvidenceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Filter data berdasarkan showAllStatus
  const filteredData = showAllStatus 
    ? data 
    : data.filter(payment => payment.status === 'pending');

  const filteredPayments = filteredData.filter(payment => {
    const matchesSearch = payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.nim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-sky-500">
          <CheckCircle size={12} className="mr-1" /> Terverifikasi
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <XCircle size={12} className="mr-1" /> Ditolak
        </Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">
          <Clock size={12} className="mr-1" /> Menunggu
        </Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleVerify = async (id: number) => {
    if (!onVerify) return;
    
    setLoadingId(id);
    try {
      await onVerify(id);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!onReject) return;
    
    setLoadingId(id);
    try {
      await onReject(id, 'Bukti transfer tidak sesuai');
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showAllStatus ? 'Semua Bukti Transfer' : 'Antrian Verifikasi'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari NIM atau nama mahasiswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Periode Akademik</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal Transfer</TableHead>
                <TableHead>Bank Pengirim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada data bukti transfer
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.nim}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.student_name}</div>
                        {payment.email && (
                          <div className="text-sm text-muted-foreground">{payment.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{payment.academic_period_name}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.transfer_date)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{payment.bank_name}</div>
                        <div className="text-muted-foreground">
                          {payment.account_name} ({payment.account_number})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {payment.evidence_path && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(payment.evidence_path, '_blank')}
                            title="Lihat Bukti Transfer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!showAllStatus && payment.status === 'pending' && onVerify && onReject && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVerify(payment.id)}
                              disabled={loadingId === payment.id}
                              title="Verifikasi Pembayaran"
                              className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(payment.id)}
                              disabled={loadingId === payment.id}
                              title="Tolak Pembayaran"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredPayments.length} dari {filteredData.length} entri
          </div>
        </div>
      </CardContent>
    </Card>
  );
}