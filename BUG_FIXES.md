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

## FE-005 — Validar límites numéricos antes de guardar recursos

### Bug y error original

El formulario administrativo permitía enviar créditos de programa iguales a 0
o negativos y valores que superaban los máximos configurados, como créditos de
materia mayores que 10. El error se descubría recién en la API.

### Dónde se encontraba

- `src/components/admin/resource-manager.tsx`, componente `RecordForm`, función
  `submit`: el formulario usaba `noValidate` y enviaba el cuerpo sin comprobar
  la validez nativa. El botón solo comprobaba campos vacíos mediante `missing`.
- Los límites ya estaban definidos en `src/components/admin/configs.tsx` y
  transmitidos al input por `src/components/ui/field.tsx`; no requerían cambios.

### Dónde y cómo se solucionó

- En `RecordForm.submit` se tipa el evento como `FormEvent<HTMLFormElement>` y
  se retorna antes de construir el cuerpo o llamar a la API si hay campos
  faltantes o `event.currentTarget.reportValidity()` devuelve `false`.
- La validación nativa comprueba los atributos `min`, `max` y la validez del
  input, mostrando su mensaje. La protección aplica a creación y edición,
  también cuando el envío llega por teclado, sin depender solo del botón.

### Validación

- `node --test tests/resource-form-validation.test.mjs`: cinco pruebas que
  ejecutan la función real con validez nativa y API simuladas. Fallaban antes
  del cambio y pasan después; cubren bloqueo de POST/PATCH inválidos, campos
  faltantes y continuación de creación/edición válidas.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- `git diff --check`: sin errores.
- Comandos desde la raíz de `proyectoFrontend1`. No se enviaron datos reales
  ni se comprobó la interfaz en un navegador.

## FE-021 — Enviar groupId al crear matrículas

### Bug y error original

La matrícula de estudiante y la creación administrativa enviaban `group` y
omitían `groupId`, obligatorio en `CreateEnrollmentDto`. El backend rechaza
campos no declarados, por lo que ambos cuerpos incumplían el contrato.

### Dónde se encontraba

- `src/app/(app)/estudiante/matricula/enroll-view.tsx`, función `enroll`:
  el POST a `/enrollments` enviaba `{ group: g.group }`.
- `src/components/admin/operations.tsx`, configuración `enrollments.toBody`:
  construía `{ student: text(v.student), group: text(v.group) }`.

### Dónde y cómo se solucionó

- En `enroll` se envía ahora `{ groupId: g.group }`.
- En `enrollments.toBody` se envía
  `{ student: text(v.student), groupId: text(v.group) }`.
- Se mantienen los campos locales del formulario, los IDs completos y el
  estudiante del flujo administrativo. No se modifica el backend.

### Validación

- `tests/enrollment-payload.test.mjs` ejecuta la función `enroll`, el mapeo
  administrativo y el cliente API reales con respuestas HTTP simuladas.
- Comando desde la raíz: `node --test tests/enrollment-payload.test.mjs`.
- Las dos pruebas fallaron antes del arreglo y pasaron después. Comprueban
  POST `/api/enrollments`, los IDs completos y la ausencia de `group`.
- `git diff --check` pasó sin errores.
- No se realizaron matrículas reales ni pruebas integradas contra el backend.

## FE-022 — Usar POST para cancelar matrículas

### Bug y error original

La cancelación desde estudiante y administración enviaba `PATCH` a
`/enrollments/:id/cancel`, pero el controller del backend registra `POST`.
El proxy conserva el método, por lo que la petición no encontraba la operación.

### Dónde se encontraba

- `src/app/(app)/estudiante/materias/cancel-button.tsx`, función `cancel`:
  la llamada a la API utilizaba `method: "PATCH"`.
- `src/components/admin/operations.tsx`, acción `enrollments.rowActions`:
  el callback `run` de la confirmación administrativa también usaba `PATCH`.

### Dónde y cómo se solucionó

- Se cambió únicamente el método de ambas llamadas a `POST`, de acuerdo con
  `@Post(':id/cancel')` en el backend.
- Se mantienen la ruta, el ID completo, la confirmación y el manejo de errores.
  No se modifican el proxy, el backend ni otros endpoints de edición.

### Validación

- `tests/enrollment-cancel.test.mjs` ejecuta las funciones reales de cancelación,
  confirmación y cliente API con HTTP simulado. Comprueba POST y el ID completo,
  cierre de la confirmación y recarga administrativa ante 200, y conservación
  de la confirmación con mensaje de error ante 403.
- Desde la raíz: `node --test tests/enrollment-cancel.test.mjs`. Los cuatro
  casos fallaron antes del cambio por enviar PATCH y pasaron después.
- `node --test tests/enrollment-cancel.test.mjs tests/enrollment-payload.test.mjs`:
  seis pruebas pasan, incluida la regresión de creación de matrículas FE-021.
- `git diff --check`: sin errores.
- No se cancelaron matrículas reales ni se probó contra un backend en ejecución.

## FE-003 — Conservar filtros al paginar listados administrativos

### Bug y error original

Al pasar a la segunda página de un listado filtrado, los filtros permanecían
visibles pero desaparecían de la solicitud. Aparecían registros ajenos a la
selección y el total dejaba de corresponder al conjunto filtrado.

### Dónde se encontraba

- `src/components/admin/resource-manager.tsx`, componente `ResourceManager`,
  callback `load`: `if (page === 1)` condicionaba la incorporación de todos
  los filtros a los parámetros de la solicitud.
- Por ejemplo, los filtros `role` y `active` de usuarios estaban definidos en
  `src/components/admin/configs.tsx`, pero no se enviaban desde la página 2.

### Dónde y cómo se solucionó

- En `ResourceManager.load` se eliminó exclusivamente la condición de página.
  Los filtros no vacíos se agregan ahora a todas las solicitudes paginadas.
- Se mantienen la búsqueda, el límite de 15 registros, la omisión de filtros
  vacíos y el reinicio existente a la página 1 cuando se cambia un filtro.

### Validación

- `node --test tests/resource-pagination.test.mjs tests/resource-form-validation.test.mjs`:
  ocho pruebas aprobadas, incluidas las cinco regresiones de FE-005.
- Dos casos nuevos fallaban antes del cambio. Las tres pruebas de FE-003
  comprueban navegación 1 → 2 → 1 con 17 coincidencias y total estable,
  ausencia de filtros y conservación/codificación de filtros de texto.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- Comandos desde la raíz de `proyectoFrontend1`, con API simulada y sin
  escrituras reales. No se realizó validación visual en navegador.
