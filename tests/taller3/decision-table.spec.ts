import { test, expect } from '@playwright/test';

// Tabla de decisión con las 4 reglas (R1 a R4) derivadas del schema Yup en BankAccountForm.tsx:
// - bankName: min 5 caracteres
// - routingNumber: exactamente 9 dígitos
// - accountNumber: min 9, max 12 dígitos
const decisionCases = [
  {
    rule: 'R1',
    title: 'R1: Los tres campos validos -> Save habilitado y la cuenta se crea en la lista',
    bankName: 'Banco Internacional',
    routingNumber: '123456789',
    accountNumber: '987654321',
    isValid: true,
  },
  {
    rule: 'R2',
    title: 'R2: bank name invalido (< 5 caracteres) -> Save deshabilitado + error',
    bankName: 'Banc', // 4 caracteres (< 5)
    routingNumber: '123456789',
    accountNumber: '987654321',
    isValid: false,
    errorFieldSelector: '#bankaccount-bankName-input-helper-text',
    expectedMessage: 'Must contain at least 5 characters',
  },
  {
    rule: 'R3',
    title: 'R3: routing number invalido (8 digitos != 9) -> Save deshabilitado + error',
    bankName: 'Banco Santander',
    routingNumber: '12345678', // 8 caracteres (!= 9)
    accountNumber: '987654321',
    isValid: false,
    errorFieldSelector: '#bankaccount-routingNumber-input-helper-text',
    expectedMessage: 'Must contain a valid routing number',
  },
  {
    rule: 'R4',
    title: 'R4: account number invalido (7 digitos < 9) -> Save deshabilitado + error',
    bankName: 'Banco BBVA Colombia',
    routingNumber: '123456789',
    accountNumber: '1234567', // 7 caracteres (< 9)
    isValid: false,
    errorFieldSelector: '#bankaccount-accountNumber-input-helper-text',
    expectedMessage: 'Must contain at least 9 digits',
  },
];

test.describe('Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria', () => {
  test.describe.configure({ mode: 'serial' });

  for (const tc of decisionCases) {
    test('[' + tc.rule + '] ' + tc.title, async ({ page }, testInfo) => {
      // Usuario del seed asignado por proyecto para evitar colisiones entre navegadores concurrentes
      const username =
        testInfo.project.name === 'firefox'
          ? 'Arvilla_Hegmann'
          : testInfo.project.name === 'webkit'
          ? 'Reyes.Osinski'
          : 'Heath93';

      // 1. Iniciar sesion y navegar al formulario
      await page.goto('/signin');
      await page.getByLabel('Username').fill(username);
      await page.locator('input#password').fill('s3cret');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('**/');

      await page.goto('/bankaccounts/new');
      await page.waitForURL('**/bankaccounts/new');

      const bankNameInput = page.getByPlaceholder('Bank Name');
      const routingNumberInput = page.getByPlaceholder('Routing Number');
      const accountNumberInput = page.getByPlaceholder('Account Number');
      const saveButton = page.getByTestId('bankaccount-submit');

      // Nombre unico para R1 para evitar colisiones entre ejecuciones
      const effectiveBankName = tc.isValid ? (tc.bankName + ' ' + Date.now().toString().slice(-4)) : tc.bankName;

      // 2. Llenar los campos segun el caso de prueba
      await bankNameInput.fill(effectiveBankName);
      await routingNumberInput.fill(tc.routingNumber);
      await accountNumberInput.fill(tc.accountNumber);

      // Blur para asegurar que Formik active validacion de campo
      await accountNumberInput.blur();

      // 3. Aserciones diferenciadas segun el resultado esperado
      if (tc.isValid) {
        // Regla R1: Boton debe estar habilitado
        await expect(saveButton).toBeEnabled();

        // Enviar formulario y esperar redireccion
        await saveButton.click();
        await page.waitForURL('**/bankaccounts');

        // La cuenta creada debe aparecer en la lista (esperar ciclo create -> list de GraphQL)
        const accountItem = page.getByText(effectiveBankName);
        await expect(accountItem).toBeVisible({ timeout: 15000 });

        // Evidencia de cuenta creada exitosamente
        await page.screenshot({ path: 'tests/taller3/evidencias/p4-bankaccount-success-created.png' });
      } else {
        // Reglas R2, R3, R4: Boton deshabilitado y mensaje de error especifico en helperText
        await expect(saveButton).toBeDisabled();

        const errorLabel = page.locator(tc.errorFieldSelector!);
        await expect(errorLabel).toBeVisible();
        await expect(errorLabel).toHaveText(tc.expectedMessage!);

        // Permanecemos en la misma URL del formulario
        await expect(page).toHaveURL(/.*\/bankaccounts\/new/);

        // Evidencia de errores de validacion (capturado en R2)
        if (tc.rule === 'R2') {
          await page.screenshot({ path: 'tests/taller3/evidencias/p4-bankaccount-validation-errors.png' });
        }
      }
    });
  }
});