import { expect, test } from '@playwright/test';

const result = {
  overallRiskScore: 42,
  protectionScore: 68,
  riskLevel: 'MEDIUM',
  displacementYear: 2034,
  displacementRange: { earliest: 2032, latest: 2038 },
  summary: 'Routine preparation can be assisted, while judgement remains human-led.',
  taskAnalysis: [{ task: 'Advise managers', riskScore: 30, timeframe: '5-10 years', reasoning: 'Human judgement and trust remain important.', automationBarriers: ['Trust'] }],
  timeline: { immediateRisk: 'Drafting support', mediumTermRisk: 'Decision support', longTermRisk: 'Role redesign' },
  skillsToBuilt: ['AI-assisted decision-making'],
  careerPivots: [{ role: 'People Partner', reason: 'Relationship-led work', transferability: 'HIGH' }],
  keyInsight: 'Use AI for preparation, not final judgement.',
  researchContext: [],
};

async function completeForm(page) {
  await page.getByLabel('Your Job Title *').fill('HR Manager');
  await page.getByLabel('Add a daily task').fill('Advise managers');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

test('completes analysis without an email wall and fits the viewport', async ({ page }) => {
  await page.route('**/api/analyze', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) }));
  await page.goto('/');
  await completeForm(page);
  await page.getByRole('button', { name: 'Analyse My AI Risk' }).click();
  await expect(page.getByRole('heading', { name: 'AI job risk results for HR Manager' })).toBeFocused();
  await expect(page.getByText('~2034 (2032-2038)')).toBeVisible();
  await expect(page.getByText(/planning signal, not a promised date/i)).toBeVisible();
  const cvHandoff = page.getByRole('button', { name: 'Build and Tailor My CV' });
  await expect(cvHandoff).toBeVisible();
  await cvHandoff.click();
  await expect(page.getByRole('dialog', { name: 'Send these details to the CV builder?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send and open CV builder' })).toBeVisible();
  await expect(page.getByText('Email yourself the full report')).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('preserves the form and explains a provider failure', async ({ page }) => {
  await page.route('**/api/analyze', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'The analysis service is busy. Please wait a moment and try again.' }) }));
  await page.goto('/');
  await completeForm(page);
  await page.getByRole('button', { name: 'Analyse My AI Risk' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'The analysis service is busy' })).toBeFocused();
  await expect(page.getByLabel('Your Job Title *')).toHaveValue('HR Manager');
  await expect(page.getByRole('button', { name: 'Remove task: Advise managers' })).toBeVisible();
});

test('theme persists and all controls have accessible names', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByLabel('Industry (optional)')).toBeVisible();
  await expect(page.getByLabel('Country/Region (optional)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});
