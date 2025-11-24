// components/akademik/MahasiswaTable.tsx
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
import { Mahasiswa } from '@/types/user';

interface MahasiswaTableProps {
  data: Mahasiswa[];
}

export default function MahasiswaTable({ data }: MahasiswaTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada data mahasiswa.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">NIM</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Program Studi</TableHead>
            <TableHead className="w-[100px]">Angkatan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((mhs) => (
            <TableRow key={mhs.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-medium">{mhs.nim}</TableCell>
              <TableCell className="font-medium">{mhs.name}</TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 bg-muted rounded">
                  {mhs.study_program_id.substring(0, 2)} {/* Assuming first 2 chars represent prodi */}
                </span>
              </TableCell>
              <TableCell>{mhs.year_entry}</TableCell>
              <TableCell>
                <Badge variant={mhs.status === 'active' ? 'default' : 'secondary'}>
                  {mhs.status}
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
                      <Link href={`/akademik/mahasiswa/${mhs.id}`}>Lihat Detail</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/akademik/mahasiswa/${mhs.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Reset KRS
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