# Roadmap

Fecha de corte: 2026-06-16

Este documento queda como punto de partida para continuar manana. Cada feature debe actualizarse cuando se implemente un cambio: agregar que se modifico, que falta validar y cuales son los siguientes pasos.

## Formato por feature

Cada feature debe mantener esta estructura:

- Cambio realizado: resumen concreto de lo que ya se modifico.
- Archivos tocados: rutas principales relacionadas.
- Estado actual: listo, parcial, bloqueado o pendiente de validar.
- Siguientes pasos: acciones concretas para continuar.
- Notas de validacion: pruebas manuales, casos borde o contrato con backend.

## 1. Inventario unitario y estados inteligentes

Cambio realizado:

- Se cambio la vista de inventario de stock por cantidad a pieza unitaria con estado.
- Se agregaron estados visuales: `AVAILABLE`, `APARTADO`, `PRESTAMO`, `CREDITO_SEMANAL`, `SOLD`.
- El inventario ahora ordena productos por prioridad de estado.
- Se muestra cliente asignado cuando viene `inventoryStatus.assignedTo.name`.
- Se quitaron logs temporales y debug con `some()` en inventario.

Archivos tocados:

- `src/screens/InventoryScreen.js`
- `src/screens/InventoryScreen.styles.js`

Estado actual:

- Parcial.
- La base visual ya existe; falta validar contrato real del backend.

Siguientes pasos:

- Validar si todos los productos reciben `inventoryStatus.status`.
- Validar si `SOLD` debe depender de `stock <= 0` o venir siempre desde backend.
- Agregar filtros por estado si la lista empieza a crecer.

Notas de validacion:

- Probar inventario con productos disponibles, apartados, prestados, vendidos y en credito semanal.
- Confirmar que el color y etiqueta coinciden con el estado real del producto.

## 2. Registro de producto con modelo unitario

Cambio realizado:

- Se elimino el campo visible de stock inicial del formulario.
- Al guardar un producto nuevo se envia `stock: 1`.

Archivos tocados:

- `src/hooks/useScannerHandlers.js`
- `src/screens/ScannerScreen/components/NewProductForm.js`
- `src/screens/ScannerScreen/index.js`
- `src/services/productService.js`

Estado actual:

- Parcial.
- El flujo ya guarda una pieza unitaria, pero el schema todavia conserva `stock`.

Siguientes pasos:

- Decidir si `stock` seguira siendo requerido por backend o si debe eliminarse del schema frontend.
- Si el backend requiere `stock`, mantenerlo como valor interno fijo.
- Si el backend ya migro a estados, quitar dependencias de ajuste de stock.
- Validar errores de backend cuando se crea producto sin categoria o departamento.

Notas de validacion:

- Crear producto nuevo desde scanner.
- Confirmar que aparece en inventario como `Disponible`.
- Confirmar que no se puede crear producto con precio/costo invalido.

## 3. Scanner y acciones por estado

Cambio realizado:

- Se removio el modal de ajuste de stock desde el scanner.
- El menu circular ahora muestra acciones segun estado:
  - Disponible: venta, prestar, apartar, credito semanal.
  - Apartado: vender, liberar.
  - Prestado: devolver.
- Las acciones que requieren cliente abren selector de cliente.
- `ProductFound` muestra la etiqueta real de estado.
- Producto disponible permite iniciar `CREDITO_SEMANAL`; productos vendidos o ya en credito muestran estado sin acciones invalidas.

Archivos tocados:

- `src/screens/ScannerScreen/index.js`
- `src/screens/ScannerScreen/components/ProductFound.js`
- `src/screens/ScannerScreen/components/CircularActionMenu.js`
- `src/hooks/useScannerHandlers.js`
- `src/hooks/useScannerStore.js`

Estado actual:

- Parcial.
- El flujo principal existe; falta validar comportamiento final de credito semanal con backend.

Siguientes pasos:

- Confirmar con backend que `CREDITO_SEMANAL` es un tipo aceptado para crear transacciones.
- Definir si credito semanal debe tener devolucion, abono o cierre desde scanner.

Notas de validacion:

- Escanear producto disponible y ejecutar venta.
- Escanear producto disponible y apartarlo.
- Escanear producto apartado y liberarlo.
- Escanear producto prestado y devolverlo.
- Escanear producto vendido y confirmar que no permite acciones invalidas.

## 4. Transacciones y selector de cliente

Cambio realizado:

- Las acciones del scanner crean transacciones con `{ userId, type, productBarcodes }`.
- El selector de cliente se alimenta desde busqueda de usuarios.
- Se agrego `onError` a creacion de transacciones y bloqueo contra doble toque mientras esta pendiente.

Archivos tocados:

- `src/services/transactionService.js`
- `src/hooks/useProductScanner.js`
- `src/hooks/useScannerHandlers.js`
- `src/screens/ScannerScreen/components/ScannerPickers.js`

Estado actual:

- Parcial.
- El selector ya bloquea doble toque durante la creacion y muestra errores de backend; falta validacion manual contra backend real.

Siguientes pasos:

- Confirmar tipos aceptados por backend: `SALE`, `PRESTAMO`, `APARTADO`, `CREDITO_SEMANAL`.
- Confirmar si una venta desde apartado conserva cliente original o requiere seleccionar cliente.
- Confirmar si prestamo/apartado deben tener fecha limite.

Notas de validacion:

- Probar busqueda de cliente con menos y mas de 3 caracteres.
- Probar transaccion fallida y confirmar mensaje claro al usuario.
- Confirmar que inventario y dashboard se invalidan despues de cada transaccion.

## 5. Limpieza tecnica pendiente

Cambio realizado:

- Se detectaron restos del modelo anterior de stock.
- Se eliminaron referencias activas a `showStockModal`, `openStockModal`, `handleStockAdjustment`, `useAdjustStock` y `adjustStock`.
- Existe `pnpm-workspace.yaml` sin commit con politica `allowBuilds`.

Archivos relacionados:

- `src/hooks/useProductScanner.js`
- `src/services/productService.js`
- `src/hooks/useScannerStore.js`
- `src/screens/ScannerScreen/components/StockAdjustmentModal.js`
- `pnpm-workspace.yaml`

Estado actual:

- Parcial.

Siguientes pasos:

- Decidir si `StockAdjustmentModal.js` se elimina o queda reservado para admin.
- Revisar si `pnpm-workspace.yaml` debe commitearse.
- Ejecutar la app y revisar warnings de imports no usados.

Notas de validacion:

- `pnpm exec expo config --type public` ejecutado correctamente con SDK `54.0.0`.
- `pnpm exec expo export --platform android --output-dir /tmp/boutique-estefany-export` genero bundle correctamente.
- Correr `pnpm start` o `npx expo start` y revisar flujo manual en dispositivo/emulador.
- Probar flujo completo en Android antes de generar APK.

## 6. APK con EAS

Cambio realizado:

- El proyecto ya tiene perfil `preview` configurado para APK.

Archivos relacionados:

- `eas.json`
- `app.json`

Estado actual:

- Listo para build cuando el flujo principal este validado.

Siguientes pasos:

- Ejecutar `npx eas-cli login` si no hay sesion.
- Generar APK con `npx eas-cli build -p android --profile preview`.
- Descargar APK desde el link de EAS.

Notas de validacion:

- Antes del APK, probar scanner, inventario, login y transacciones en desarrollo.
- Para Google Play usar perfil `production`, que genera `app-bundle`.
## 7. Login admin y backend local

Cambio realizado:

- Se probo `admin@test.com` con contrasena `12345678` contra Firebase y autentica correctamente.
- Se detecto que `EXPO_PUBLIC_API_URL` apuntaba a `http://192.168.1.75:3000`, pero la IP local actual es `http://192.168.1.79:3000`.
- `api.js` ahora usa `EXPO_PUBLIC_API_URL` en vez de una IP hardcodeada.
- El login admin ya no deja el boton cargando indefinidamente si `/auth/me` falla.
- Se muestra un mensaje cuando Firebase autentica pero el backend no valida el perfil admin.

Archivos tocados:

- `src/context/AuthContext.js`
- `src/screens/LoginScreen.js`
- `src/screens/LoginScreen.styles.js`
- `src/services/api.js`
- `.env`

Estado actual:

- Parcial.
- La validacion directa de Firebase + `/auth/me` responde `role: ADMIN` con la IP actual.

Siguientes pasos:

- Probar login manual desde Expo Go/dev build en el telefono conectado a la misma red.
- Si cambia la IP de la computadora, actualizar `EXPO_PUBLIC_API_URL` o fijar una IP local/reserva DHCP.

Notas de validacion:

- Firebase password login: OK para `admin@test.com`.
- `GET /auth/me` con token Firebase: OK, `role: ADMIN`.

