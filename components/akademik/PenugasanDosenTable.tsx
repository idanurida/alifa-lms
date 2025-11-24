// components/akademik/PenugasanDosenTable.tsx
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
import { LecturerAssignment } from '@/types/akademik';

interface PenugasanDosenTableProps {
  data: LecturerAssignment[];
}

export default function PenugasanDosenTable({ data }: PenugasanDosenTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada penugasan dosen.</p>
      </div>
    );
  }

  const getAssignmentTypeBadge = (type: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      main: { label: 'Utama', variant: 'default' },
      assistant: { label: 'Asisten', variant: 'secondary' },
      guest: { label: 'Tamu', variant: 'outline' },
    };
    return config[type] || config.guest;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dosen</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead className="w-[100px]">Peran</TableHead>
            <TableHead className="text-right">SKS</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((ass) => {
            const typeBadge = getAssignmentTypeBadge(ass.assignment_type);
            return (
              <TableRow key={ass.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="font-medium">{ass.lecturer.name}</div>
                  <div className="text-xs text-muted-foreground">NIDN: {ass.lecturer.nidn}</div>
                </TableCell>
                <TableCell>
                  <div className="font-mono">{ass.class.course_code} - {ass.class.class_code}</div>
                  <div className="text-xs">{ass.class.course_name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                </TableCell>
                <TableCell className="text-right">{ass.teaching_load}</TableCell>
                <TableCell>
                  <Badge variant={ass.is_active ? 'default' : 'secondary'}>
                    {ass.is_active ? 'Aktif' : 'Nonaktif'}
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Hapus Penugasan
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