// components/animated/CTASection.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export function AnimatedCTA({ title, subtitle, ctaText, ctaLink }: CTASectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-20 bg-gradient-to-r from-primary to-sky-500 text-white"
    >
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="pt-4">
          <Button asChild size="lg" variant="secondary" className="text-primary">
            <Link href={ctaLink}>
              {ctaText}
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}