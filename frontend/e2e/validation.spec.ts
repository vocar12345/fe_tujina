import { test, expect } from '@playwright/test';

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

test('empty form: the conclude button is disabled', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('conclude-btn')).toBeDisabled();
});

test('invalid email shows a validation error', async ({ page }) => {
  await page.goto('/');
  await page.fill('#email', 'not-an-email');
  await page.locator('#email').blur();
  await expect(page.getByText('Vnesite veljaven e-poštni naslov.')).toBeVisible();
});

test('end date before start date shows a cross-field error', async ({ page }) => {
  await page.goto('/');
  await page.fill('#tripStart', isoPlus(39));
  await page.fill('#tripEnd', isoPlus(30));
  await page.locator('#tripEnd').blur();
  await expect(
    page.getByText('Datum konca ne sme biti pred datumom začetka.'),
  ).toBeVisible();
});

test('a start date in the past shows an error', async ({ page }) => {
  await page.goto('/');
  await page.fill('#tripStart', isoPlus(-5));
  await page.locator('#tripStart').blur();
  await expect(page.getByText('Datum ne sme biti v preteklosti.')).toBeVisible();
});

test('cannot conclude without selecting a package', async ({ page }) => {
  await page.goto('/');
  await page.fill('#firstName', 'Vuk');
  await page.fill('#lastName', 'Micic');
  await page.fill('#birthDate', '1980-01-01');
  await page.fill('#email', 'vuk@example.com');
  await page.fill('#phone', '040123456');
  await page.selectOption('#destination', 'Italija');
  await page.fill('#tripStart', isoPlus(10));
  await page.fill('#tripEnd', isoPlus(17));
  // no package selected -> still disabled
  await expect(page.getByTestId('conclude-btn')).toBeDisabled();
});
