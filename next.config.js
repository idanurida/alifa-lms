/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Tambah config ini untuk App Router issues
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Force clean builds
  cleanDistDir: true,
  // Tambah output standalone untuk deployment yang lebih stabil
  output: 'standalone',
}

module.exports = nextConfig