import { test, expect } from '@playwright/test';

test('boots, builds the board, and places units with the real models', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');

  // Wait for the game to finish placing units.
  await page.waitForFunction(() => window.__NINE_REALMS__?.ready === true, undefined, {
    timeout: 20_000,
  });

  const state = await page.evaluate(() => window.__NINE_REALMS__);
  expect(state.rosterSize).toBe(18);
  expect(state.unitsPlaced).toBeGreaterThanOrEqual(6);

  // Roster + trait engine are exposed and sane.
  const traitCount = await page.evaluate(() => window.NineRealms.roster.length);
  expect(traitCount).toBe(18);

  expect(errors, `console/page errors: ${errors.join('\n')}`).toEqual([]);
});
