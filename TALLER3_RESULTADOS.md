# TALLER 3: AUTOMATIZACIÓN DE PRUEBAS E2E CON PLAYWRIGHT
## Proyecto: Cypress Real World App (RWA)

---

## 1. Versión de Playwright y Comando de Ejecución

- **Versión de Playwright:** `@playwright/test` **Version 1.63.0**
- **Comando de ejecución empleado:**
  ```bash
  npx playwright test tests/taller3
  ```
- **Configuración clave (`playwright.config.ts`):**
  - `use.testIdAttribute: 'data-test'` (adaptado a la RWA que utiliza atributos `data-test` en sus componentes React y MUI).
  - `reporter: [['html'], ['list']]` (salida en consola paso a paso y reporte visual HTML).
  - `baseURL: 'http://localhost:3000'`
  - Navegadores ejecutados en paralelo: **Chromium**, **Firefox** y **WebKit**.

---

## 2. Puntos del Taller: Código, Locators, Acciones y Aserciones

### PUNTO 1 - `locators.spec.ts`

#### Código Completo
```typescript
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
```

#### Lista de Locators, Acciones y Aserciones utilizadas en Punto 1
- `page.getByLabel('Username')`: Localiza el campo de usuario mediante su etiqueta accesible de Material-UI. Valida visibilidad del control.
- `page.getByRole('button', { name: 'Sign In' })`: Localiza el botón de envío mediante su rol semántico y nombre accesible. Valida su estado y realiza la acción `click()`.
- `page.getByRole('checkbox', { name: 'Remember me' })`: Localiza la casilla de verificación accesible por su rol `checkbox` y etiqueta. Valida visibilidad.
- `page.getByRole('link', { name: /don't have an account\? sign up/i })`: Localiza el enlace de registro mediante rol y expresión regular. Valida visibilidad.
- `page.locator('input#password')`: Selector CSS estándar por ID nativo. Valida visibilidad y recibe `fill('s3cret')`.
- `page.getByText('Sign in', { exact: true })`: Localizador de texto exacto sobre la tipografía de encabezado de la vista. Valida visibilidad del título.
- `page.getByTestId('signin-submit')`: Localizador por atributo `data-test="signin-submit"`. Valida visibilidad y que el botón esté habilitado (`toBeEnabled()`).
- `page.getByPlaceholder('Bank Name')`: Localizador por atributo `placeholder` del componente `BankAccountForm`. Valida presencia del placeholder en el DOM.
- `page.getByRole('link').filter({ hasText: 'Sign Up' })`: Resuelve la violación de strictness de múltiples enlaces filtrando por el texto secundario deseado.
- `page.locator('.MuiFormControl-root').filter({ hasText: 'Password' }).locator('input')`: Encadenamiento con `.filter()` para aislar el input de contraseña sin ambigüedad.

---

### PUNTO 2 - `actions.spec.ts`

#### Código Completo
```typescript
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
```

#### Lista de Locators, Acciones y Aserciones utilizadas en Punto 2
- `await usernameInput.fill('Heath93')`: Asigna el valor en bloque al campo de texto de login.
- `await passwordInput.fill('s3cret')`: Asigna la credencial de acceso.
- `await rememberCheckbox.check()`: Cambia el estado del checkbox a seleccionado y `await expect(rememberCheckbox).toBeChecked()` valida la activación del switch/checkbox.
- `await newTransactionBtn.hover()`: Pasa el cursor sobre el botón "New" en la barra superior activando los estilos de hover de Material-UI.
- `await searchInput.pressSequentially('Dina', { delay: 120 })`: Digita carácter por carácter activando los eventos `keydown`, `keyup` y `input` necesarios para disparar la función `debounce(200, ...)` del buscador de contactos.
- `await contactItem.click()`: Selecciona el usuario destinatario tras el filtrado reactivo.
- `await amountInput.fill('25')`: Llenado directo del monto con formato dinámico `$25.00`.
- `await noteInput.fill('...')`: Registro de la nota de la transacción.
- `await payButton.click()`: Envío del pago mediante el botón `Pay`.
- `await returnBtn.focus()` + `await page.keyboard.press('Enter')`: Enfoca el botón y dispara el evento de teclado 'Enter' para navegar de regreso al listado de transacciones.
- **Nota sobre `selectOption()` y `setInputFiles()`:** Tras una auditoría completa del código fuente de la Cypress Real World App (`src/`), **no existen elementos `<select>` HTML nativos ni campos `<input type="file">`** (la app utiliza listas/tabs personalizadas de MUI para selecciones y avatares pregenerados de DiceBear mediante URLs SVG fijas).

---

### PUNTO 3 - `assertions.spec.ts`

#### Código Completo
```typescript
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
```

#### Lista de Aserciones y qué valida cada una en Punto 3
- `expect(loginApiResp).toBeOK()`: Valida que la respuesta HTTP del endpoint de autenticación del backend (`POST http://localhost:3001/login`) retorne código exitoso (200 OK).
- `await expect(page).toHaveTitle(/Cypress Real World App/i)`: Aserción de página (c) que comprueba el título del documento HTML cargado.
- `await expect(page.getByTestId('signin-error')).not.toBeVisible()`: Aserción negativa con `.not` (d) que verifica la ausencia de alerta de error antes de enviar credenciales.
- `await expect(usernameInput).toHaveValue('Heath93')`: Aserción de valor (b) que comprueba que el valor actual del campo refleje lo digitado.
- `await expect(submitBtn).toBeEnabled()`: Aserción de estado (a) que valida que el botón de inicio de sesión esté habilitado tras la validación de Formik.
- `await expect(page).toHaveURL(...)`: Aserción de página (c) que confirma la redirección al dashboard principal tras login exitoso.
- `await expect(userFullName).toHaveText('Ted P')`: Aserción de texto (b) que corrobora la renderización del nombre real del usuario autenticado en la barra lateral.
- `await expect.soft(page.getByTestId('nav-top-notifications-link')).toBeVisible()`: Aserción suave que verifica la presencia del enlace de notificaciones sin abortar el test si existiese un fallo secundario.
- `expect(contactCount > 0).toBe(true)`: Aserción genérica con `.toBe` (d) que valida un resultado booleano directo sobre la cantidad de resultados de búsqueda.

---

### PUNTO 4 - `decision-table.spec.ts`

#### Reglas de Validación Exactas Encontradas en el Código Fuente
En el archivo `src/components/BankAccountForm.tsx` (líneas 9 a 18), se encuentra el esquema de validación Yup:
```typescript
const validationSchema = object({
  bankName: string().min(5, "Must contain at least 5 characters").required("Enter a bank name"),
  routingNumber: string()
    .length(9, "Must contain a valid routing number")
    .required("Enter a valid bank routing number"),
  accountNumber: string()
    .min(9, "Must contain at least 9 digits")
    .max(12, "Must contain no more than 12 digits")
    .required("Enter a valid bank account number"),
});
```
1. **Bank Name (`bankName`):**
   - Mínimo **5 caracteres**. Mensaje de error: `"Must contain at least 5 characters"`.
   - Campo obligatorio. Mensaje: `"Enter a bank name"`.
2. **Routing Number (`routingNumber`):**
   - Exactamente **9 dígitos/caracteres** (`.length(9)`). Mensaje de error: `"Must contain a valid routing number"`.
   - Campo obligatorio. Mensaje: `"Enter a valid bank routing number"`.
3. **Account Number (`accountNumber`):**
   - Mínimo **9 dígitos**. Mensaje de error: `"Must contain at least 9 digits"`.
   - Máximo **12 dígitos**. Mensaje de error: `"Must contain no more than 12 digits"`.
   - Campo obligatorio. Mensaje: `"Enter a valid bank account number"`.
4. **Comportamiento del botón Guardar:**
   - `<Button data-test="bankaccount-submit" disabled={!isValid || isSubmitting}>Save</Button>`.
   - Si alguno de los campos viola el esquema, `isValid` es `false`, el botón `Save` tiene el atributo HTML `disabled` (`toBeDisabled()`) y se renderiza el texto de error en el elemento helper text de MUI (`#bankaccount-<campo>-input-helper-text`).

#### Tabla de Decisión Implementada

| Regla | Bank Name | Routing Number | Account Number | Resultado Esperado | Mensaje de Error / Comprobación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R1** | Válido (>= 5 car.) | Válido (9 dígitos) | Válido (9-12 dígitos) | Botón Save habilitado; cuenta creada | Redirección a `/bankaccounts` y nombre visible |
| **R2** | Inválido (< 5 car., ej: `"Banc"`) | Válido (`"123456789"`) | Válido (`"987654321"`) | Botón Save deshabilitado | `"Must contain at least 5 characters"` |
| **R3** | Válido (`"Banco Santander"`) | Inválido (8 dígitos, ej: `"12345678"`) | Válido (`"987654321"`) | Botón Save deshabilitado | `"Must contain a valid routing number"` |
| **R4** | Válido (`"Banco BBVA Colombia"`) | Válido (`"123456789"`) | Inválido (7 dígitos, ej: `"1234567"`) | Botón Save deshabilitado | `"Must contain at least 9 digits"` |

#### Código Completo
```typescript
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
```

---

### PUNTO 5 - `state-transition.spec.ts`

#### Estados Reales, Eventos y Visualización en la UI
En el modelo (`src/models/transaction.ts`), el estado de la solicitud se modela a través de:
```typescript
export enum TransactionRequestStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
}
```

1. **Estado Inicial `pending`:**
   - **Evento detonante:** Usuario A envía el formulario con tipo `request` (`POST /transactions`).
   - **Modelo de datos:** `requestStatus: "pending"`, `status: "pending"`.
   - **Lo que muestra la UI para el receptor (Usuario B en `/transaction/:id`):**
     - En el título: `<span data-test="transaction-action-...">${sender} requested ${receiver}</span>`.
     - En el monto: Texto verde con prefijo `+` (ej: `+$50.00`).
     - Botones de acción disponibles: **Accept Request** (`data-test="transaction-accept-request-${id}"`) y **Reject Request** (`data-test="transaction-reject-request-${id}"`).

2. **Transición a `accepted` (Caso A - Secuencia Válida):**
   - **Evento detonante:** El usuario receptor (B) hace clic en `Accept Request` (`PATCH /transactions/:id` con `{ requestStatus: "accepted" }`).
   - **Efecto en Backend:** Débito en el receptor, crédito en el solicitante y `requestStatus` pasa a `accepted`.
   - **Lo que muestra la UI tras la transición:**
     - El título cambia inmediatamente su verbo a `" charged "` (`${sender} charged ${receiver}`).
     - Ambos botones (`Accept Request` y `Reject Request`) desaparecen del DOM (`not.toBeVisible()`).

3. **Transición a `rejected` (Caso B - Transición Inválida / Terminal):**
   - **Evento detonante:** El usuario receptor (B) hace clic en `Reject Request` (`PATCH /transactions/:id` con `{ requestStatus: "rejected" }`).
   - **Efecto en Backend:** Estado pasa a `rejected`.
   - **Lo que muestra la UI:**
     - El título conserva el verbo `" requested "` (no avanza a charged).
     - Los botones de decisión desaparecen de inmediato y no vuelven a aparecer ni tras recargar (`page.reload()`).
     - Al consultar el endpoint REST (`GET /transactions/:id`), se confirma que `requestStatus` persistió en `'rejected'`. No existe ninguna vía en la UI para reintentar la aceptación.

#### Código Completo
```typescript
import { test, expect } from '@playwright/test';

test.describe('Punto 5 - Transicion de Estados en Solicitudes de Pago (Request)', () => {
  test('Caso A (Secuencia valida): Creacion de request (pending) -> Aceptacion por receptor (accepted)', async ({ browser }) => {
    // Contexto Usuario A (Heath93 - Solicitante)
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    await pageA.goto('/signin');
    await pageA.getByLabel('Username').fill('Heath93');
    await pageA.locator('input#password').fill('s3cret');
    await pageA.getByRole('button', { name: 'Sign In' }).click();
    await pageA.waitForURL('**/');

    // Usuario A crea solicitud hacia Usuario B (Dina20)
    await pageA.goto('/transaction/new');
    await pageA.getByTestId('user-list-search-input').pressSequentially('Dina', { delay: 100 });
    const contactItemA = pageA.locator('[data-test^=user-list-item-]').filter({ hasText: 'Dina20' });
    await expect(contactItemA).toBeVisible();
    await contactItemA.click();

    await pageA.getByPlaceholder('Amount').fill('50');
    await pageA.getByPlaceholder('Add a note').fill('Solicitud Caso A - Estado Pending');

    const createTxPromise = pageA.waitForResponse(
      (res) => res.url().includes('/transactions') && res.request().method() === 'POST'
    );
    await pageA.getByTestId('transaction-create-submit-request').click();

    const txRes = await createTxPromise;
    const { transaction } = await txRes.json();
    const txId = transaction.id;

    // Aserción en Usuario A: Confirmación visible de que la solicitud fue creada
    await expect(pageA.getByText(/Requested.*for Solicitud Caso A/i)).toBeVisible();
    await contextA.close();

    // Contexto Usuario B (Dina20 - Receptor de la solicitud)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    await pageB.goto('/signin');
    await pageB.getByLabel('Username').fill('Dina20');
    await pageB.locator('input#password').fill('s3cret');
    await pageB.getByRole('button', { name: 'Sign In' }).click();
    await pageB.waitForURL('**/');

    // Navegar directamente al detalle de la transacción
    await pageB.goto('/transaction/' + txId);
    await expect(pageB.getByTestId('transaction-detail-header')).toBeVisible();

    // 1. Estado Visible: PENDING
    // La acción muestra  requested 
    const actionLabel = pageB.getByTestId('transaction-action-' + txId);
    await expect(actionLabel).toHaveText(' requested ');

    // El monto muestra valor positivo con signo +
    const amountLabel = pageB.getByTestId('transaction-amount-' + txId);
    await expect(amountLabel).toHaveText('+$50.00');

    // En estado pending, los botones de decisión están visibles y disponibles para el receptor
    const acceptBtn = pageB.getByTestId('transaction-accept-request-' + txId);
    const rejectBtn = pageB.getByTestId('transaction-reject-request-' + txId);
    await expect(acceptBtn).toBeVisible();
    await expect(acceptBtn).toBeEnabled();
    await expect(rejectBtn).toBeVisible();

    // Captura 1: Estado inicial pendiente con botones de acción
    await pageB.screenshot({ path: 'tests/taller3/evidencias/p5-state-request-pending-and-accepted.png' });

    // 2. Transición a ACCEPTED: Usuario B acepta la solicitud
    const patchPromise = pageB.waitForResponse(
      (res) => res.url().includes('/transactions/' + txId) && res.request().method() === 'PATCH'
    );
    await acceptBtn.click();
    const patchRes = await patchPromise;
    expect(patchRes.status()).toBe(204);

    // 3. Estado Visible: ACCEPTED
    // El texto de la acción cambia a  charged 
    await expect(actionLabel).toHaveText(' charged ');

    // Los botones de aceptar/rechazar desaparecen de la interfaz
    await expect(acceptBtn).not.toBeVisible();
    await expect(rejectBtn).not.toBeVisible();

    await contextB.close();
  });

  test('Caso B (Transicion invalida): Receptor rechaza request (rejected) -> No es posible volver a aceptarlo', async ({ browser }) => {
    // Contexto Usuario A (Heath93 - Solicitante)
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    await pageA.goto('/signin');
    await pageA.getByLabel('Username').fill('Heath93');
    await pageA.locator('input#password').fill('s3cret');
    await pageA.getByRole('button', { name: 'Sign In' }).click();
    await pageA.waitForURL('**/');

    // Crear solicitud
    await pageA.goto('/transaction/new');
    await pageA.getByTestId('user-list-search-input').pressSequentially('Dina', { delay: 100 });
    const contactItemB = pageA.locator('[data-test^=user-list-item-]').filter({ hasText: 'Dina20' });
    await expect(contactItemB).toBeVisible();
    await contactItemB.click();

    await pageA.getByPlaceholder('Amount').fill('30');
    await pageA.getByPlaceholder('Add a note').fill('Solicitud Caso B - Rechazo Terminal');

    const createTxPromise = pageA.waitForResponse(
      (res) => res.url().includes('/transactions') && res.request().method() === 'POST'
    );
    await pageA.getByTestId('transaction-create-submit-request').click();

    const txRes = await createTxPromise;
    const { transaction } = await txRes.json();
    const txId = transaction.id;
    await contextA.close();

    // Contexto Usuario B (Dina20 - Receptor)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    await pageB.goto('/signin');
    await pageB.getByLabel('Username').fill('Dina20');
    await pageB.locator('input#password').fill('s3cret');
    await pageB.getByRole('button', { name: 'Sign In' }).click();
    await pageB.waitForURL('**/');

    // Abrir detalle de la transacción
    await pageB.goto('/transaction/' + txId);
    const rejectBtn = pageB.getByTestId('transaction-reject-request-' + txId);
    const acceptBtn = pageB.getByTestId('transaction-accept-request-' + txId);
    await expect(rejectBtn).toBeVisible();

    // Evento: Usuario B rechaza la solicitud
    const rejectPromise = pageB.waitForResponse(
      (res) => res.url().includes('/transactions/' + txId) && res.request().method() === 'PATCH'
    );
    await rejectBtn.click();
    const rejectRes = await rejectPromise;
    expect(rejectRes.status()).toBe(204);

    // Verificación inmediata: El botón Accept ya no existe en la vista
    await expect(acceptBtn).not.toBeVisible();
    await expect(rejectBtn).not.toBeVisible();

    // Intento de reintento / transición inválida: Recargar la página para verificar persistencia del estado
    await pageB.reload();
    await expect(pageB.getByTestId('transaction-detail-header')).toBeVisible();

    // En estado terminal rejected, el botón Accept sigue sin estar disponible
    await expect(pageB.getByTestId('transaction-accept-request-' + txId)).not.toBeVisible();
    await expect(pageB.getByTestId('transaction-reject-request-' + txId)).not.toBeVisible();

    // El título se mantiene en  requested  y no puede avanzar a  charged 
    const actionLabel = pageB.getByTestId('transaction-action-' + txId);
    await expect(actionLabel).toHaveText(' requested ');

    // Verificación de estado persistido en backend: requestStatus es rejected
    const checkTxResp = await pageB.request.get('http://localhost:3001/transactions/' + txId);
    const { transaction: currentTx } = await checkTxResp.json();
    expect(currentTx.requestStatus).toBe('rejected');

    // Captura 2: Estado rejected terminal sin opciones de aceptación
    await pageB.screenshot({ path: 'tests/taller3/evidencias/p5-state-request-rejected-terminal.png' });

    await contextB.close();
  });
});
```

---

## 5. Salida de la Terminal de la Última Ejecución

Comando ejecutado: `npx playwright test tests/taller3`

```text
Running 33 tests using 6 workers

  ok  5 [chromium] › tests\taller3\locators.spec.ts:63:7 › Punto 1 - Estrategias de Localizadores y Strictness › Demostración de Strictness y resolución con filter() y rol específico (1.6s)
  ok  4 [chromium] › tests\taller3\locators.spec.ts:4:7 › Punto 1 - Estrategias de Localizadores y Strictness › Localización de 4 elementos distintos con estrategias variadas (1.8s)
  ok  6 [chromium] › tests\taller3\locators.spec.ts:26:7 › Punto 1 - Estrategias de Localizadores y Strictness › Matriz de localizadores: getByRole, getByLabel, getByPlaceholder, getByText, getByTestId, locator(CSS) (2.7s)
  ok  2 [chromium] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R1] R1: Los tres campos validos -> Save habilitado y la cuenta se crea en la lista (3.0s)
  ok  3 [chromium] › tests\taller3\actions.spec.ts:4:7 › Punto 2 - Acciones de Usuario en Playwright › Flujo de usuario completo: fill, check, click, hover, pressSequentially y press Enter (3.9s)
  ok  1 [chromium] › tests\taller3\assertions.spec.ts:4:7 › Punto 3 - Aserciones en Playwright › Flujo con aserciones de estado, texto/valor, página, negativa (.not), genérica (.toBe), soft y toBeOK() (4.0s)
  ok  9 [chromium] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R2] R2: bank name invalido (< 5 caracteres) -> Save deshabilitado + error (2.3s)
  ok 13 [chromium] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R3] R3: routing number invalido (8 digitos != 9) -> Save deshabilitado + error (2.8s)
  ok  7 [chromium] › tests\taller3\state-transition.spec.ts:4:7 › Punto 5 - Transicion de Estados en Solicitudes de Pago (Request) › Caso A (Secuencia valida): Creacion de request (pending) -> Aceptacion por receptor (accepted) (6.4s)
  ok  8 [chromium] › tests\taller3\state-transition.spec.ts:90:7 › Punto 5 - Transicion de Estados en Solicitudes de Pago (Request) › Caso B (Transicion invalida): Receptor rechaza request (rejected) -> No es posible volver a aceptarlo (6.9s)
  ok 14 [chromium] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R4] R4: account number invalido (7 digitos < 9) -> Save deshabilitado + error (3.1s)
  ok 10 [firefox] › tests\taller3\actions.spec.ts:4:7 › Punto 2 - Acciones de Usuario en Playwright › Flujo de usuario completo: fill, check, click, hover, pressSequentially y press Enter (10.5s)
  ok 11 [firefox] › tests\taller3\assertions.spec.ts:4:7 › Punto 3 - Aserciones en Playwright › Flujo con aserciones de estado, texto/valor, página, negativa (.not), genérica (.toBe), soft y toBeOK() (11.0s)
  ok 15 [firefox] › tests\taller3\locators.spec.ts:4:7 › Punto 1 - Estrategias de Localizadores y Strictness › Localización de 4 elementos distintos con estrategias variadas (10.6s)
  ok 17 [firefox] › tests\taller3\locators.spec.ts:63:7 › Punto 1 - Estrategias de Localizadores y Strictness › Demostración de Strictness y resolución con filter() y rol específico (8.6s)
  ok 12 [firefox] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R1] R1: Los tres campos validos -> Save habilitado y la cuenta se crea en la lista (17.8s)
  ok 16 [firefox] › tests\taller3\locators.spec.ts:26:7 › Punto 1 - Estrategias de Localizadores y Strictness › Matriz de localizadores: getByRole, getByLabel, getByPlaceholder, getByText, getByTestId, locator(CSS) (16.7s)
  ok 22 [webkit] › tests\taller3\assertions.spec.ts:4:7 › Punto 3 - Aserciones en Playwright › Flujo con aserciones de estado, texto/valor, página, negativa (.not), genérica (.toBe), soft y toBeOK() (5.1s)
  ok 21 [webkit] › tests\taller3\actions.spec.ts:4:7 › Punto 2 - Acciones de Usuario en Playwright › Flujo de usuario completo: fill, check, click, hover, pressSequentially y press Enter (6.8s)
  ok 23 [webkit] › tests\taller3\locators.spec.ts:4:7 › Punto 1 - Estrategias de Localizadores y Strictness › Localización de 4 elementos distintos con estrategias variadas (2.0s)
  ok 25 [webkit] › tests\taller3\locators.spec.ts:26:7 › Punto 1 - Estrategias de Localizadores y Strictness › Matriz de localizadores: getByRole, getByLabel, getByPlaceholder, getByText, getByTestId, locator(CSS) (4.1s)
  ok 26 [webkit] › tests\taller3\locators.spec.ts:63:7 › Punto 1 - Estrategias de Localizadores y Strictness › Demostración de Strictness y resolución con filter() y rol específico (3.8s)
  ok 20 [firefox] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R2] R2: bank name invalido (< 5 caracteres) -> Save deshabilitado + error (12.0s)
  ok 24 [webkit] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R1] R1: Los tres campos validos -> Save habilitado y la cuenta se crea en la lista (5.5s)
  ok 30 [webkit] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R2] R2: bank name invalido (< 5 caracteres) -> Save deshabilitado + error (5.3s)
  ok 18 [firefox] › tests\taller3\state-transition.spec.ts:4:7 › Punto 5 - Transicion de Estados en Solicitudes de Pago (Request) › Caso A (Secuencia valida): Creacion de request (pending) -> Aceptacion por receptor (accepted) (27.4s)
  ok 19 [firefox] › tests\taller3\state-transition.spec.ts:90:7 › Punto 5 - Transicion de Estados en Solicitudes de Pago (Request) › Caso B (Transicion invalida): Receptor rechaza request (rejected) -> No es posible volver a aceptarlo (27.0s)
  ok 29 [firefox] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R3] R3: routing number invalido (8 digitos != 9) -> Save deshabilitado + error (9.9s)
  ok 27 [webkit] › tests\taller3\state-transition.spec.ts:4:7 › Punto 5 - Transicion de Estados en Solicitudes de Pago (Request) › Caso A (Secuencia valida): Creacion de request (pending) -> Aceptacion por receptor (accepted) (11.4s)
  ok 31 [webkit] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R3] R3: routing number invalido (8 digitos != 9) -> Save deshabilitado + error (5.4s)
  ok 28 [webkit] › tests\taller3\state-transition.spec.ts:90:7 › Punto 5 - Transicion de Estados en Solicitudes de Pago (Request) › Caso B (Transicion invalida): Receptor rechaza request (rejected) -> No es posible volver a aceptarlo (12.4s)
  ok 33 [webkit] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R4] R4: account number invalido (7 digitos < 9) -> Save deshabilitado + error (2.3s)
  ok 32 [firefox] › tests\taller3\decision-table.spec.ts:52:9 › Punto 4 - Tabla de Decision: Creacion de Cuenta Bancaria › [R4] R4: account number invalido (7 digitos < 9) -> Save deshabilitado + error (7.8s)

  33 passed (54.9s)
```

---

## 6. Lista de Capturas Generadas

Directorio: `tests/taller3/evidencias/`

| Archivo | Punto | Momento de la Captura / Qué Demuestra |
| :--- | :--- | :--- |
| `p1-locators-login.png` | Punto 1 | Elementos de inicio de sesión localizados exitosamente en la UI. |
| `p1-locators-strictness.png` | Punto 1 | Resolución de strictness con selectores específicos y filtros aplicados. |
| `p2-actions-login-filled.png` | Punto 2 | Formulario de login completado con acciones `fill()` y casilla `check()`. |
| `p2-actions-transaction-step2.png` | Punto 2 | Formulario de pago completado tras `pressSequentially()` en búsqueda y `hover()` en navegación. |
| `p3-assertions-login-verified.png` | Punto 3 | Formulario de login con validación de estado habilitado, valor y ausencia de errores. |
| `p3-assertions-transaction-created.png` | Punto 3 | Pantalla de confirmación de transacción tras verificación con `toBeOK()` en backend. |
| `p4-bankaccount-success-created.png` | Punto 4 | Cuenta bancaria válida creada exitosamente y visible en la lista (Regla R1). |
| `p4-bankaccount-validation-errors.png` | Punto 4 | Mensajes de error en helperText de MUI y botón `Save` deshabilitado (Regla R2). |
| `p5-state-request-pending-and-accepted.png` | Punto 5 | Solicitud en estado `pending` mostrando botones `Accept Request` y `Reject Request`. |
| `p5-state-request-rejected-terminal.png` | Punto 5 | Solicitud en estado terminal `rejected` con botones de acción eliminados de la UI. |
| `html-report.png` | Reporte HTML | Vista general del reporte HTML de Playwright con los 33 tests pasados (0 fallos, 0 flaky). |
