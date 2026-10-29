# AutoAndes Web

SPA en **Angular 22** (componentes standalone, signals, sin zone.js) para los asesores del mostrador y el jefe de taller de **AutoAndes**. Consume el backend [autoandes-backend](https://github.com/Legends600/autoandes-backend) (Spring Boot 4 + Oracle + JWT).

> Examen Parcial II – Lenguaje de Programación II – Versión A.

## Requisitos

| Herramienta | Versión probada |
|---|---|
| Node.js | 24 |
| Angular CLI | 22.2 |
| Backend AutoAndes API | corriendo en `http://localhost:8080` |

## Cómo ejecutar

```bash
npm install
ng serve          # http://localhost:4200
```

La URL de la API está en `src/environments/environment.ts` (`apiUrl: 'http://localhost:8080/api/v1'`).
El backend ya permite CORS desde `http://localhost:4200`.

Otras órdenes útiles:

```bash
ng build          # compilación de producción en dist/
ng test --no-watch  # pruebas unitarias (Vitest)
```

## Usuarios de prueba

| Usuario | Contraseña | Rol | Qué ve |
|---|---|---|---|
| `admin` | `Auto2026*` | ADMIN | Todo |
| `asesor` | `Auto2026*` | ASESOR | Órdenes (consultar y registrar), vehículos (CRUD), servicios (solo lectura) |
| `jefe` | `Auto2026*` | JEFE_TALLER | Órdenes (consultar y anular), servicios (CRUD), vehículos (solo lectura), reportes |
| `inactivo` | `Auto2026*` | ASESOR (cuenta inactiva) | No puede iniciar sesión (401) |

## Estructura (`src/app`)

```
core/        modelos, servicios HTTP (uno por recurso), sesión (AuthService), guards, interceptores, menú
  auth/        AuthService con signals + sessionStorage con vencimiento
  guards/      authGuard, invitadoGuard, permisoGuard
  interceptors/ authInterceptor (Bearer), errorInterceptor (401)
  config/      menu.ts, permisos.ts
  services/    servicios-api, vehiculos-api, clientes-api, ordenes-api, reportes-api
shared/      directiva *siPermiso, campo-error, confirmar-dialogo, avisos, páginas "Acceso denegado" y "No encontrado"
layout/      main-layout, header, sidebar
features/    auth/login, servicios, vehiculos, ordenes (registro, consulta, detalle), reportes
```

## Rutas

| Ruta | Permiso (en `data` de la ruta) |
|---|---|
| `/login` | solo invitados (`invitadoGuard`) |
| `/ordenes` | `ORDEN_LEER` |
| `/ordenes/nueva` | `ORDEN_REGISTRAR` |
| `/ordenes/:id` | `ORDEN_LEER` (el botón *Anular* exige `ORDEN_ANULAR`) |
| `/vehiculos`, `/vehiculos/nuevo`, `/vehiculos/:id/editar` | `VEHICULO_LEER` / `VEHICULO_ESCRIBIR` |
| `/servicios`, `/servicios/nuevo`, `/servicios/:id/editar` | `SERVICIO_LEER` / `SERVICIO_ESCRIBIR` |
| `/reportes` | `REPORTE_VER` |
| `/acceso-denegado`, `**` | páginas de estado |

Todas las rutas hijas se cargan de forma diferida (`loadChildren` / `loadComponent`) y viven dentro del layout protegido por `authGuard`; el login queda fuera del layout.

## Seguridad en la SPA

- **Sesión**: `AuthService` guarda la sesión en una *signal* y en `sessionStorage` junto con su instante de vencimiento. Se usa `sessionStorage` (no `localStorage`) porque las computadoras del mostrador se comparten: al cerrar la pestaña la sesión desaparece. Un temporizador cierra la sesión sola cuando vence el token.
- **Interceptor de token**: único lugar donde se agrega `Authorization: Bearer …`, y solo a peticiones dirigidas a `environment.apiUrl`.
- **Interceptor de errores**: ante un **401** (excepto el del login) cierra la sesión y vuelve a `/login?returnUrl=…`. Un **403 no cierra la sesión**.
- **Guards**: `authGuard` (layout), `invitadoGuard` (login), `permisoGuard` (lee `route.data['permiso']`).
- **Menú y botones**: la directiva `*siPermiso` y el menú leen la *signal* de permisos, por eso se actualizan solos al cambiar de usuario, sin recargar.
- Ocultar un botón o un menú es solo comodidad: **el backend rechaza con 403** cualquier operación sin el permiso.

## Reglas de negocio

Viven en el backend. La SPA muestra tal cual el mensaje que devuelve (400 bajo cada campo; 404 y 409 en la página). En el registro de la orden, el subtotal y el total que se ven son solo una ayuda: al backend solo viajan `vehiculoId`, `kilometraje` y `(servicioId, cantidad)`, y es el backend quien calcula y guarda los importes.
