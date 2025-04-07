import { expect, test } from '@playwright/test';

test.describe('Hash Verifier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/circom');

    // Click on the Hash Verifier tab trigger by role
    await page.getByRole('tab', { name: /Hash Verifier/ }).click();

    // Wait for the Hash tab content to be active
    await page.waitForSelector('[data-state="active"][role="tabpanel"]');
  });

  test('should render Hash Verifier tab', async ({ page }) => {
    // Check that the Hash title is visible with correct text
    await expect(page.locator('h2:has-text("Hash Verification")')).toBeVisible();
  });

  test('should show message in tab panel', async ({ page }) => {
    // Check for content inside the active tab panel
    const activeTabPanel = page.locator('[data-state="active"][role="tabpanel"]');

    // There should be some content in the tab panel
    await expect(activeTabPanel).not.toBeEmpty();

    // The active tab panel should be visible
    await expect(activeTabPanel).toBeVisible();

    // Look for the heading in the tabpanel without relying on data-testid
    await expect(activeTabPanel.locator('h3:has-text("Hash Verifier")')).toBeVisible();
  });

  test('should show form elements in component', async ({ page }) => {
    // Check for form elements instead of alert
    const activePanel = page.locator('[data-state="active"][role="tabpanel"]');

    // Look for input fields which should be present
    await expect(activePanel.getByTestId('input1')).toBeVisible();
    await expect(activePanel.getByTestId('input2')).toBeVisible();
  });

  test('should display all input fields', async ({ page }) => {
    // Check that the input fields are displayed
    await expect(page.getByLabel('Input 1')).toBeVisible();
    await expect(page.getByLabel('Input 2 (Optional)')).toBeVisible();
    await expect(page.getByLabel('Input 3 (Optional)')).toBeVisible();
    await expect(page.getByLabel('Input 4 (Optional)')).toBeVisible();
    await expect(page.getByLabel(/Use custom expected hash/i)).toBeVisible();
  });

  test('should load sample values when clicking the button', async ({ page }) => {
    // Click the load sample button
    await page.getByRole('button', { name: /Load Sample Values/i }).click();

    // Check that the input fields are populated
    const input1 = await page.getByTestId('input1');
    const input2 = await page.getByTestId('input2');
    const input3 = await page.getByTestId('input3');
    const input4 = await page.getByTestId('input4');

    // Wait for the fields to be populated
    await expect(input1).toHaveValue(/./);
    await expect(input2).toHaveValue(/./);
    await expect(input3).toHaveValue(/./);
    await expect(input4).toHaveValue(/./);

    // Verify calculated hash is displayed
    await expect(page.locator('text=Calculated Hash:')).toBeVisible();
  });

  test('should show custom hash input when checkbox is checked', async ({ page }) => {
    // Check the custom hash checkbox
    await page.getByLabel(/Use custom expected hash/i).check();

    // Check that the expected hash input field appears
    await expect(page.getByTestId('expected-hash-input')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Check that we can switch between tabs
    // Click Age Verifier tab
    await page.getByRole('tab', { name: /Age Verifier/ }).click();
    await expect(page.locator('h2:has-text("Age Verification")')).toBeVisible();

    // Click FHIR Verifier tab
    await page.getByRole('tab', { name: /FHIR Verifier/ }).click();
    await expect(page.locator('h2:has-text("FHIR Resource Verification")')).toBeVisible();

    // Click back to Hash tab
    await page.getByRole('tab', { name: /Hash Verifier/ }).click();
    await expect(page.locator('h2:has-text("Hash Verification")')).toBeVisible();
  });

  // Skip the visual snapshot test until we have generated baseline images
  test.skip('should take a visual snapshot', async ({ page }) => {
    // Take a screenshot of the entire component for visual regression testing
    const tabPanel = await page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toHaveScreenshot('hash-verifier.png');
  });
});
