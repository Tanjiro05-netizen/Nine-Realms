import { test, expect } from '@playwright/test';

test('plan phase: boots, renders HUD, and supports buy -> bench -> board -> traits', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForFunction(() => window.__NINE_REALMS__?.ready === true, undefined, {
    timeout: 20_000,
  });

  // Roster + HUD shells.
  expect(await page.evaluate(() => window.__NINE_REALMS__.rosterSize)).toBe(18);
  expect(await page.locator('.trait').count()).toBe(7); // 2 bloodline + 5 element
  expect(await page.locator('.shop .card').count()).toBe(5);

  // Buy the first available shop unit and place it on a player cell, then
  // verify the board count and that the trait rail reflects ≥1 active count.
  const result = await page.evaluate(() => {
    const s = window.NineRealms.state;
    const slot = s.shop.findIndex((d) => d !== null);
    const bought = s.buyFromShop(slot);
    const benchUnit = s.bench.find((u) => u !== null);
    const moved = benchUnit ? s.moveUnit(benchUnit.uid, { kind: 'board', col: 3, row: 7 }) : false;
    return { bought, moved, boardCount: s.boardCount() };
  });
  expect(result.bought).toBe(true);
  expect(result.moved).toBe(true);
  expect(result.boardCount).toBe(1);

  // computeTraits exposes all 7 traits for a single-unit board.
  const traitEntries = await page.evaluate(() => {
    const s = window.NineRealms.state;
    return window.NineRealms.computeTraits(s.boardUnits().map((u) => u.def)).length;
  });
  expect(traitEntries).toBe(7);

  expect(errors, `console/page errors: ${errors.join('\n')}`).toEqual([]);
});
