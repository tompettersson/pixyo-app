import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('landing page shows login/signup buttons for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Should show landing page with auth buttons (use header for specific targeting)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Anmelden' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Kostenlos starten' })).toBeVisible();

    // Should show hero text
    await expect(page.getByRole('heading', { name: /Social Media Bilder/i })).toBeVisible();
  });

  test('clicking signup navigates to Stack Auth signup page', async ({ page }) => {
    await page.goto('/');

    // Click the header signup button
    await page.getByRole('banner').getByRole('link', { name: 'Kostenlos starten' }).click();

    // Should navigate to Stack Auth handler
    await expect(page).toHaveURL(/\/handler\/sign-up/);
  });

  test('clicking login navigates to Stack Auth login page', async ({ page }) => {
    await page.goto('/');

    // Click the header login button
    await page.getByRole('banner').getByRole('link', { name: 'Anmelden' }).click();

    // Should navigate to Stack Auth handler
    await expect(page).toHaveURL(/\/handler\/sign-in/);
  });

  test('editor route redirects unauthenticated users', async ({ page }) => {
    // Try to access editor directly
    await page.goto('/editor');

    // Should redirect to sign-in with return URL (Stack Auth handles this)
    await expect(page).toHaveURL(/\/handler\/sign-in\?after_auth_return_to/);
  });
});
