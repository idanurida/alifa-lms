// components/tables/NilaiTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StudentActivity } from '@/types/akademik';

interface NilaiTableProps {
   StudentActivity[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function NilaiTable({ data, onEdit, onDelete }: NilaiTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada nilai aktivitas.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipe Aktivitas</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Skor</TableHead>
            <TableHead>Skor Maks</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((nilai) => (
            <TableRow key={nilai.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <Badge variant="outline">{nilai.activity_type}</Badge>
              </TableCell>
              <TableCell>{new Date(nilai.activity_date).toLocaleDateString('id-ID')}</TableCell>
              <TableCell className="font-medium">{nilai.score}</TableCell>
              <TableCell>{nilai.max_score}</TableCell>
              <TableCell>{nilai.notes || '—'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-card">
                    <DropdownMenuItem onClick={() => onEdit?.(nilai.id)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(nilai.id)}>
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