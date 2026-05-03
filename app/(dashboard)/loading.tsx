// app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0ea5e9] mx-auto" />
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      </div>
    </div>
  );
}
