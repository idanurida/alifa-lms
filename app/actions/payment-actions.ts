// app/actions/payment-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function verifyPayment(id: number) {
  const session = await getServerSession(authOptions)
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    throw new Error('Unauthorized')
  }

  try {
    await sql`
      UPDATE payment_evidences 
      SET 
        status = 'verified', 
        verified_by = ${session.user.id}, 
        verified_at = NOW(),
        notes = 'Terverifikasi oleh sistem'
      WHERE id = ${id}
    `
    
    revalidatePath('/keuangan/verifikasi')
    return { success: true, message: 'Bukti transfer berhasil diverifikasi' }
  } catch (error) {
    console.error('Failed to verify payment evidence:', error)
    throw new Error('Gagal memverifikasi bukti transfer')
  }
}

export async function rejectPayment(id: number, reason?: string) {
  const session = await getServerSession(authOptions)
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    throw new Error('Unauthorized')
  }

  try {
    await sql`
      UPDATE payment_evidences 
      SET 
        status = 'rejected', 
        verified_by = ${session.user.id}, 
        verified_at = NOW(),
        notes = ${reason || 'Ditolak oleh sistem'}
      WHERE id = ${id}
    `
    
    revalidatePath('/keuangan/verifikasi')
    return { success: true, message: 'Bukti transfer berhasil ditolak' }
  } catch (error) {
    console.error('Failed to reject payment evidence:', error)
    throw new Error('Gagal menolak bukti transfer')
  }
}