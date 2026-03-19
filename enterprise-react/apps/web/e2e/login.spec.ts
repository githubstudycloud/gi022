import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
    await expect(page.getByLabel('邮箱')).toBeVisible();
    await expect(page.getByLabel('密码')).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('邮箱不能为空')).toBeVisible();
    await expect(page.getByText('密码不能为空')).toBeVisible();
  });

  test('shows email format error', async ({ page }) => {
    await page.getByLabel('邮箱').fill('not-an-email');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('邮箱格式不正确')).toBeVisible();
  });

  test('redirects to dashboard on successful login', async ({ page }) => {
    await page.getByLabel('邮箱').fill('admin@example.com');
    await page.getByLabel('密码').fill('password123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});
