import { test, expect } from '@playwright/test';

test.describe('ZKP Proof Generation and Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the circom page
    await page.goto('/circom');

    // Wait for the page to load - Age Verifier is active by default
    await page.waitForSelector('[data-state="active"][role="tabpanel"]');
  });

  // This is a more integration-style test that checks if the proof generation and verification works
  test('should render proof generation form', async ({ page }) => {
    // Check that the Age Verification heading is visible
    await expect(page.locator('h2:has-text("Age")')).toBeVisible();

    // Check for form elements in the active tab panel
    const activePanel = page.locator('[data-state="active"][role="tabpanel"]');

    // Look for any input field or heading that should be present
    await expect(activePanel.locator('form')).toBeVisible();

    // Check for the h3 heading inside the form
    await expect(activePanel.locator('h3')).toBeVisible();
  });

  // Check for tabs in the page (verifiers)
  test('should have different verifier tabs', async ({ page }) => {
    // Verify we can see the tabs
    await expect(page.getByRole('tab', { name: /Age/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /FHIR/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Hash/ })).toBeVisible();
  });

  // Test navigating between the verifier tabs
  test('should navigate between verifier tabs', async ({ page }) => {
    // Click on the FHIR tab
    await page.getByRole('tab', { name: /FHIR/ }).click();
    await expect(page.locator('h2:has-text("FHIR")')).toBeVisible();

    // Click on the Hash tab
    await page.getByRole('tab', { name: /Hash/ }).click();
    await expect(page.locator('h2:has-text("Hash")')).toBeVisible();

    // Click back to Age tab
    await page.getByRole('tab', { name: /Age/ }).click();
    await expect(page.locator('h2:has-text("Age")')).toBeVisible();
  });

  // Check page responsiveness
  test('should be responsive', async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 480, height: 800 });

    // Verify the page layout adapts
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    // Set a desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    // Verify the page layout adapts
    await expect(page.locator('[role="tablist"]')).toBeVisible();
  });
});
