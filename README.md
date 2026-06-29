# Boutique Estefany App

Aplicacion movil administrativa para una boutique, construida con React Native y Expo. El proyecto esta pensado como una extension de experiencia frontend: demuestra manejo de autenticacion, consumo de APIs protegidas, estado de UI, formularios, navegacion, reglas de negocio y sincronizacion de datos en una app real.

> Mi enfoque principal es frontend web con React. Este proyecto muestra que tambien puedo llevar esos fundamentos a mobile: arquitectura por capas, componentes reutilizables, manejo de estado, validacion de formularios y comunicacion con backend.

## Problema Que Resuelve

Boutique Estefany necesita administrar inventario por prenda, clientes, pagos y ventas desde un dispositivo movil. La app permite que una administradora escanee productos, consulte su estado, registre transacciones y revise metricas del negocio sin depender de una computadora.

## Funcionalidades

- Login con Firebase Auth y validacion de perfil contra backend.
- Navegacion protegida por rol de usuario.
- Dashboard administrativo con metricas del negocio.
- Scanner de codigos de barras para buscar o registrar productos.
- Registro de productos con validacion de campos.
- Inventario con estados visuales: disponible, apartado, prestado, credito semanal y vendido.
- Busqueda y filtrado de clientes.
- Perfil de cliente con historial financiero.
- Registro de pagos e invalidacion de datos relacionados.
- Alertas antes de vender productos con posible apartado activo.

## Stack Tecnico

- React Native
- Expo SDK 54
- React Navigation
- TanStack React Query
- Zustand
- Firebase Auth
- Axios
- React Hook Form
- Zod
- Expo Camera
- Expo Secure Store

## Arquitectura

El proyecto separa responsabilidades para que la UI no dependa directamente de detalles del backend.

```txt
src/
  components/     Componentes reutilizables de UI
  context/        Estado global de autenticacion
  hooks/          React Query, Zustand y orquestacion de flujos
  navigation/     Navegacion y control por rol
  screens/        Pantallas principales
  services/       Cliente HTTP, Firebase y funciones de API
  theme/          Tokens visuales compartidos
```

### Flujo De Datos

1. Firebase autentica al usuario.
2. La app obtiene el ID token y lo guarda con `expo-secure-store`.
3. Axios agrega `Authorization: Bearer <TOKEN>` a las peticiones protegidas.
4. El backend valida el perfil con `/auth/me`.
5. React Query mantiene cacheados inventario, clientes, pagos y dashboard.
6. Las mutaciones invalidan las queries afectadas para mantener la UI sincronizada.

## Decisiones Tecnicas Destacables

- **Servicios separados de UI:** las pantallas consumen hooks, no endpoints directamente.
- **React Query para datos remotos:** se usa cache, refetch e invalidacion tras crear pagos, productos o transacciones.
- **Zustand para estado de scanner:** el flujo de escaneo mantiene pasos, barcode, selector de cliente y picker de categorias fuera de la pantalla.
- **Zod + React Hook Form:** el registro de producto valida precio, costo, departamento y categoria antes de enviar al backend.
- **Firebase + backend propio:** la autenticacion no se queda solo en frontend; el backend confirma el perfil y el rol.
- **Reglas de negocio visibles:** estados de inventario, apartados, prestamos y credito semanal se reflejan en UI.

## Pantallas Principales

- **Login:** autenticacion con Google/Firebase y acceso administrativo de pruebas.
- **Dashboard:** resumen de capital, cuentas por cobrar, liquidez y mermas.
- **Scanner:** lectura de barcode, busqueda de producto y acciones segun estado.
- **Inventario:** listado filtrable con estado visual por prenda.
- **Clientes:** busqueda, filtros por nivel y acceso a detalle.
- **Detalle de cliente:** historial de movimientos, deuda y pagos.
- **Pagos:** registro de abonos contra cuentas activas.

## Instalacion

Este proyecto usa `pnpm`.

```bash
pnpm install
```

Crear un archivo `.env` con las variables publicas necesarias:

```bash
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
```

Ejecutar en desarrollo:

```bash
pnpm exec expo start
```

Validar configuracion publica de Expo:

```bash
pnpm exec expo config --type public
```

## Build Android

El proyecto incluye perfiles de EAS para APK de prueba y Android App Bundle de produccion.

```bash
pnpm exec eas build -p android --profile preview
```

```bash
pnpm exec eas build -p android --profile production
```

## Backend

La app espera un backend con endpoints para:

- `GET /auth/me`
- `GET /products`
- `GET /products/barcode/:barcode`
- `POST /products`
- `GET /users/clients`
- `GET /users/clients/:id/profile`
- `GET /users/clients/:id/payment-history`
- `POST /payments`
- `POST /transactions`

Firebase Auth es la fuente de autenticacion. El backend es responsable de validar permisos y rol del usuario.

## Estado Actual

La app ya tiene los flujos administrativos principales implementados. Antes de presentarla como demo final conviene cerrar:

- README con capturas o video corto del flujo principal.
- Validacion manual en Android: login, scanner, inventario, clientes, pagos y transacciones.
- Pruebas automatizadas para reglas de negocio y utilidades criticas.
- Limpieza de credenciales/demo hardcodeadas antes de compartir publicamente.
- Vista final para rol cliente.

## Que Demuestra Como Frontend Developer

Este proyecto muestra habilidades transferibles a frontend web:

- Componentizacion y separacion de responsabilidades.
- Consumo de APIs REST con autenticacion.
- Manejo de estado remoto y cache.
- Validacion de formularios.
- Navegacion protegida por rol.
- Modelado de reglas de negocio en UI.
- Pensamiento de producto: flujos reales, casos borde y feedback al usuario.

## Roadmap

El archivo `ROADMAP.md` documenta decisiones, cambios realizados, pendientes de validacion y proximos pasos por feature.
