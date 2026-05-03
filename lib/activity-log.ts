// lib/activity-log.ts
// Server-side activity logging utility
import { sql } from '@/lib/db';

interface LogEntry {
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
}

/**
 * Catat aktivitas user untuk audit trail.
 * Table `activity_logs` harus ada di database.
 */
export async function logActivity(entry: LogEntry) {
  try {
    await sql`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES (${entry.user_id}, ${entry.action}, ${entry.entity_type}, ${entry.entity_id || null}, ${entry.details || null})
    `;
  } catch {
    // Silent fail — logging tidak boleh mengganggu operasi utama
    // Table mungkin belum ada, akan dibuat saat setup
  }
}

/**
 * Buat table activity_logs jika belum ada
 */
export async function ensureActivityLogTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT,
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)`;
  } catch {
    // Table might already exist or user lacks permission
  }
}
