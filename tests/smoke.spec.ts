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

test('combat: 开战 runs a fight to resolution and advances the round', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForFunction(() => window.__NINE_REALMS__?.ready === true, undefined, { timeout: 20_000 });

  const before = await page.evaluate(() => {
    const s = window.NineRealms.state;
    const slot = s.shop.findIndex((d) => d !== null);
    s.buyFromShop(slot);
    const u = s.bench.find((x) => x !== null)!;
    s.moveUnit(u.uid, { kind: 'board', col: 3, row: 7 });
    const started = window.NineRealms.controller.begin();
    return { started, round: s.round, phase: s.phase };
  });
  expect(before.started).toBe(true);
  expect(before.phase).toBe('combat');

  // Sim runs in the rAF loop; wait for it to resolve back to plan.
  await page.waitForFunction(
    (r) => window.NineRealms.state.phase === 'plan' && window.NineRealms.state.round > r,
    before.round,
    { timeout: 35_000 },
  );

  const after = await page.evaluate(() => ({
    round: window.NineRealms.state.round,
    result: window.NineRealms.state.lastResult,
  }));
  expect(after.round).toBe(before.round + 1);
  expect(['win', 'loss', 'draw']).toContain(after.result);

  expect(errors, `console/page errors: ${errors.join('\n')}`).toEqual([]);
});
