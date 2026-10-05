# Registro de bugs corregidos

Este documento registra las correcciones realizadas. Para cada nuevo arreglo,
agregar una entrada con el ID del bug, el error original, su ubicación, la
solución y su validación. No reemplazar las entradas anteriores.

## FE-025 — Mostrar matriculados antes de la capacidad del grupo

### Bug y error original

Un grupo con 8 estudiantes y 30 cupos aparecía como `30 / 8 estudiantes`.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/page.tsx`, indicador de estudiantes de cada
  tarjeta: mostraba `capacity / enrolled`.

### Dónde y cómo se solucionó

- Se conserva el arreglo local previo que invierte el indicador a
  `enrolled / capacity`, coincidiendo con el detalle del grupo.

### Validación

- Desde la raíz: `node --test tests/teacher-group-capacity.test.mjs`.
- Datos y API simulados para 0, 8 y 30 matrículas con capacidad 30.
- Sin validación visual ni consultas a grupos reales.

## FE-031 — Restaurar el contraste del menú lateral

### Bug y error original

Los enlaces inactivos, sus íconos y los encabezados quedaban blancos sobre
el fondo blanco; los enlaces solo eran visibles al pasar el mouse.

### Dónde se encontraba

- `src/components/app-shell.tsx`: `renderLink` asignaba `text-white` a enlaces
  inactivos y los títulos de sección y Cuenta también usaban `text-white`.

### Dónde y cómo se solucionó

- Se conserva el arreglo local previo: enlaces inactivos con `text-ink` y
  títulos con `text-muted`. El enlace activo mantiene blanco sobre violeta.
- Los íconos heredan el color del enlace y escritorio/móvil comparten el menú.
- No se modifican rutas ni permisos.

### Validación

- Comprobación estática del componente y la paleta: enlaces 17.33:1,
  encabezados 5.51:1, activo 6.02:1 y hover 15.70:1; superan 4.5:1.
- ESLint del componente pasó. Sin validación visual en navegador.

## FE-030 — Saludo seguro para nombres de una sola palabra

### Bug y error original

El inicio del estudiante mostraba `Hola, undefined` con un nombre como `Ana`.
Con nombres de varias palabras usaba la segunda palabra en lugar de la primera.

### Dónde se encontraba

- `src/app/(app)/estudiante/page.tsx`, componente `StudentHome`, título de
  `PageHeader`: interpolaba `me.name.split(" ")[1]` sin comprobar que existiera.

### Dónde y cómo se solucionó

- El saludo usa `me.name.trim().split(/\s+/)[0] || "estudiante"`: toma la
  primera palabra, normaliza espacios y ofrece un fallback para nombres vacíos.
- La corrección y `tests/student-home-greeting.test.mjs` ya estaban presentes
  como cambios locales al iniciar esta revisión; se validaron sin reescribirlos.
  El resto del resumen del estudiante se mantiene intacto.

### Validación

- Desde la raíz: `node --test tests/student-home-greeting.test.mjs`:
  seis pruebas aprobadas para `Ana`, `Ana Ruiz`, espacios adicionales,
  tabulaciones/saltos de línea, nombre vacío y solo espacios. Ningún saludo
  contiene `undefined`.
- Se renderiza la página real con React y API/componentes visuales simulados.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false` no terminó
  dentro del timeout de 60 segundos; no se afirma que el typecheck haya pasado.
- Sin llamadas a cuentas reales ni validación visual en navegador.

## FE-020 — Mostrar errores al marcar notificaciones como leídas

### Bug y error original

Si fallaba Marcar leída o Marcar todas como leídas, se absorbía el rechazo
y se recargaba la lista sin explicar por qué las notificaciones seguían sin leer.

### Dónde se encontraba

- `src/app/(app)/notificaciones/notification-list.tsx`, funciones `markRead`
  y `markAll`: ambas usaban `.catch(() => undefined)` y recargaban siempre.
- `load` limpiaba el error de lectura al funcionar, sin un estado independiente
  para conservar y mostrar el error de la acción.

### Dónde y cómo se solucionó

- Se agregó `actionError` y un aviso visible sin reemplazar la lista ni sus
  botones, para permitir reintentar.
- Cada handler limpia el aviso al iniciar, captura el rechazo y muestra el
  mensaje de `ApiError` o un mensaje genérico seguro para errores inesperados.
- Solo se recarga después de una mutación exitosa. Una lectura posterior
  exitosa no borra el error de la acción; un reintento exitoso sí lo limpia.

### Validación

- Desde la raíz: `node --test tests/notification-pagination.test.mjs`.
- Cinco casos nuevos fallaban antes del arreglo; después pasan los ocho casos,
  incluyendo las tres regresiones de paginación de FE-019.
- Se comprueban errores de servidor/conexión para ambas acciones, persistencia
  del aviso tras un GET exitoso, reintento y actualización del contador, además
  de un mensaje genérico ante un rechazo inesperado.
- Typecheck sin emisión y ESLint focalizado pasaron.
- Componente, hooks y API simulados; sin modificar notificaciones reales ni
  validación visual en navegador.

## FE-009 — Permitir desplazamiento horizontal en listados administrativos

### Bug y error original

En pantallas estrechas, los listados administrativos recortaban las columnas
derechas y los botones de acciones. La tabla tenía un ancho mínimo de 40rem
y el usuario no disponía de desplazamiento horizontal para llegar a ellos.

### Dónde se encontraba

- `src/components/admin/resource-manager.tsx`, tabla de `ResourceManager`:
  un `Card` con `overflow-hidden` contenía un `div` sin scroll, envolviendo
  la tabla `min-w-[40rem]`. El excedente se recortaba dentro del Card.
- La columna Acciones, situada a la derecha, quedaba fuera del área visible.

### Dónde y cómo se solucionó

- Se agregó `className="overflow-x-auto"` al `div` que envuelve la tabla.
- La tabla puede desplazarse horizontalmente dentro del Card sin ensanchar
  la página. Se conserva `overflow-hidden` en el Card y su estilo existente.

### Validación

- Desde la raíz: `node --test tests/resource-table-scroll.test.mjs`.
- Las tres pruebas fallaban antes del cambio y pasan después en Chromium
  instalado, con viewports de 375, 768 y 1280px.
- Se renderiza el JSX real de la tabla y el Card con datos sintéticos y las
  utilidades CSS generadas por Tailwind. Se comprueba scroll interno, ausencia
  de overflow de página y acceso/clic a Operar y Editar al desplazarse.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- Prueba visual/layout aislada, sin levantar la aplicación, llamar al backend
  ni modificar registros reales. No se comprobó la página completa autenticada.

## FE-006 — Limpiar prerrequisitos al cambiar el programa

### Bug y error original

En Nueva materia, seleccionar un programa A y uno de sus prerrequisitos y
cambiar después al programa B ocultaba la selección anterior, pero conservaba
su ID en el cuerpo enviado. El usuario no podía quitar la casilla invisible.

### Dónde se encontraba

- `src/components/admin/resource-manager.tsx`, componente `RecordForm`, función
  `set`: actualizaba solo el campo elegido. El efecto de opciones dinámicas
  recargaba las materias, pero no limpiaba `values.prerequisites`.
- `src/components/admin/configs.tsx`, configuración `subjects`: las opciones
  dependen del programa y `toBody` transmite todos los IDs seleccionados.

### Dónde y cómo se solucionó

- En `RecordForm.set` se detectan los multiselects cuyo endpoint de opciones
  cambia con el nuevo valor. Se vacían sus selecciones y sus opciones visibles
  inmediatamente, antes de la recarga, para evitar conservar o volver a elegir
  prerrequisitos del programa anterior.
- No se limpia al abrir una edición, cambiar campos no relacionados o volver
  a seleccionar el mismo programa. Los prerrequisitos válidos existentes se
  conservan. La política al cambiar de programa es reiniciar la selección.

### Validación

- `tests/resource-prerequisites.test.mjs` ejecuta `set`, la carga de opciones y
  la configuración real de materias con estado y API simulados. Tres casos
  fallaron antes; las cinco pruebas pasan después: cambio A → B, edición
  inicial, campos no relacionados/mismo programa, vaciado y regreso a A.
- Desde la raíz: `node --test tests/resource-prerequisites.test.mjs tests/resource-form-dirty.test.mjs tests/resource-form-validation.test.mjs tests/resource-pagination.test.mjs`:
  dieciocho pruebas aprobadas, incluidas las regresiones del formulario.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- No se crearon materias ni se realizó validación visual en navegador.

## FE-019 — Recuperar una página válida al reducirse las notificaciones

### Bug y error original

Con 16 notificaciones sin leer, marcar la única de la página 2 podía mostrar
que no quedaban notificaciones, aunque todavía había 15 en la página 1.
La paginación desaparecía y no permitía volver con Anterior.

### Dónde se encontraba

- `src/app/(app)/notificaciones/notification-list.tsx`, callback `load`:
  aceptaba resultados de la página actual sin compararla con `totalPages`.
- `markRead` y `markAll` recargaban esa misma página después de reducir el
  conjunto filtrado; una respuesta vacía fuera de rango activaba el estado vacío.

### Dónde y cómo se solucionó

- `load` calcula la última página válida con `Math.max(1, next.meta.totalPages)`.
- Si la página solicitada está fuera de rango, limpia el resultado visible y
  actualiza `page`. El efecto existente vuelve a consultar la página válida
  manteniendo el filtro y el límite; no se publica el falso estado vacío.
- Si ya está dentro de rango, publica el resultado normalmente. Un conjunto
  realmente vacío sigue mostrando el mensaje de ausencia en la página 1.

### Validación

- Desde la raíz: `node --test tests/notification-pagination.test.mjs`.
- El componente real se ejecuta con hooks, JSX y API simulados. Dos casos
  fallaban antes del cambio y las tres pruebas pasan después: 16 sin leer →
  página 2 → marcar una → 15 visibles, una única notificación → vacío real,
  y marcar todas desde la página 2 → página 1 vacía.
- Typecheck sin emisión y ESLint del componente y la prueba pasaron.
- Sin modificar notificaciones reales ni validación visual en navegador.

## FE-010 — Aceptar coma como separador decimal de notas

### Bug y error original

La planilla rechazaba `3,5` aunque el parser documentaba que aceptaba coma o
punto. La nota se marcaba inválida y se bloqueaba su guardado.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx`, función `parse`:
  se aplicaba `trim` sin normalizar la coma antes de la expresión regular y
  de la conversión con `Number`.

### Dónde y cómo se solucionó

- `parse` normaliza una coma a punto antes de validar y convertir.
- Se mantiene el rango 0–5, el máximo de dos decimales y el rechazo de
  separadores múltiples o mezclados. El cuerpo de guardado utiliza un número.

### Validación

- `tests/grade-sheet-decimal.test.mjs` ejecuta el parser, el cálculo de cambios
  y la función de guardado reales con datos y API simulados.
- Desde la raíz: `node --test tests/grade-sheet-decimal.test.mjs tests/grade-sheet-empty.test.mjs tests/grade-sheet-save.test.mjs`.
- Tres casos de FE-010 fallaban antes del cambio; después pasan sus cuatro
  pruebas y las doce regresiones locales de FE-008 y FE-017.
- ESLint del componente y la prueba pasó.
- No se escribieron notas reales ni se realizó validación visual en navegador.

## FE-018 — Revalidar las condiciones al confirmar la finalización

### Bug y error original

Después de abrir la confirmación, editar una nota podía iniciar la finalización
con valores persistidos diferentes de los visibles. Las precondiciones solo
se comprobaban al abrir la confirmación, no en el handler de finalización.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx`, función `finalize`:
  enviaba el POST sin revalidar pendientes, plan completo o estudiantes listos.
- El botón `Confirmar` no revalidaba todas esas condiciones. El arreglo local
  de FE-008 ya bloqueaba pendientes en ese botón, pero no protegía el handler.

### Dónde y cómo se solucionó

- `finalize` retorna sin enviar solicitudes si hay cambios pendientes, falta
  un plan completo o no hay estudiantes listos. También rechaza una planilla
  ausente, modo de solo lectura o un guardado/finalización en curso.
- `Confirmar` comprueba pendientes, plan completo, estudiantes listos y
  guardado en curso; conserva su bloqueo por `loading` durante la finalización.
- Una confirmación válida conserva el POST, su resultado y la recarga existente.

### Validación

- `tests/grade-sheet-finalize.test.mjs` ejecuta el handler y la condición del
  botón extraídos del componente real con API y estado simulados.
- Desde la raíz: `node --test tests/grade-sheet-finalize.test.mjs tests/grade-sheet-empty.test.mjs tests/grade-sheet-save.test.mjs`.
- Ocho casos de FE-018 fallaban antes del cambio; después pasan sus nueve
  pruebas y las doce regresiones locales de FE-008 y FE-017.
- Typecheck sin emisión y ESLint focalizado pasaron.
- No se finalizaron grupos reales ni se realizó validación visual en navegador.

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

## FE-017 — Conservar ediciones realizadas durante el guardado de notas

### Bug y error original

Si el docente editaba otra celda o cambiaba nuevamente una nota mientras un
guardado estaba pendiente, esas ediciones desaparecían al recibir la respuesta.
No habían sido enviadas, pero se descartaban junto con las notas guardadas.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx`, función `save`:
  los elementos enviados se construían con la instantánea de `changes`, pero
  la limpieza posterior filtraba todos los borradores actuales usando solo
  las claves fallidas de aquella solicitud. Un éxito completo borraba todos.
- Los inputs permanecían editables durante el guardado.

### Dónde y cómo se solucionó

- En la misma función se construye `savedDrafts`, un mapa de claves y textos
  enviados con éxito, excluyendo los índices fallidos de la respuesta.
- El actualizador funcional de `setDrafts` elimina una entrada únicamente
  cuando su texto actual coincide con el enviado y guardado.
- Se conservan las celdas nuevas, los valores modificados durante la espera
  y las notas fallidas. La tabla sigue permitiendo editar mientras guarda.

### Validación

- `tests/grade-sheet-save.test.mjs` ejecuta la función `save` extraída del
  componente real, con estado y API simulados y una respuesta demorada.
- Comando desde la raíz: `node --test tests/grade-sheet-save.test.mjs`.
- Antes del arreglo fallaban los tres casos de pérdida de ediciones; después
  pasan las cinco pruebas: celda nueva, valor posterior en una celda enviada,
  éxito parcial conservando ediciones, limpieza de éxitos parciales sin
  ediciones nuevas y limpieza de un éxito completo sin ediciones nuevas.
- Typecheck sin emisión y ESLint del componente y la prueba pasaron.
- No se registraron notas reales ni se realizó validación visual en navegador.

## FE-008 — Reconocer el vaciado de una nota guardada como cambio inválido

### Bug y error original

Vaciar una nota guardada mostraba una celda en blanco, pero no generaba un
cambio pendiente. La interfaz podía permitir finalizar usando la nota
persistida aunque lo visible indicara otra cosa.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx`: el cálculo de
  `changes` ignoraba todos los borradores vacíos o con solo espacios.
- La condición `bad` tampoco marcaba esos vacíos como inválidos.
- El botón `Confirmar` no comprobaba cambios pendientes aparecidos después
  de abrir la confirmación de finalización.

### Dónde y cómo se solucionó

- Solo se ignora un borrador vacío cuando la nota guardada ya es `null`.
  Vaciar una nota numérica, incluido cero, cuenta como cambio con valor inválido.
- El indicador de invalidez usa la lista `invalid`, de modo que la celda y
  los botones comparten la misma validación. Guardar y Finalizar quedan
  bloqueados; Confirmar también se deshabilita si hay cambios pendientes.
- Restaurar el valor guardado elimina el pendiente. No se envía `null` ni
  se agrega una operación de borrado: el DTO del backend exige un número.
- Se conserva el arreglo previo de FE-017, que mantiene un vaciado realizado
  durante el guardado de otra celda.

### Validación

- `tests/grade-sheet-empty.test.mjs` ejecuta el componente real con hooks,
  JSX y API simulados. Cubre vacío, espacios, restauración, una nota ya ausente,
  cero, confirmación abierta y vaciado durante otro guardado.
- Desde la raíz: `node --test tests/grade-sheet-empty.test.mjs tests/grade-sheet-save.test.mjs`.
- Cinco casos de FE-008 fallaban antes del arreglo; después pasan los siete
  casos y las cinco regresiones de FE-017.
- Typecheck sin emisión y ESLint del componente y la nueva prueba pasaron.
- Sin escrituras de notas reales ni solicitudes de finalización; no se hizo
  validación visual en navegador.

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

## FE-023 — Actualizar Mis materias después de cancelar

### Bug y error original

Después de una cancelación exitosa, la tarjeta conservaba el estado activo y
volvía a ofrecer Cancelar. Solo una recarga manual obtenía la matrícula cancelada.

### Dónde se encontraba

- `src/app/(app)/estudiante/materias/cancel-button.tsx`, función `cancel`:
  tras el éxito cerraba la confirmación y limpiaba loading, sin actualizar datos.
- `src/app/(app)/estudiante/materias/page.tsx`, `MyEnrollmentsPage`:
  el estado y la presencia de CancelButton dependen de la consulta server-side;
  sus props permanecían iguales al terminar la cancelación.

### Dónde y cómo se solucionó

- CancelButton obtiene el router con `useRouter` de `next/navigation` y ejecuta
  `router.refresh()` únicamente después de que la API confirme el éxito.
- La página vuelve a consultar las matrículas. Ya muestra el estado Cancelada
  y omite CancelButton cuando la matrícula no está activa; no necesitó cambios.
- `apiGet` usa `cache: "no-store"`, por lo que la consulta obtiene datos nuevos.
- Ante un error no se refresca la página y se conserva la confirmación con su
  mensaje. La petición sigue usando POST conforme a FE-022.

### Validación

- `tests/enrollment-refresh.test.mjs` ejecuta CancelButton y la página reales
  con hooks, router y HTTP simulados, y renderiza la página con React.
- Antes del cambio falla el caso exitoso por no refrescar. Después, un 200
  provoca una nueva consulta y muestra Cancelada sin Cancelar; un 403 conserva
  la tarjeta activa, su acción y el mensaje, sin consulta adicional.
- Se adaptó el mock de router en `tests/enrollment-cancel.test.mjs`, sin cambiar
  las aserciones de FE-022.
- Desde la raíz: `node --test tests/enrollment-refresh.test.mjs tests/enrollment-cancel.test.mjs`:
  seis pruebas pasan. `git diff --check`: sin errores.
- No se cancelaron matrículas reales ni se validó el router en un navegador.

## FE-011 — Mostrar las clases del sábado en su tarjeta

### Bug y error original

Las clases con `day: "sabado"` aparecían dentro de Viernes, mientras Sábado
mostraba Sin clases. Afectaba a los horarios de estudiante y docente.

### Dónde se encontraba

- `src/components/week-schedule.tsx`, componente `WeekSchedule`:
  `Math.min(DAYS.indexOf(d), 4)` reducía el índice de sábado (5) al de viernes
  (4), mezclando sus franjas. Ninguna franja podía llegar a la tarjeta de sábado.
- Las páginas `src/app/(app)/estudiante/horario/page.tsx` y
  `src/app/(app)/docente/horario/page.tsx` comparten este componente.

### Dónde y cómo se solucionó

- Cada tarjeta obtiene ahora `byDay[day] ?? []`, sin agrupar por un índice
  limitado a viernes. Se elimina el índice innecesario del callback y el
  comentario incorrecto sobre el final de la semana académica.
- Se conservan las seis tarjetas y Sin clases para los días sin franjas.
  No se modifican las páginas consumidoras ni los datos o etiquetas de formato.

### Validación

- `tests/week-schedule-days.test.mjs` renderiza el componente y ambas páginas
  reales con React y respuestas de horario simuladas.
- Comprueba viernes y sábado separados, sin duplicaciones ni pérdidas, un
  horario exclusivo de sábado con viernes vacío, y ambas pantallas consumidoras.
- Desde la raíz: `node --test tests/week-schedule-days.test.mjs`.
  Las cuatro pruebas fallaron antes del cambio y pasaron después.
- `git diff --check`: sin errores.
- No se crearon grupos ni se comprobó la interfaz en un navegador.

## FE-007 — Corregir el porcentaje faltante del plan de evaluación

### Bug y error original

Un plan que sumaba 60% mostraba Te pasaste 40%, mientras uno que sumaba 120%
mostraba Faltan 20%. El indicador describía la acción contraria a la necesaria.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/[id]/evaluations-panel.tsx`, `EvaluationsPanel`:
  `remaining` se calculaba como `total - 100`, pero el mensaje interpretaba un
  valor positivo como porcentaje faltante y uno negativo como exceso.

### Dónde y cómo se solucionó

- Se cambió únicamente el cálculo a `100 - total`, consistente con las ramas
  existentes del mensaje. Se conserva la suma de pesos, la barra de progreso
  y la indicación especial de plan completo cuando el total es 100%.

### Validación

- `tests/evaluation-plan-total.test.mjs` renderiza el componente real con React,
  estado sintético y efectos desactivados, sin peticiones ni escrituras.
- Comprueba totales 0, 60, 100 y 120 tanto en modo editable como de solo lectura:
  Faltan 100%, Faltan 40%, El plan está completo y Te pasaste 20%, respectivamente.
- Desde la raíz: `node --test tests/evaluation-plan-total.test.mjs`.
  Antes fallaban seis casos y pasaban los dos de 100%; después pasan los ocho.
- `git diff --check`: sin errores.
- No se crearon evaluaciones reales ni se comprobó la interfaz en un navegador.

## FE-027 — Mostrar el contador correcto de docentes activos

### Bug y error original

La tarjeta Docentes activos repetía el número de estudiantes activos. Con
120 estudiantes y 8 docentes, ambas tarjetas mostraban 120.

### Dónde se encontraba

- `src/app/(app)/admin/page.tsx`, función `AdminHome`: la tarjeta de docentes
  recibía `d.active.students`, igual que la tarjeta de estudiantes.
- `Dashboard.active` en `src/lib/types.ts` ya declara `teachers` y `students`
  como contadores independientes; no faltaba información en el contrato.

### Dónde y cómo se solucionó

- La tarjeta Docentes activos recibe ahora `d.active.teachers`.
- No se modifican el contador de estudiantes, los demás indicadores, la
  consulta del dashboard ni el contrato de la API.

### Validación

- `tests/admin-active-teachers.test.mjs` renderiza AdminHome, StatCard y Card
  reales con React y una respuesta de dashboard simulada.
- Comprueba estudiantes/docentes con valores 120/8, 120/0 y 0/8, y verifica
  que los indicadores de estudiantes, programas y facultades se conservan.
- Desde la raíz: `node --test tests/admin-active-teachers.test.mjs`.
  Las tres pruebas fallaron antes del cambio y pasaron después.
- `git diff --check`: sin errores.
- Sin peticiones reales, cambios de datos ni validación en navegador.

## FE-028 — Consultar los conteos de matrículas por su clave de estado

### Bug y error original

El resumen del periodo abierto mostraba cero para todos los estados aunque
el dashboard devolviera conteos positivos de matrículas.

### Dónde se encontraba

- `src/app/(app)/admin/page.tsx`, función `AdminHome`: al recorrer
  `STATUS_LABEL` consultaba `p.enrollmentsByStatus[label]`, con etiquetas como
  Activas, en lugar de las claves contractuales como `activa`.
- `BackendProyecto1/src/reports/reports.service.ts` construye el registro por
  los valores originales de status; el fallback a cero ocultaba la discrepancia.

### Dónde y cómo se solucionó

- Se usa `p.enrollmentsByStatus[key] ?? 0` para obtener cada conteo.
- `label` se conserva como texto visible y cero queda reservado para estados
  ausentes. No se cambian las etiquetas, la API ni otros indicadores del panel.

### Validación

- `tests/admin-enrollment-status-counts.test.mjs` renderiza AdminHome, StatCard
  y Card reales con React y un dashboard simulado con periodo abierto.
- Comprueba los cuatro valores 12, 7, 3 y 2, la ausencia individual de cada
  estado y un registro vacío. Solo los estados ausentes muestran cero.
- Antes del cambio fallaban cinco casos y pasaba el registro vacío.
- Desde la raíz: `node --test tests/admin-enrollment-status-counts.test.mjs tests/admin-active-teachers.test.mjs`.
  Pasan nueve pruebas, incluidas las tres regresiones de FE-027.
- `git diff --check`: sin errores.
- Sin peticiones reales, cambios de datos ni validación en navegador.

## FE-012 — Ponderar el acumulado de notas del estudiante

### Bug y error original

En `/estudiante/notas`, el acumulado mostraba la media aritmética de las notas
registradas, ignorando sus pesos. Una nota 5 al 20% y una nota 1 al 80%
mostraban 3.00 en vez de 1.80 cuando aún no había nota final publicada.

### Dónde se encontraba

- `src/app/(app)/estudiante/notas/page.tsx`, función `GradesPage`, línea 40:
  `points` sumaba las notas y dividía por `graded.length`.

### Dónde y cómo se solucionó

- En la misma línea se calcula la suma de `nota * (peso / 100)`, consistente
  con el acumulado de la planilla académica; no se divide por el peso evaluado.
- Las evaluaciones pendientes no aportan puntos. Una nota cero sí cuenta como
  evaluada. Se mantienen el porcentaje evaluado, el guion sin notas y la
  prioridad de la nota final publicada.
- Se añadió `tests/student-grade-accumulated.test.mjs` como regresión focalizada.

### Validación

- Desde la raíz: `node --test tests/student-grade-accumulated.test.mjs`.
- La página real transpilada se renderiza con React y respuestas API sintéticas;
  los contenedores visuales se simulan. Antes fallaban tres casos; después pasan
  las siete pruebas: pesos diferentes, pesos iguales, nota cero, pendientes,
  todas pendientes, solo cero registrado y nota final publicada.
- `git diff --check` sin errores. Sin modificar notas reales ni finalizar
  matrículas; sin validación visual en navegador ni integración con el backend.

## FE-013 — Mostrar 3.0 como nota parcial aprobatoria

### Bug y error original

En `/estudiante/notas`, una evaluación con nota exactamente 3.0 aparecía con
color de peligro, aunque la página indica aprobación desde 3.0 y la nota final
con ese valor sí se mostraba con color de éxito.

### Dónde se encontraba

- `src/app/(app)/estudiante/notas/page.tsx`, función `GradesPage`, línea 73:
  el estilo de notas parciales usaba `value <= PASSING`, incluyendo el umbral
  aprobatorio en el color de peligro. La nota final ya utilizaba `< PASSING`.

### Dónde y cómo se solucionó

- En la misma condición se cambió `<=` por `<`, unificando el criterio de
  parciales y finales. Se compara el valor numérico original, sin redondearlo.
- Se conserva el estilo neutro y el texto de las evaluaciones pendientes.
- Se añadió `tests/student-grade-passing.test.mjs` como prueba de regresión.

### Validación

- Desde la raíz: `node --test tests/student-grade-passing.test.mjs`.
- La página real transpilada se renderiza con React, API sintética y contenedores
  visuales simulados. El caso 3.0 falló antes; después pasan las cinco pruebas:
  notas 0, 2.99, 3.0 y 3.01 con tonos coherentes en parciales y finales, y pendientes.
- `node --test tests/student-grade-passing.test.mjs tests/student-grade-accumulated.test.mjs`:
  pasan doce pruebas, incluidas las siete de FE-012 que sigue pendiente de commit.
- Sin escrituras reales ni validación visual en navegador.

## FE-004 — Permitir cerrar la edición de usuarios sin cambios

### Bug y error original

En `/admin/usuarios`, abrir la edición y pulsar Cancelar o la X sin modificar
campos no cerraba el modal. Editar y restaurar los valores originales tampoco
permitía cerrarlo.

### Dónde se encontraba

- `src/components/admin/resource-manager.tsx`, componente `RecordForm`, efecto
  que notifica `onDirty`: comparaba `values`, normalizado por `config.initial`,
  con el documento crudo `row` de la API. Sus campos y representaciones difieren.
- La configuración de usuarios incluye una contraseña vacía y omite `_id`;
  la diferencia marcaba cambios inexistentes y activaba `keepOpenIfDirty` en
  `ResourceManager.closeForm`, compartido por Cancelar y la X del modal.

### Dónde y cómo se solucionó

- En el efecto de `RecordForm` se compara ahora `values` con
  `config.initial(row)`, usando la misma representación en ambos lados.
- Abrir sin editar o restaurar los valores originales produce `dirty=false`.
  Los cambios reales siguen bloqueando el cierre en los recursos configurados
  para ello. No se modificaron la configuración de usuarios ni el modal.

### Validación

- `tests/resource-form-dirty.test.mjs` ejecuta el efecto, `closeForm` y el
  inicializador de usuarios reales con estado simulado. Tres casos fallaron
  antes del arreglo; las cinco pruebas pasan después, incluyendo edición real,
  restauración de texto y checkbox, apertura sin cambios y creación.
- Desde la raíz: `node --test tests/resource-form-dirty.test.mjs tests/resource-form-validation.test.mjs tests/resource-pagination.test.mjs`:
  trece pruebas aprobadas, incluidas las regresiones de FE-005 y FE-003.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- No se guardaron usuarios ni se realizó validación visual en navegador.

## FE-014 — Distinguir la etiqueta de matrículas reprobadas

### Bug y error original

Las matrículas con estado `reprobada` se mostraban como "Aprobada" en los
consumidores del mapa compartido, aunque conservaban el tono de peligro.
La interfaz comunicaba un resultado opuesto al recibido desde la API.

### Dónde se encontraba

- `src/lib/format.ts`, constante `STATUS_LABEL`, línea 25: `reprobada`
  tenía asignada la misma etiqueta "Aprobada" que `aprobada`.
- Historial, notas, planilla docente y administración usan ese mapa compartido.

### Dónde y cómo se solucionó

- Se cambió únicamente `STATUS_LABEL.reprobada` a "Reprobada" en
  `src/lib/format.ts`. Los consumidores reciben la etiqueta correcta sin cambios.
- Se conservaron los otros tres textos, los tonos y los estados originales;
  no se modificaron resultados académicos ni datos del backend.
- Se añadió `tests/enrollment-status-label.test.mjs` como regresión focalizada.

### Validación

- Desde la raíz: `node --test tests/enrollment-status-label.test.mjs`.
- Las tres pruebas fallaron antes y pasan después. Comprueban los cuatro
  estados y sus tonos, y renderizan con React el JSX real de los badges de
  historial y planilla usando el componente `Badge` y los mapas reales.
- Los badges de los consumidores se prueban en aislamiento, no las pantallas
  completas. Sin llamadas API, cambios de datos ni validación en navegador.

## FE-015 — Restaurar el encabezado Lunes en los horarios

### Bug y error original

Los horarios semanales de estudiante y docente mostraban "Lrrrrunes" en la
tarjeta del lunes, tanto con clases como sin ellas.

### Dónde se encontraba

- `src/lib/format.ts`, constante `DAY_LABEL`, línea 6: la clave `lunes` tenía
  asignado el texto corrupto "Lrrrrunes".
- `src/components/week-schedule.tsx` imprime directamente `DAY_LABEL[day]`
  como encabezado de cada tarjeta.

### Dónde y cómo se solucionó

- Se sustituyó únicamente la etiqueta por "Lunes" en `src/lib/format.ts`.
- Se conservaron la clave `lunes`, los demás encabezados y los contratos del
  horario. No fue necesario modificar el componente compartido ni su agrupación.
- Se añadió `tests/week-schedule-labels.test.mjs` como regresión focalizada.

### Validación

- Desde la raíz: `node --test tests/week-schedule-labels.test.mjs`.
- Las tres pruebas fallaron antes y pasan después: claves y etiquetas del
  diccionario, seis encabezados con listas vacías y encabezados con clases cargadas.
- Se renderizan el componente `WeekSchedule` y el diccionario reales con React;
  solo se simulan el contenedor Card y la combinación de clases CSS.
- Sin llamadas API ni cambios de horarios reales; sin validación en navegador.

## FE-002 — Habilitar el guardado de un nombre modificado

### Bug y error original

En `/cuenta`, editar el nombre con un valor distinto y no vacío nunca habilitaba
"Guardar nombre", impidiendo actualizarlo mediante el botón del formulario.

### Dónde se encontraba

- `src/app/(app)/cuenta/account-forms.tsx`, componente `AccountForms`, línea 19:
  `dirty` se inicializaba a `false` y nunca se actualizaba.
- La condición `disabled` del botón incluía `!dirty`; `onChange` solo cambiaba
  `newName`, por lo que el botón permanecía deshabilitado.

### Dónde y cómo se solucionó

- En `AccountForms`, `dirty` se deriva de `newName.trim() !== name.trim()` en
  lugar de almacenarse en un estado independiente que no se sincronizaba.
- El botón se deshabilita si no hay cambio o el nombre está vacío; su prop
  `loading={savingName}` conserva el bloqueo durante el guardado.
- Se mantienen PATCH `/users/me`, el envío del nombre recortado, la notificación
  de éxito/error y `router.refresh()`. No se modificó el formulario de contraseña.
- Se añadió `tests/account-name.test.mjs` como regresión focalizada.

### Validación

- Desde la raíz: `node --test tests/account-name.test.mjs`. Las cuatro pruebas
  fallaban antes y pasan después: edición/vaciado/restauración, espacios,
  guardado correcto y reintento tras error.
- Se ejecutan el componente, el cliente API y el botón reales con estado,
  router y HTTP simulados. Se verifica PATCH `/api/users/me`, el cuerpo recortado,
  el atributo HTML `disabled` durante la espera y la actualización simulada del nombre.
- `& './node_modules/.bin/eslint.cmd' 'src/app/(app)/cuenta/account-forms.tsx' --no-fix --no-cache`: correcto.
- `& './node_modules/.bin/tsc.cmd' --noEmit --incremental false --pretty false`: correcto.
- Sin cambios de perfiles reales ni validación visual en navegador.

## FE-026 — Contar solo las matrículas activas del periodo actual

### Bug y error original

El inicio del estudiante mostraba el total histórico de matrículas como
"Matrículas activas este periodo". Contaba estados no activos y otros periodos,
incluso cuando no existía un periodo abierto.

### Dónde se encontraba

- `src/app/(app)/estudiante/page.tsx`, función `StudentHome`: consultaba
  `/enrollments/mine?limit=1` sin filtros y mostraba `meta.total` como actividad
  del periodo. El periodo obtenido en paralelo no se usaba para esa consulta.

### Dónde y cómo se solucionó

- La consulta de matrículas espera al resultado de `/periods/current` y envía
  `status=activa`, `period=<ID actual>` y `limit=1`.
- Se reutiliza una sola promesa de periodo; usuario y notificaciones siguen
  cargándose en paralelo. Sin periodo abierto no se consultan matrículas y
  el indicador muestra cero, conservando el mensaje de ausencia de periodo.
- Se conserva el fallback a cero si la consulta de matrículas no devuelve datos.
- Se añadió `tests/student-home-enrollments.test.mjs` como regresión focalizada.

### Validación

- Desde la raíz: `node --test tests/student-home-enrollments.test.mjs`.
- Las cinco pruebas fallaban antes y pasan después. Cubren dos matrículas
  activas actuales frente a seis históricas/no activas, ausencia de periodo,
  cero matrículas activas, fallo de consulta y espera del periodo manteniendo
  el inicio paralelo de las solicitudes independientes.
- Se renderizan `StudentHome` y `StatCard` reales con API y contenedor Card
  simulados; se comprueban el total mostrado y ambos filtros enviados.
- `& './node_modules/.bin/eslint.cmd' 'src/app/(app)/estudiante/page.tsx' --no-fix --no-cache`: correcto.
- Sin creación de matrículas ni llamadas al backend; sin validación en navegador.

## FE-024 — Aplicar el periodo seleccionado al listado de grupos

### Bug y error original

Al entrar a `/docente/grupos` sin query, el selector mostraba el periodo abierto
pero el listado consultaba todos los periodos y podía incluir grupos históricos.

### Dónde se encontraba

- `src/app/(app)/docente/grupos/page.tsx`, función `MyGroupsPage`, línea 21:
  la consulta añadía `period` solo si `requested` era un string, aunque `selected`
  ya contenía el periodo abierto por defecto.

### Dónde y cómo se solucionó

- La condición del filtro usa ahora `selected && selected !== "todos"`.
  Selector y consulta comparten el mismo periodo efectivo, también por defecto.
- Se omite el filtro para "Todos", selección vacía o ausencia de periodo abierto.
  Una selección explícita se conserva; una query de tipo array mantiene el fallback
  existente al periodo abierto. No se cambió el selector ni el backend.
- Se añadió `tests/teacher-groups-period.test.mjs` como regresión focalizada.
- El cambio de capacidad/matriculados de FE-025 se conserva fuera de este fix.

### Validación

- Desde la raíz: `node --test tests/teacher-groups-period.test.mjs`.
- Antes fallaban tres casos; después pasan las seis pruebas: periodo por defecto,
  Todos, periodo histórico explícito, ausencia de periodo abierto, selección vacía
  y query de tipo array.
- Se renderizan la página y `PeriodSelect` reales con React, API y navegación
  simuladas. Se comprueban el filtro enviado, la opción seleccionada y los grupos.
- ESLint acotado se intentó con límites de 30 y 60 segundos; ambos expiraron sin
  resultado. `git diff --check` pasó sin errores.
- Sin llamadas reales, cambios de datos ni validación visual en navegador.
