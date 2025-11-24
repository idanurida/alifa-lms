// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi gambar - penting untuk localhost dan domain eksternal
  images: {
    // Domains yang diizinkan Next.js Image untuk mengakses gambar
    // Tambahkan localhost jika Anda menyajikan gambar dari server lokal (misalnya untuk file upload sementara)
    domains: [
      'localhost', // <-- Tambahkan ini untuk development lokal
      'your-storage-domain.com', // Ganti dengan domain CDN/file hosting Anda nanti
      'your-neon-db-assets.com', // Misalnya jika Neon menyediakan akses file langsung (tidak disarankan)
      // Contoh lain:
      // 'cdn.supabase.io',
      // 'your-bucket.fra1.digitaloceanspaces.com',
      // 'img.yourdomain.com',
    ],
    // Atau, gunakan remotePatterns untuk kontrol lebih lanjut
    remotePatterns: [
      {
        protocol: 'http', // Untuk localhost
        hostname: 'localhost',
        port: '3000', // Port development Anda
        pathname: '/uploads/**', // Sesuaikan path tempat Anda menyajikan file upload lokal
      },
      {
        protocol: 'https',
        hostname: 'your-storage-domain.com', // Ganti dengan domain Anda
        pathname: '/images/**', // Path gambar di CDN
      },
      // Tambahkan pola lain jika diperlukan
    ],
  },

  // Konfigurasi webpack (opsional, untuk tweak lanjutan)
  webpack: (config, { isServer }) => {
    // Tidak ada tweak khusus untuk sekarang
    return config;
  },

  // Opsi lainnya...
  experimental: {
    // serverActions: true, // Sudah aktif secara default di App Router
    // typedRoutes: false, // Default
  },

  // Headers tambahan untuk keamanan (opsional)
  async headers() {
    return [
      {
        source: '/(.*)', // Berlaku untuk semua path
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Mencegah iframe dari domain lain
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Mencegah MIME-type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Atur kebijakan referrer
          },
        ],
      },
    ];
  },

  // Jika Anda menggunakan fitur experimental lain, tambahkan di sini
  // Jika Anda ingin mengexport ke HTML statis
  // output: 'export', // <-- HAPUS jika Anda menggunakan SSR (server-side rendering) seperti dengan NextAuth
};

module.exports = nextConfig;