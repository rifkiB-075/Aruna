import { expect, test } from "@playwright/test";

test("beranda menampilkan batas cakupan", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("note").first()).toContainText("tidak menerima pengajuan");
});

test("admin tertutup untuk anonim", async ({ page }) => {
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(404);
});

test("header keamanan hadir", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["content-security-policy"]).toBeTruthy();
});
