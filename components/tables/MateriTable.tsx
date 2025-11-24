// components/tables/MateriTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LearningMaterial } from '@/types/akademik';

interface MateriTableProps {
   LearningMaterial[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function MateriTable({ data, onEdit, onDelete }: MateriTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada materi pembelajaran.</p>
      </div>
    );
  }

  const getMaterialTypeBadge = (type: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      slide: { label: 'Slide', variant: 'default' },
      reading: { label: 'Bacaan', variant: 'secondary' },
      video: { label: 'Video', variant: 'outline' },
      assignment: { label: 'Tugas', variant: 'default' },
      solution: { label: 'Solusi', variant: 'secondary' },
    };
    return config[type] || config.slide;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Minggu Ke-</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((materi) => {
            const typeBadge = getMaterialTypeBadge(materi.material_type);
            return (
              <TableRow key={materi.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{materi.title}</TableCell>
                <TableCell>
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                </TableCell>
                <TableCell>Minggu {materi.week_number}</TableCell>
                <TableCell>
                  <Badge variant={materi.is_published ? 'default' : 'secondary'}>
                    {materi.is_published ? 'Dipublikasikan' : 'Draft'}
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
                      <DropdownMenuItem onClick={() => onEdit?.(materi.id)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Unduh
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(materi.id)}>
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}