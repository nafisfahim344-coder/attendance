import { test, expect } from '@playwright/test';

test('capture history', async ({ page }) => {
  await page.goto('http://localhost:5173/history');
  // Wait for mock data to load
  await page.waitForSelector('table');
  await page.screenshot({ path: 'history_updated.png', fullPage: true });
});

test('capture dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('h1');
  await page.screenshot({ path: 'dashboard_updated.png', fullPage: true });
});
