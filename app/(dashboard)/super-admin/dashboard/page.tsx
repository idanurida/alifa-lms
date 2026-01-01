// app/(dashboard)/super-admin/dashboard/page.tsx
import { redirect } from 'next/navigation';

export default function RedirectToSuperAdmin() {
  redirect('/superadmin');
}