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