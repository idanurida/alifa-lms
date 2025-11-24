// components/animated/CTA.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AnimatedCTAProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export function AnimatedCTA({ title, subtitle, ctaText, ctaLink }: AnimatedCTAProps) {
  return (
    <section className="py-16 bg-supabase-green/10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <Link href={ctaLink}>
            <Button 
              size="lg" 
              className="bg-supabase-green hover:bg-supabase-green/90"
            >
              {ctaText}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}