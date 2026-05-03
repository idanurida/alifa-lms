import { test, expect } from '@playwright/test';

test.describe('Dashboard Mahasiswa', () => {
    test('harus dapat login dan melihat dashboard dengan tema baru', async ({ page }) => {
        await page.goto('/login');
        await page.click('button[title="Mahasiswa"]');
        await page.fill('#email', 'mahasiswa@kampus.ac.id');
        await page.fill('#password', 'alifa123');
        await page.click('button[type="submit"]');

        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.*mahasiswa\/dashboard/, { timeout: 45000 });

        // Debug: Cetak semua H1 yang ditemukan
        const h1s = await page.locator('h1').all();
        console.log('H1 found count:', h1s.length);
        for (let i = 0; i < h1s.length; i++) {
            const text = await h1s[i].textContent();
            const visible = await h1s[i].isVisible();
            console.log(`H1 #${i}: "${text}" (Visible: ${visible})`);
        }

        await page.screenshot({ path: 'debug-dashboard.png' });

        // Cek judul dashboard
        await expect(page.getByRole('heading', { name: /Halo/i }).first()).toBeVisible({ timeout: 15000 });

        // Cek kartu statistik
        const statsCards = page.locator('.premium-card');
        await expect(statsCards.first()).toBeVisible({ timeout: 15000 });
    });

    test('harus dapat melihat halaman KRS dan elemen visualnya', async ({ page }) => {
        await page.goto('/login');
        await page.click('button[title="Mahasiswa"]');
        await page.fill('#email', 'mahasiswa@kampus.ac.id');
        await page.fill('#password', 'alifa123');
        await page.click('button[type="submit"]');

        await page.waitForLoadState('networkidle');
        await page.waitForURL(/.*mahasiswa\/dashboard/, { timeout: 45000 });

        await page.click('text="Ambil KRS"');
        await page.waitForURL(/.*akademik\/mahasiswa\/krs/, { timeout: 30000 });

        // Debug: Cetak semua H1
        const h1s = await page.locator('h1').all();
        console.log('KRS H1 found count:', h1s.length);
        for (let i = 0; i < h1s.length; i++) {
            const text = await h1s[i].textContent();
            console.log(`KRS H1 #${i}: "${text}"`);
        }

        await page.screenshot({ path: 'debug-krs.png' });

        await expect(page.getByRole('heading', { name: /Kartu Rencana Studi/i }).first()).toBeVisible({ timeout: 20000 });
        await expect(page.locator('text=Cetak KRS')).toBeVisible();
    });
});
