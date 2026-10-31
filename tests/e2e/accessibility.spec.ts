import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Aksesibilitas', () => {
  test('homepage tanpa violation axe', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('halaman chat tanpa violation axe', async ({ page }) => {
    await page.goto('/chat');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('navigasi keyboard: skip link dan nav', async ({ page }) => {
    await page.goto('/');
    
    // Tab pertama ke skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a:focus').first();
    await expect(skipLink).toHaveText(/Lewati ke konten/);
    
    // Tab beberapa kali untuk sampai nav
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Link nav harus bisa difokus dan diklik dengan Enter
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    
    // Enter untuk navigasi
    const href = await focused.getAttribute('href');
    if (href) {
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(href));
    }
  });

  test('mobile 360px: tidak ada scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    
    // Tidak ada overflow horizontal
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 untuk rounding
  });

  test('mobile 360px: touch target minimal 44px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    
    // Tombol utama harus >= 44px tinggi (WCAG 2.2 AA)
    const primaryBtn = page.getByRole('link', { name: /Tanya asisten/ }).first();
    const box = await primaryBtn.boundingBox();
    
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });

  test('fokus visible untuk keyboard user', async ({ page }) => {
    await page.goto('/');
    
    // Tab dan pastikan ada outline/ring visible
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focused = page.locator(':focus').first();
    const outlineStyle = await focused.evaluate((el) => {
      const style = window.getComputedStyle(el);
      // Tailwind focus:ring atau focus:outline
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    
    // Harus ada indikasi visual (outline atau box-shadow)
    const hasVisibleFocus = 
      (outlineStyle.outline && outlineStyle.outline !== 'none') ||
      (outlineStyle.outlineWidth && parseFloat(outlineStyle.outlineWidth) > 0) ||
      (outlineStyle.boxShadow && outlineStyle.boxShadow !== 'none');
    
    expect(hasVisibleFocus).toBe(true);
  });
});

// ponytail: Lighthouse audit via playwright-lighthouse atau manual di CI
