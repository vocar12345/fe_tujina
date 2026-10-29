import { test, expect } from '@playwright/test';

/** Local `yyyy-mm-dd` offset from today by `days`. */
function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

test('main flow: fill form, pick package, see live premium, conclude, see in list', async ({
  page,
}) => {
  await page.goto('/');

  await page.fill('#firstName', 'Vuk');
  await page.fill('#lastName', 'Micic');
  await page.fill('#birthDate', '1980-01-01'); // adult -> age factor 1.0
  await page.fill('#email', 'vuk@example.com');
  await page.fill('#phone', '+386 40 123 456');
  await page.selectOption('#destination', 'Kanada'); // US_CANADA -> factor 2.0
  await page.fill('#tripStart', isoPlus(30));
  await page.fill('#tripEnd', isoPlus(39)); // 10 days inclusive

  // Package M: dailyBase 4 -> 4 x 10 x 1.0 x 2.0 = 80,00 €
  await page.click('button[data-package="M"]');
  await expect(page.getByTestId('premium-amount')).toContainText('80,00');

  await page.getByTestId('conclude-btn').click();
  await expect(page.getByTestId('conclude-success')).toBeVisible();

  await page.locator('header nav').getByRole('link', { name: 'Police' }).click();
  const rows = page.getByTestId('policy-row');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Vuk Micic');
  await expect(rows.first()).toContainText('80,00');
});

test('a concluded policy can be deleted from the list', async ({ page }) => {
  await page.goto('/');
  await page.fill('#firstName', 'Ana');
  await page.fill('#lastName', 'Novak');
  await page.fill('#birthDate', '1995-03-03');
  await page.fill('#email', 'ana@example.com');
  await page.fill('#phone', '040999888');
  await page.selectOption('#destination', 'Italija');
  await page.fill('#tripStart', isoPlus(10));
  await page.fill('#tripEnd', isoPlus(17));
  await page.click('button[data-package="S"]');
  await page.getByTestId('conclude-btn').click();
  await expect(page.getByTestId('conclude-success')).toBeVisible();

  await page.locator('header nav').getByRole('link', { name: 'Police' }).click();
  await expect(page.getByTestId('policy-row')).toHaveCount(1);

  await page.getByTestId('delete-btn').first().click();
  await expect(page.getByTestId('policy-row')).toHaveCount(0);
  await expect(page.getByTestId('policy-empty')).toBeVisible();
});
