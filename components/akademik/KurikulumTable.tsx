// components/akademik/KurikulumTable.tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Curriculum } from '@/types/akademik';

interface KurikulumTableProps {
  data: Curriculum[];
}

export default function KurikulumTable({ data }: KurikulumTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada data kurikulum.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Kode</TableHead>
            <TableHead>Nama Kurikulum</TableHead>
            <TableHead>Program Studi</TableHead>
            <TableHead className="text-right">Total SKS</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((kurikulum) => (
            <TableRow key={kurikulum.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-medium">{kurikulum.code}</TableCell>
              <TableCell className="font-medium">{kurikulum.name}</TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 bg-muted rounded">
                  {kurikulum.study_program?.code} - {kurikulum.study_program?.name}
                </span>
              </TableCell>
              <TableCell className="text-right">{kurikulum.total_credits || 0}</TableCell>
              <TableCell>
                <Badge variant={kurikulum.is_active ? 'default' : 'secondary'}>
                  {kurikulum.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-card">
                    <DropdownMenuItem asChild>
                      <Link href={`/akademik/kurikulum/${kurikulum.id}`}>Lihat Detail</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/akademik/kurikulum/${kurikulum.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
