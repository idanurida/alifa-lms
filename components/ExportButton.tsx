// components/ExportButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export-excel';

interface ExportButtonProps {
  filename: string;
  columns: string[];
  data: Record<string, unknown>[];
  label?: string;
  variant?: 'default' | 'outline';
}

export default function ExportButton({
  filename,
  columns,
  data,
  label = 'Ekspor ke Excel',
  variant = 'default',
}: ExportButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => exportToCSV(filename, columns, data)}
      disabled={!data || data.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
