// lib/init-complete.ts
import { sql } from './db';
import { createCompleteSchema } from './schema';
import { seedSampleData } from './seed-data';

async function initializeCompleteSystem() {
  try {
    console.log('🎓 Initializing ALIFA Institute LMS Complete System...');

    // Buat skema database lengkap
    await createCompleteSchema();
    console.log('✅ Database schema created/updated!');

    // Isi dengan data sample
    await seedSampleData();
    console.log('✅ Sample data seeded!');

    console.log('🚀 ALIFA Institute LMS ready for development!');
    console.log('📊 Next: Start building API routes and frontend');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1); // Keluar dengan error code jika gagal
  }
}

// Jalankan fungsi jika file ini dijalankan langsung (bukan diimpor)
if (require.main === module) {
  initializeCompleteSystem();
}

export { initializeCompleteSystem };