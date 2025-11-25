/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 120, // ← TAMBAH INI
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'], // ← OPSIONAL: jika pakai bcryptjs
  },
}

module.exports = nextConfig