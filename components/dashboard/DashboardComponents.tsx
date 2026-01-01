import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// --- Stats Card Component ---
export interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    trend?: number;
    href?: string;
    variant?: "default" | "warning" | "danger" | "info";
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    href,
    variant = "default",
    className
}: StatsCardProps) {
    const variantStyles = {
        default: "border-primary/10 shadow-lg shadow-primary/5 hover:shadow-primary/10",
        warning: "border-yellow-500/20 bg-yellow-500/5 shadow-lg shadow-yellow-500/5 hover:shadow-yellow-500/10",
        danger: "border-red-500/20 bg-red-500/5 shadow-lg shadow-red-500/5 hover:shadow-red-500/10",
        info: "border-blue-500/20 bg-blue-500/5 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10"
    };

    const content = (
        <Card className={cn(
            "premium-glass bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden",
            variantStyles[variant],
            className
        )}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-[#0ea5e9] transition-colors">{title}</CardTitle>
                <div className={cn(
                    "p-2.5 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm",
                    variant === 'warning' ? 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400' :
                        variant === 'danger' ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                            variant === 'info' ? 'bg-sky-500/10 text-[#0ea5e9] dark:text-sky-300' :
                                'bg-[#0ea5e9]/10 text-[#0ea5e9] dark:text-sky-300'
                )}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight mb-1.5 text-slate-900 dark:text-white leading-none">{value}</div>
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{description}</p>
                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            trend > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        )}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

// --- Quick Action Component ---
export interface QuickActionProps {
    title: string;
    description: string;
    icon: any;
    href: string;
    variant?: "default" | "warning" | "danger" | "success";
    className?: string;
}

export function QuickAction({
    title,
    description,
    icon: Icon,
    href,
    variant = "default",
    className
}: QuickActionProps) {
    const variantStyles = {
        default: "border-slate-200 dark:border-white/10 hover:border-[#0ea5e9]/30 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-200",
        warning: "border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        danger: "border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400",
        success: "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    };

    return (
        <Link
            href={href}
            className={cn(
                "group flex flex-col p-6 border-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-[#0ea5e9]/5",
                variantStyles[variant],
                className
            )}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3.5 rounded-2xl bg-[#0ea5e9]/10 shadow-sm transition-all duration-500 group-hover:bg-[#0ea5e9] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#0ea5e9]/20">
                    <Icon className={cn("h-6 w-6 text-[#0ea5e9] group-hover:text-white transition-colors")} />
                </div>
                <span className="font-bold text-sm uppercase tracking-widest leading-none text-slate-900 dark:text-white">{title}</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed pr-4">{description}</p>
        </Link>
    );
}

// --- Module Card Component ---
export interface ModuleCardProps {
    title: string;
    description: string;
    icon: any;
    href: string;
    className?: string;
}

export function ModuleCard({
    title,
    description,
    icon: Icon,
    href,
    className
}: ModuleCardProps) {
    return (
        <Link href={href} className={cn("group", className)}>
            <Card className="premium-card relative overflow-hidden h-full transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200/50 dark:border-white/5 hover:border-[#0ea5e9]/30 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl shadow-sm hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/5 blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-[#0ea5e9]/10" />
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9] shadow-inner transition-all duration-500 group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#0ea5e9]/20">
                            <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tighter text-slate-800 dark:text-white group-hover:text-[#0ea5e9] transition-colors leading-tight">
                            {title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}

// --- Dashboard Heading Component ---
export function DashboardHeading({
    title,
    subtitle,
    badge
}: {
    title: string;
    subtitle?: string;
    badge?: string;
}) {
    return (
        <div className="flex flex-col gap-3 mb-10">
            <div className="flex items-center gap-5">
                <h1 className="text-4xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
                    {title}
                </h1>
                {badge && (
                    <div className="px-4 py-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-[#0ea5e9] shadow-sm animate-in fade-in zoom-in duration-1000">
                        {badge}
                    </div>
                )}
            </div>
            {subtitle && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-2xl border-l-4 border-[#0ea5e9]/20 pl-6 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
