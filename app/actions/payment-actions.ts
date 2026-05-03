// app/actions/payment-actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function verifyPayment(id: number) {
  const session = await getServerSession(authOptions)
  if (!session || !['super_admin', 'staff_keuangan'].includes(session.user.role as string)) {
    throw new Error('Unauthorized')
  }

  try {
    await sql`
      UPDATE payment_evidences 
      SET 
        status = 'approved', 
        verified_by = ${parseInt(session.user.id)}, 
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
        verified_by = ${parseInt(session.user.id)}, 
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

export async function submitPaymentEvidence(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'mahasiswa') {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const studentResult = await sql`SELECT id FROM students WHERE user_id = ${parseInt(session.user.id)}`
    if (!studentResult || studentResult.length === 0) {
      return { success: false, error: 'Data mahasiswa tidak ditemukan' }
    }

    const studentId = studentResult[0].id
    const academicPeriodId = parseInt(formData.get('academic_period_id') as string)
    const amount = parseFloat(formData.get('amount') as string)
    const transferDate = formData.get('transfer_date') as string
    const bankName = formData.get('bank_name') as string
    const accountNumber = formData.get('account_number') as string
    const accountName = formData.get('account_name') as string
    const file = formData.get('evidence_file') as File | null

    if (!academicPeriodId || !amount || !transferDate) {
      return { success: false, error: 'Harap isi semua field yang wajib' }
    }

    if (!file || file.size === 0) {
      return { success: false, error: 'Harap unggah bukti transfer' }
    }

    // Upload file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `bukti_${studentId}_${Date.now()}_${safeName}`
    const fullPath = path.join(uploadDir, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(fullPath, buffer)

    const evidencePath = `/uploads/${fileName}`

    // Insert record — simpan ke public schema secara eksplisit
    await sql`
      INSERT INTO public.payment_evidences (
        student_id, academic_period_id, amount, evidence_path, transfer_date,
        bank_name, account_number, account_name, status
      )
      VALUES (
        ${studentId}, ${academicPeriodId}, ${amount}, ${evidencePath}, ${transferDate},
        ${bankName || null}, ${accountNumber || null}, ${accountName || null}, 'pending'
      )
    `

    revalidatePath('/keuangan/bukti-transfer')
    return { success: true, message: 'Bukti transfer berhasil diunggah' }
  } catch (error) {
    console.error('Failed to submit payment evidence:', error)
    return { success: false, error: 'Gagal mengunggah bukti transfer' }
  }
}