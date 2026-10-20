import { test, expect } from '@playwright/test';

test.describe('Punto 2 - Acciones de Usuario en Playwright', () => {
  test('Flujo de usuario completo: fill, check, click, hover, pressSequentially y press Enter', async ({ page }) => {
    // 1. Navegar al Login
    await page.goto('/signin');

    // Acción: fill() en Username
    const usernameInput = page.getByLabel('Username');
    await usernameInput.fill('Heath93');

    // Acción: fill() en Password
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('s3cret');

    // Acción: check() en Remember me
    const rememberCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    await rememberCheckbox.check();
    await expect(rememberCheckbox).toBeChecked();

    // Captura 1: Formulario de login completado con acciones
    await page.screenshot({ path: 'tests/taller3/evidencias/p2-actions-login-filled.png' });

    // Acción: click() en Sign In
    const signInBtn = page.getByRole('button', { name: 'Sign In' });
    await signInBtn.click();

    // Esperar a llegar al Home
    await page.waitForURL('**/');

    // Acción: hover() sobre el botón New de la barra de navegación superior
    const newTransactionBtn = page.getByTestId('nav-top-new-transaction');
    await expect(newTransactionBtn).toBeVisible();
    await newTransactionBtn.hover();

    // Acción: click() para iniciar nueva transacción
    await newTransactionBtn.click();
    await page.waitForURL('**/transaction/new');

    // Acción especial: pressSequentially() en el buscador dinámico de usuarios.
    // Justificación: UserListSearchForm utiliza un handler onChange debounced con búsqueda en vivo.
    // pressSequentially simula la digitación carácter por carácter activando eventos reales de teclado y filtrado dinámico.
    const searchInput = page.getByTestId('user-list-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.pressSequentially('Dina', { delay: 120 });

    // Seleccionar el usuario resultante de la búsqueda (filtrado por su username Dina20)
    const contactItem = page.locator('[data-test^=user-list-item-]').filter({ hasText: 'Dina20' });
    await expect(contactItem).toBeVisible();
    await contactItem.click();

    // Acción: fill() en Amount
    const amountInput = page.getByPlaceholder('Amount');
    await expect(amountInput).toBeVisible();
    await amountInput.fill('25');

    // Acción: fill() en Add a note
    const noteInput = page.getByPlaceholder('Add a note');
    await noteInput.fill('Pago de prueba con acciones Playwright');

    // Captura 2: Paso 2 de transacción listo para enviar
    await page.screenshot({ path: 'tests/taller3/evidencias/p2-actions-transaction-step2.png' });

    // Acción: click() en botón Pay
    const payButton = page.getByTestId('transaction-create-submit-payment');
    await expect(payButton).toBeEnabled();
    await payButton.click();

    // Verificar que la transacción fue completada
    const returnBtn = page.getByTestId('new-transaction-return-to-transactions');
    await expect(returnBtn).toBeVisible();

    // Acción: press('Enter') para activar el botón enfocado y retornar al dashboard
    await returnBtn.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL('**/');
  });
});