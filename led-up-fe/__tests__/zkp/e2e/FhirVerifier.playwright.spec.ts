import { expect, test } from '@playwright/test';

test.describe('FHIR Verifier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/circom');

    // Click on the FHIR tab trigger by role
    await page.getByRole('tab', { name: /FHIR/ }).click();

    // Wait for the FHIR tab content to be active
    await page.waitForSelector('[data-state="active"][role="tabpanel"]');
  });

  test('should render FHIR Verifier tab', async ({ page }) => {
    // Check that the FHIR title is visible
    await expect(page.locator('h2:has-text("FHIR")')).toBeVisible();
  });

  test('should show message in tab panel', async ({ page }) => {
    // Check for content inside the active tab panel
    const activeTabPanel = page.locator('[data-state="active"][role="tabpanel"]');

    // There should be some content in the tab panel
    await expect(activeTabPanel).not.toBeEmpty();

    // The active tab panel should be visible
    await expect(activeTabPanel).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Check that we can switch between tabs
    // Click Age Verifier tab
    await page.getByRole('tab', { name: /Age Verifier/ }).click();
    await expect(page.locator('h2:has-text("Age")')).toBeVisible();

    // Click back to FHIR tab
    await page.getByRole('tab', { name: /FHIR/ }).click();
    await expect(page.locator('h2:has-text("FHIR")')).toBeVisible();

    // Click Hash Verifier tab
    await page.getByRole('tab', { name: /Hash Verifier/ }).click();
    await expect(page.locator('h2:has-text("Hash")')).toBeVisible();
  });

  // Skip the visual snapshot test until we have generated baseline images
  test.skip('should take a visual snapshot', async ({ page }) => {
    // Take a screenshot of the entire component for visual regression testing
    const tabPanel = await page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toHaveScreenshot('fhir-verifier.png');
  });
});
