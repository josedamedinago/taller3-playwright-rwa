import { test, expect } from '@playwright/test';

test.describe('Punto 1 - Estrategias de Localizadores y Strictness', () => {
  test('Localización de 4 elementos distintos con estrategias variadas', async ({ page }) => {
    await page.goto('/signin');

    // 1. getByLabel -> Input Username
    const usernameInput = page.getByLabel('Username');
    await expect(usernameInput).toBeVisible();

    // 2. getByRole -> Botón Sign In
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();

    // 3. getByRole (checkbox) / getByLabel -> Checkbox Remember me
    const rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    await expect(rememberMeCheckbox).toBeVisible();

    // 4. getByRole (link) -> Enlace de Sign Up
    const signUpLink = page.getByRole('link', { name: /don't have an account\? sign up/i });
    await expect(signUpLink).toBeVisible();

    await page.screenshot({ path: 'tests/taller3/evidencias/p1-locators-login.png' });
  });

  test('Matriz de localizadores: getByRole, getByLabel, getByPlaceholder, getByText, getByTestId, locator(CSS)', async ({ page }) => {
    await page.goto('/signin');

    // a) getByLabel (input de Username)
    const usernameInput = page.getByLabel('Username');
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('Heath93');

    // b) locator() con CSS (input de Password)
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('s3cret');

    // c) getByText (Encabezado de la vista)
    const signInHeading = page.getByText('Sign in', { exact: true });
    await expect(signInHeading).toBeVisible();

    // d) getByTestId (Botón de envío del formulario)
    const submitBtnTestId = page.getByTestId('signin-submit');
    await expect(submitBtnTestId).toBeVisible();
    await expect(submitBtnTestId).toBeEnabled();

    // e) getByRole (Acción de submit mediante rol accesible)
    const signInBtnRole = page.getByRole('button', { name: 'Sign In' });
    await signInBtnRole.click();

    // Esperar redirección al Home
    await page.waitForURL('**/');

    // Navegación a Bank Accounts > New para verificar getByPlaceholder en campo real
    await page.goto('/bankaccounts/new');

    // f) getByPlaceholder (Campo Bank Name)
    const bankNamePlaceholder = page.getByPlaceholder('Bank Name');
    await expect(bankNamePlaceholder).toBeVisible();
  });

  test('Demostración de Strictness y resolución con filter() y rol específico', async ({ page }) => {
    await page.goto('/signin');

    // 1. Caso de strictness con enlaces:
    // Existen al menos 2 elementos <a role=link> (el logo superior y el enlace de registro)
    const allLinks = page.getByRole('link');
    await expect(allLinks).toHaveCount(2);

    // Resolución 1 con filter(): Filtramos el conjunto de links buscando el texto Sign Up
    const specificSignUpByFilter = allLinks.filter({ hasText: 'Sign Up' });
    await expect(specificSignUpByFilter).toHaveCount(1);
    await expect(specificSignUpByFilter).toBeVisible();

    // 2. Caso de strictness con inputs del formulario:
    // Hay múltiples inputs en el formulario (username, password, checkbox)
    const formControls = page.locator('.MuiFormControl-root');
    await expect(formControls.count()).resolves.toBeGreaterThan(1);

    // Resolución 2 con filter({ hasText }): Filtrar por el contenedor del campo Password
    const passwordControl = formControls.filter({ hasText: 'Password' }).locator('input');
    await expect(passwordControl).toHaveCount(1);
    await expect(passwordControl).toBeVisible();

    // Resolución 3 con getByRole y nombre accesible específico
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toHaveCount(1);
    await expect(signInButton).toBeVisible();

    await page.screenshot({ path: 'tests/taller3/evidencias/p1-locators-strictness.png' });
  });
});