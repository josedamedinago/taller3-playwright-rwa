import { test, expect } from '@playwright/test';

test.describe('Punto 3 - Aserciones en Playwright', () => {
  test('Flujo con aserciones de estado, texto/valor, página, negativa (.not), genérica (.toBe), soft y toBeOK()', async ({ page, request }) => {
    // Aserción toBeOK() sobre la API del backend para la petición de login
    const loginApiResp = await request.post('http://localhost:3001/login', {
      data: {
        type: 'LOGIN',
        username: 'Heath93',
        password: 's3cret',
      },
    });
    await expect(loginApiResp).toBeOK();

    // Interceptar la respuesta del login en el navegador
    const loginResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/login') && resp.request().method() === 'POST'
    );

    // 1. Navegar a /signin
    await page.goto('/signin');

    // (c) Aserción de página: toHaveTitle
    await expect(page).toHaveTitle(/Cypress Real World App/i);

    // (d) Aserción negativa con .not: Mensaje de error no debe ser visible antes del envío
    await expect(page.getByTestId('signin-error')).not.toBeVisible();

    const usernameInput = page.getByLabel('Username');
    await usernameInput.fill('Heath93');

    // (b) Aserción de valor: toHaveValue
    await expect(usernameInput).toHaveValue('Heath93');

    const passwordInput = page.locator('input#password');
    await passwordInput.fill('s3cret');

    // (a) Aserción de estado: toBeEnabled
    const submitBtn = page.getByTestId('signin-submit');
    await expect(submitBtn).toBeEnabled();

    // Captura 1: Formulario validado con aserciones
    await page.screenshot({ path: 'tests/taller3/evidencias/p3-assertions-login-verified.png' });

    // Enviar login
    await submitBtn.click();

    // Validar respuesta del navegador
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.ok()).toBe(true);

    // (c) Aserción de página: toHaveURL
    await expect(page).toHaveURL(/.*localhost:3000\/?$/);

    // (a) Aserción de estado: toBeVisible en elemento del dashboard
    const newTxBtn = page.getByTestId('nav-top-new-transaction');
    await expect(newTxBtn).toBeVisible();

    // (b) Aserción de texto: toHaveText en el perfil del usuario autenticado
    const userFullName = page.getByTestId('sidenav-user-full-name');
    await expect(userFullName).toHaveText('Ted P');

    // Aserción suave (soft assertion): continúa la ejecución incluso ante diferencias secundarias
    await expect.soft(page.getByTestId('nav-top-notifications-link')).toBeVisible();

    // Iniciar flujo de transacción
    await newTxBtn.click();
    await expect(page).toHaveURL(/.*\/transaction\/new/);

    const searchInput = page.getByTestId('user-list-search-input');
    await searchInput.pressSequentially('Dina', { delay: 100 });

    const contactItem = page.locator('[data-test^=user-list-item-]').filter({ hasText: 'Dina20' });
    await expect(contactItem).toBeVisible();

    // (d) Aserción genérica con .toBe
    const contactCount = await page.locator('[data-test^=user-list-item-]').count();
    expect(contactCount > 0).toBe(true);

    await contactItem.click();

    await page.getByPlaceholder('Amount').fill('15');
    await page.getByPlaceholder('Add a note').fill('Aserción con toBeOK en backend');

    // Interceptar la respuesta de creación de transacción
    const txResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/transactions') && resp.request().method() === 'POST'
    );

    await page.getByTestId('transaction-create-submit-payment').click();

    const txResponse = await txResponsePromise;
    expect(txResponse.ok()).toBe(true);

    // Verificar pantalla final
    const returnBtn = page.getByTestId('new-transaction-return-to-transactions');
    await expect(returnBtn).toBeVisible();

    // Captura 2: Transacción confirmada y validada
    await page.screenshot({ path: 'tests/taller3/evidencias/p3-assertions-transaction-created.png' });
  });
});