# Registro de bugs corregidos

Este documento registra las correcciones realizadas. Para cada nuevo arreglo,
agregar una entrada con el ID del bug, el error original, su ubicación, la
solución y su validación. No reemplazar las entradas anteriores.

## FE-001 — Restablecer el contrato de rutas con el backend

### Bug y error original

El frontend construía rutas remotas con `/api`, pero el backend NestJS configura
el prefijo global `/api/v1` en `BackendProyecto1/src/main.ts`. Con el backend
accesible, el login y las demás solicitudes apuntaban a rutas incorrectas,
provocando respuestas 404.

### Dónde se encontraba

- `src/app/api/auth/login/route.ts`, función `POST`: enviaba el login a
  `${BACKEND_URL}/api/auth/login`.
- `src/app/api/[...path]/route.ts`, función `forward`: construía el destino con
  `${BACKEND_URL}/api/`.
- `src/lib/server.ts`, función `apiGet`: construía el destino con
  `${BACKEND_URL}/api`.

### Dónde y cómo se solucionó

- En `src/lib/server.ts` se agregó `BACKEND_API_URL`, que combina el origen
  `BACKEND_URL` con `/api/v1`; `apiGet` utiliza esa base compartida.
- En las rutas de login y proxy se importa y utiliza `BACKEND_API_URL`.
- Se mantiene `/api` como ruta local del navegador y se conservan método,
  cuerpo, query string y Authorization.

### Validación

- `tests/backend-routes.test.mjs` ejecuta las funciones reales con HTTP y
  dependencias de Next.js simulados. Comprueba las rutas de login, lectura
  server-side y proxy, además de los datos reenviados.
- Comando desde la raíz: `node --test tests/backend-routes.test.mjs`.
- Las tres comprobaciones fallaron antes del arreglo y pasaron después.
- Typecheck sin emisión y ESLint de los archivos tocados también pasaron.
- No se comprobó la integración con un backend en ejecución.

## FE-016 — Distinguir credenciales incorrectas de sesión vencida

### Bug y error original

Un login con credenciales incorrectas recibía un 401 y el cliente lo trataba
como una sesión vencida: navegaba a `/login?expired=1`, descartaba los campos
y sustituía el mensaje de autenticación por `Sesion vencida`.

### Dónde se encontraba

- `src/lib/api.ts`, función `api`: la condición `res.status === 401` aplicaba
  la redirección a todas las solicitudes, incluso `/auth/login`, antes de
  leer el mensaje de respuesta.
- `src/app/login/login-form.tsx` ya capturaba `ApiError` y mostraba su mensaje;
  no necesitaba modificaciones.

### Dónde y cómo se solucionó

- En `src/lib/api.ts` la redirección exige ahora
  `res.status === 401 && path !== "/auth/login"`.
- El 401 del login se procesa como un error de autenticación y conserva el
  mensaje recibido, sin navegación ni pérdida de estado del formulario.
- Los recursos protegidos siguen redirigiendo a `/login?expired=1` ante un 401.

### Validación

- `tests/login-errors.test.mjs` comprueba credenciales incorrectas sin
  navegación, redirección de un recurso protegido y login exitoso.
- Comando desde la raíz: `node --test tests/login-errors.test.mjs`.
- El caso de credenciales incorrectas falló antes del arreglo; las tres
  pruebas pasaron después.
- ESLint de los archivos tocados y `git diff --check` pasaron.
- Respuestas HTTP simuladas; sin intentos contra cuentas reales ni validación
  visual en navegador.

## FE-029 — Validar el rol también en las subrutas

### Bug y error original

Un usuario era redirigido al abrir la raíz de un área ajena a su rol, pero
podía acceder a sus subpáginas, por ejemplo un estudiante a `/admin/usuarios`.
El backend conservaba sus controles; el fallo estaba en la redirección frontend.

### Dónde se encontraba

- `src/proxy.ts`, función `proxy`, línea 20: la búsqueda de área solo comprobaba
  `pathname === p`, por lo que los descendientes no activaban el control de rol.

### Dónde y cómo se solucionó

- En `src/proxy.ts` la búsqueda comprueba la raíz exacta o
  `pathname.startsWith(`${p}/`)`, incluyendo subrutas con límite de segmento.
- Las áreas ajenas redirigen a `HOME[session.role]`; rutas como `/administrativo`
  no se confunden con `/admin`. No se modificaron los permisos del backend.
- Se conservan el acceso al área propia y páginas comunes, la exigencia de sesión
  y los comportamientos de login y `?expired=1`.

### Validación

- `tests/proxy-role.test.mjs` ejecuta el proxy real transpilado y la decodificación
  real de sesión, con `NextRequest` y cookies de prueba para los tres roles.
- Comando desde la raíz: `node --test tests/proxy-role.test.mjs`.
- Antes del arreglo falló la redirección de una subruta ajena; después pasaron
  las tres pruebas de redirecciones, rutas permitidas y comportamiento de sesión.
- `git diff --check` sin errores. Sin validación visual ni llamadas al backend.
