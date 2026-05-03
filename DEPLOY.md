# MIGRASI ALIFA LMS — Vercel → Hosting Produksi

## 📋 To-Do List

---

### 🔴 TIER 1 — Wajib Sebelum Migrasi

- [ ] **Pilih hosting** (pilih satu):
  - [ ] **VPS murah**: IDCloudHost, Niagahoster, Rumahweb (~Rp 100-300rb/bulan)
  - [ ] **VPS cloud**: DigitalOcean, Linode, AWS Lightsail (~$6-12/bulan)
  - [ ] **Shared hosting Node.js**: Hostinger, Dewaweb (kalau support Next.js)
  - [ ] **Dedicated Next.js**: Railway, Fly.io, Render.com

- [ ] **Siapkan database production**:
  - [ ] Opsi A: Tetap pakai Neon (serverless PostgreSQL) — gratis 0.5GB
  - [ ] Opsi B: Install PostgreSQL di VPS sendiri
  - [ ] Opsi C: Cloud SQL (Supabase, Railway PostgreSQL)
  - [ ] Backup DATABASE_URL yang sekarang!

- [ ] **Setup domain**:
  - [ ] Beli domain: `alifa.ac.id` atau `lms.alifa.ac.id`
  - [ ] Atau pakai subdomain dari hosting
  - [ ] Setup DNS A record / CNAME ke server

- [ ] **Generate secrets baru**:
  ```bash
  openssl rand -base64 32  # NEXTAUTH_SECRET
  ```

- [ ] **Ganti password default** `alifa123` ke password kuat production

---

### 🟡 TIER 2 — Teknis Deployment

- [ ] **Install dependency di server**:
  ```bash
  # Node.js 18+
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs nginx postgresql git

  # PM2 (process manager)
  sudo npm install -g pm2
  ```

- [ ] **Clone repo & setup**:
  ```bash
  git clone https://github.com/idanurida/alifa-lms.git
  cd alifa-lms
  npm install
  ```

- [ ] **Setup environment variables** (`.env`):
  ```env
  DATABASE_URL="postgresql://user:pass@localhost:5432/alifa_lms"
  NEXTAUTH_SECRET="(dari openssl)"
  NEXTAUTH_URL="https://alifa.ac.id"
  NODE_ENV="production"
  ```

- [ ] **Fix proxy untuk Node.js runtime** (Edge → Node):
  - Proxy.ts saat ini pakai Edge Runtime API
  - Untuk Node.js hosting, ganti `req.cookies` dan `req.headers` ke Node.js API
  - Atau pakai NextAuth middleware bawaan

- [ ] **Install & konfigurasi Nginx** (reverse proxy):
  ```nginx
  server {
    listen 80;
    server_name alifa.ac.id;
    
    location / {
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }
  ```

- [ ] **Setup HTTPS/SSL**:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d alifa.ac.id
  ```

- [ ] **Build & start aplikasi**:
  ```bash
  npm run build
  pm2 start npm --name "alifa-lms" -- start
  pm2 save
  pm2 startup
  ```

- [ ] **Setup auto-deploy (CI/CD)**:
  - [ ] GitHub Actions untuk auto-deploy saat push
  - [ ] Atau: webhook + script pull sederhana
  - [ ] Atau: deploy manual via SSH

---

### 🟢 TIER 3 — Optimasi & Maintenance

- [ ] **Backup database**:
  ```bash
  # Cron job harian
  0 2 * * * pg_dump alifa_lms > /backups/alifa_$(date +\%Y\%m\%d).sql
  ```

- [ ] **Upload file storage**:
  - [ ] Pindahkan dari `public/uploads/` ke persistent storage
  - [ ] Atau pakai cloud storage (Cloudinary, S3, Supabase Storage)

- [ ] **Monitoring & Logging**:
  - [ ] PM2 monitoring: `pm2 monit`
  - [ ] Setup alert kalau server down (UptimeRobot gratis)
  - [ ] Log rotation untuk Next.js logs

- [ ] **SMTP Email production**:
  - [ ] Setup Gmail App Password atau Resend
  - [ ] Update env: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`

- [ ] **Performance**:
  - [ ] Nginx caching untuk static assets
  - [ ] Enable gzip compression di Nginx
  - [ ] Pertimbangkan Redis untuk session storage

- [ ] **Security hardening**:
  - [ ] Firewall: `sudo ufw enable && sudo ufw allow 22,80,443`
  - [ ] Hapus `/api/setup` dan debug endpoints (sudah)
  - [ ] Rate limiting di Nginx level
  - [ ] Update dependencies rutin: `npm audit && npm update`

---

### 📝 Checklist Sebelum Go-Live

- [ ] Semua halaman bisa diakses
- [ ] Login/logout berfungsi
- [ ] Registrasi & aktivasi berfungsi
- [ ] Reset password berfungsi
- [ ] Upload file berfungsi
- [ ] Database terkoneksi & semua tabel ada
- [ ] HTTPS berfungsi (padlock hijau)
- [ ] Backup database sudah jalan
- [ ] Monitoring sudah aktif
- [ ] Password default sudah diganti
- [ ] Log error bisa dilihat

---

### 💰 Estimasi Biaya Bulanan

| Item | Range |
|------|-------|
| VPS (2GB RAM) | Rp 100rb - 200rb |
| Domain .ac.id | Rp 150rb/tahun |
| PostgreSQL | Gratis (VPS) atau $0 (Neon free) |
| SMTP (Resend) | Gratis 100/hari |
| SSL | Gratis (Let's Encrypt) |
| **TOTAL** | **~Rp 100-200rb/bulan** |

---

### 🚀 Rekomendasi

Untuk startup/kampus: **VPS IDCloudHost 2GB + Neon PostgreSQL + domain .ac.id**
- Paling murah & fleksibel
- Bisa scale up nanti
- Support lokal Indonesia

Mau saya bantu setup yang mana dulu?
