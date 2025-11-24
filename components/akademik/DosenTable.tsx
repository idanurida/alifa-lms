// components/akademik/DosenTable.tsx
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
import { Dosen } from '@/types/user';

interface DosenTableProps {
  data: Dosen[];
}

export default function DosenTable({ data }: DosenTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada data dosen.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">NIDN</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Keahlian</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dosen) => (
            <TableRow key={dosen.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-medium">{dosen.nidn}</TableCell>
              <TableCell className="font-medium">{dosen.name}</TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 bg-muted rounded">
                  {dosen.expertise || '—'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={dosen.status === 'active' ? 'default' : 'secondary'}>
                  {dosen.status}
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
                      <Link href={`/akademik/dosen/${dosen.id}`}>Lihat Detail</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/akademik/dosen/${dosen.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Nonaktifkan
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