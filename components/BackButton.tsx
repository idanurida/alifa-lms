'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

export default function BackButton({ label = 'Batal', variant = 'outline', className }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant={variant}
            onClick={() => router.back()}
            className={className}
            type="button"
        >
            {label}
        </Button>
    );
}
