# Registro de bugs corregidos

Este documento registra las correcciones realizadas. Para cada nuevo arreglo,
agregar una entrada con el ID del bug, el error original, su ubicación, la
solución y su validación. No reemplazar las entradas anteriores.

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
