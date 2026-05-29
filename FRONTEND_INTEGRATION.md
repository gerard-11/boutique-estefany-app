# Hoja de Ruta: Integración React Native (Boutique Estefany)

Este documento define cómo la App Mobile debe interactuar con el Backend para mantener la integridad de las reglas de negocio.

## 1. Conexión y Seguridad
*   **Protocolo:** REST API.
*   **Autenticación:** Firebase Auth. 
    *   La App obtiene el `IdToken` de Firebase.
    *   Se envía en cada petición en el Header: `Authorization: Bearer <TOKEN>`.
*   **Roles:** El Frontend debe condicionar las vistas. El Backend rechazará cualquier acción no permitida aunque el botón sea visible.

## 2. Reglas de Oro del Frontend (Business Logic)

### A. El Semáforo de Clientes (Cálculo en Vuelo)
No pidas un "color" al servidor. El servidor te da el perfil enriquecido (`GET /users/profile/:id`) y tú aplicas la lógica:
*   **VERDE:** Último abono hace <= 7 días.
*   **AMARILLO:** Último abono hace > 7 días.
*   **ROJO:** Último abono hace > 30 días.

### B. Cálculo de Cuotas Semanales
El sistema sugiere, pero el Admin puede sobreescribir.
*   Lógica base: `$200` base hasta `$1000`. +`$50` por cada bloque de `$500` adicionales.

### C. Alertas de Reserva Suave (Soft Reservation)
Al escanear un producto para venta física (`GET /products/barcode/:code`):
*   Si el JSON contiene `softReservationAlert`, el Frontend **DEBE** mostrar un modal de advertencia antes de proceder con la venta.

## 3. Roadmap de Implementación (Fases)

### Fase 1: Cimientos (Auth & Catálogo)
*   Login con Firebase.
*   Explorador de productos (público para GUEST, con costos ocultos para CLIENT).
*   Escaneo de código de barras (Cámara).

### Fase 2: El Panel del Admin (Dashboard & Inventario)
*   Consumo del `DashboardReportModule`.
*   Módulo de Ajuste Manual (Mermas y Entradas).
*   Gestión de Niveles de Cliente.

### Fase 3: Transacciones y Cobranza
*   Creación de Ventas (Contado/Crédito).
*   Motor de Devoluciones (Algoritmo de Reparto).
*   Registro de Pagos Semanales.

### Fase 4: Fidelización (Wishlist & Delivery)
*   Solicitud de Pedidos a Domicilio.
*   Rastreo de Wishlist para el cliente.

## 4. Dinámica de Trabajo (Mentoría Socrática y Rigor de Desarrollo)

Para garantizar un aprendizaje real, evitar el "copiar y pegar" de código y mantener un estándar profesional de desarrollo, cada pantalla, módulo o funcionalidad de este Roadmap se desarrollará bajo un flujo estrictamente secuencial y regulado.

### Reglas de Interacción para el Agente (IA):
1. **Paso a Paso Estricto:** Está prohibido avanzar a la siguiente fase o pantalla si el usuario no ha superado la validación de la fase actual.
2. **Sin Código Inicial:** Al iniciar un tema, no generes código completo. Enfócate en el "por qué" y el "cómo".
3. **Gestión de Dependencias (pnpm):** Toda instalación o comando de paquetes sugerido por la IA debe utilizar estrictamente `pnpm` (ej. `pnpm add`, `pnpm dlx`). Queda prohibido el uso de `npm` o `yarn`.
4. **Validación Mediante Preguntas:** Antes de dar por buena una explicación o pasar a la implementación, debes hacer entre 1 y 2 preguntas clave (conceptuales, de lógica de negocio o de manejo de estado) para comprobar que el usuario entendió.
5. **Cierre con Conventional Commits:** Al finalizar con éxito cada sección, pantalla o sub-fase, la IA **debe proponer el nombre exacto de un Conventional Commit** (ej. `feat(auth): ...`, `fix(ui): ...`) que describa el trabajo terminado.
6. **Restricción del Entorno:** La IA recordará al usuario que **nunca debe realizar commits ni operaciones de Git desde el área de trabajo del CLI o la terminal integrada del agente**, sino desde su propio entorno local.

### Flujo de Trabajo por Componente/Pantalla:

* **Paso 1: Alineación de Reglas de Negocio e Infraestructura**
    * *Qué hacemos:* Analizamos qué endpoints se usarán, qué datos se necesitan y qué reglas del negocio aplican (ej. El Semáforo de Clientes, Soft Reservation).
    * *Meta de Validation:* El usuario debe explicar con sus palabras el flujo de datos y qué dependencias con `pnpm` se requerirán.
* **Paso 2: Arquitectura de Estado y Offline-First**
    * *Qué hacemos:* Diseñamos los estados mutables de la pantalla (Loading, Error, Success), la estrategia de caché y cómo reaccionará la app si no hay internet.
    * *Meta de Validación:* Responder las preguntas del mentor sobre el manejo del ciclo de vida de React Native.
* **Paso 3: Estrategia de UI y Componentes**
    * *Qué hacemos:* Definimos la estructura visual y los componentes nativos necesarios.
* **Paso 4: Implementación Guiada y Code Review**
    * *Qué hacemos:* El usuario propone el código por bloques. La IA audita que se cumpla la lógica del negocio, la seguridad (Tokens) y las buenas prácticas.
* **Paso 5: Commit de Cierre y Siguiente Paso**
    * *Qué hacemos:* La IA valida el código final, genera la estructura del *Conventional Commit* correspondiente y recuerda la restricción de Git antes de abrir el siguiente bloque del Roadmap.


---

**¡Ojo con React Native!** Al ser mobile, piensa siempre en "Offline First". Si el Admin pierde internet en la tienda, debe poder seguir escaneando.
