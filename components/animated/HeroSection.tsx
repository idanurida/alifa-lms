// components/animated/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

export function AnimatedHero({ title, subtitle, ctaText, onCtaClick }: HeroSectionProps) {
  return (
    <section className="py-20 text-center">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-supabase-green to-purple-500 bg-clip-text text-transparent"
          >
            {title}
          </motion.h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 pt-6"
        >
          <Button onClick={onCtaClick} size="lg" className="gap-2">
            {ctaText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}