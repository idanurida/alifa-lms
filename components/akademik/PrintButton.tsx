'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
    label?: string;
    className?: string;
}

export function PrintButton({ label = "Cetak Sekarang", className }: PrintButtonProps) {
    return (
        <button
            onClick={() => window.print()}
            className={className || "px-6 py-2 bg-primary text-white rounded-md font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2"}
        >
            <Printer size={16} />
            {label}
        </button>
    );
}
