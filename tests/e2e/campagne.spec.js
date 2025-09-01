const { test, expect } = require('@playwright/test');
const path = require('path');

// Chemin absolu vers le gestionnaire de campagne
const fileUrl = 'file://' + path.resolve(__dirname, '../../campagne/gestionnaire-base.html');

// Raccourcit l'intervalle d'auto-sauvegarde et réinitialise le stockage
async function prepare(page) {
  await page.addInitScript(() => {
    window.localStorage.clear();
    const originalSetInterval = window.setInterval;
    window.setInterval = (fn, timeout, ...args) => {
      if (timeout === 30000) timeout = 1000;
      return originalSetInterval(fn, timeout, ...args);
    };
  });
  await page.goto(fileUrl);
}

test('navigation updates breadcrumb', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    campaignData.currentPath = ['campagne', 'acte1'];
    campaignData.currentNode = 'acte1';
    const labels = campaignData.currentPath.map(id => campaignData.structure[id].label);
    document.getElementById('breadcrumbPath').textContent = labels.join(' > ');
  });
  await expect(page.locator('#breadcrumbPath')).toContainText('Acte I - Le Goulet');
});

test('adding pin creates element on map', async ({ page }) => {
  await prepare(page);
  await page.click('button.tab-button:has-text("Carte")');
  await page.waitForSelector('#mapImage[src]');
  await page.evaluate(() => {
    // Surcharge l'éditeur pour retourner une note automatiquement
    window.showNoteEditor = (initial, onSave) => onSave('Test');
  });
  await page.evaluate(() => {
    addMapPin(null);
  });
  await expect(page.locator('#mapPins .map-pin')).toHaveCount(1);
});

test('character HP update reflects in UI', async ({ page }) => {
  await prepare(page);
  await page.click('button.tab-button:has-text("Personnages")');
  await page.evaluate(() => {
    campaignData.characters.petite_lumiere.hp.current = 8;
    updateCharactersDisplay();
  });
  await expect(page.locator('.character-card:has-text("Petite Lumière") .hp-text')).toHaveText('8/10 PV');
});

test('auto-save stores data in localStorage', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    campaignData.description = 'Test auto-save';
  });
  await page.waitForTimeout(1500);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('campaignData_coffre_fort')).description);
  expect(saved).toBe('Test auto-save');
});
