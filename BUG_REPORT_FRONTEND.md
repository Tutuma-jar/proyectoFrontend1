# Bug Report

## Summary

Area: frontend
Total detected: 1
Confirmed: 1
Probable: 0
Cumulative entries: 31
Previous entries not revalidated: 30 (no incluidas en los totales actuales)

Scope: Revisión acotada del contraste del menú lateral en src/components/app-shell.tsx y la paleta de src/app/globals.css. Se registra FE-031; no se revalidaron FE-001 a FE-030 ni se inspeccionó el backend.

Checks:
- Cwd: C:/Users/Nat/examen/proyectoFrontend1.
- `git rev-parse --is-inside-work-tree`: código 0, true; `git rev-parse --show-toplevel`: código 0, raíz confirmada.
- `git status --short`: estado inicial con trabajo ajeno en .gitignore, BUG_FIXES.md, package-lock.json, package.json, evaluations-panel.tsx, grade-sheet-panel.tsx, estudiante/notas/page.tsx y tsconfig.json; archivos sin rastrear .codex/, AI_CONTEXT.md, este reporte, playwright.config.js y cuatro pruebas .mjs. No se revirtió ni modificó ese trabajo.
- Se leyeron AI_CONTEXT.md, package.json y eslint.config.mjs. npm con package-lock.json; lint configurado sin hooks adicionales en package.json.
- `& './node_modules/.bin/eslint.cmd' src/components/app-shell.tsx --no-fix --no-cache`: código 0, sin diagnósticos, timeout 60 segundos. No detecta el defecto visual; la confirmación se basa en las clases y colores explícitos.
- Build, servidores, Playwright y pruebas globales omitidos: no necesarios para demostrar esta causa; se evitó generar archivos, iniciar procesos persistentes o contactar servicios. No se instalaron dependencias ni se escribieron pruebas.
- `git status --short` final: hubo cambios externos durante la revisión (account-forms.tsx y tests/notification-pagination.test.mjs aparecen modificados; evaluations-panel.tsx ya no figura modificado; aparecen tests/account-name.test.mjs y tests/resource-table-scroll.test.mjs; evaluation-plan-total.test.mjs ya no figura sin rastrear). Ninguno fue escrito por este agente. app-shell.tsx y globals.css no figuran modificados. Se preservaron los 30 IDs históricos y se añadió únicamente FE-031 con todos sus campos; la única escritura propia fue este reporte, que continúa sin rastrear.

Limitations: Sin reproducción propia en navegador ni captura visual. El usuario informa que las opciones solo aparecen al pasar el mouse; el código confirma texto blanco sobre fondo blanco y cambio de color en hover. El alcance compartido puede afectar otros roles y el menú móvil, pero no se probaron visualmente. AI_CONTEXT.md contiene datos históricos obsoletos de rutas y pruebas; no se actualizó. Solo se modificó este reporte. Los 30 IDs anteriores se conservan íntegros como históricos, sin afirmar vigencia ni resolución.

## Recommended Order

1. FE-031 — Restablecer contraste del menú lateral sin depender de hover.

## Previous entries not revalidated

Se preservan a continuación el resumen, los checks, las prioridades y las entradas de los lotes anteriores. Sus totales y Status son históricos y no pertenecen a esta revisión.

### Resumen histórico del tercer lote

Area: frontend
Total detected: 10
Confirmed: 10
Probable: 0
Cumulative entries: 30
Previous entries not revalidated: 20 (no incluidas en Total detected ni Confirmed actuales)

Scope: Tercer lote frontend, FE-021 a FE-030, en proyectoFrontend1. HEAD inicial 95a255374f821b0013fcd77776b5ca8171a7012c; HEAD observado al cerrar 68eb1f525e14e336b5892af3dd255d91bcca3f8b, con trabajo ajeno registrado durante el análisis. Se revisaron matrícula/cancelación, listados del docente, indicadores de inicio y protección de páginas por rol. Del backend externo solo se consultaron contratos mínimos de campos, métodos, filtros y forma de respuesta necesarios para demostrar incompatibilidades. No es una auditoría backend ni de DB.

Checks:
- Cwd de todos los comandos: C:/Users/Nat/examen/proyectoFrontend1.
- `git rev-parse --is-inside-work-tree`: código 0, true. `git rev-parse --show-toplevel`: código 0, raíz confirmada.
- `git rev-parse HEAD`: código 0, revisión indicada arriba.
- Estado inicial preservado: modificados .gitignore, package-lock.json, package.json, src/app/api/[...path]/route.ts, src/app/api/auth/login/route.ts y src/lib/server.ts. Sin rastrear .codex/, AI_CONTEXT.md, BUG_REPORT_FRONTEND.md, playwright.config.ts y tests/.
- `git diff --numstat` inicial: .gitignore 8/0; package-lock.json 46/0; package.json 1/0; proxy 2/2; login 2/2; server.ts 2/1. No se leyó el lockfile completo.
- `& './node_modules/.bin/tsc.cmd' --noEmit --incremental false --pretty false`: código 0, sin diagnósticos; timeout 60 segundos, sin emisión ni caché incremental. Usa tsconfig existente, incluidos sus tipos generados .next, no inspeccionados manualmente.
- `& './node_modules/.bin/eslint.cmd' src --no-fix --no-cache`: código 0, timeout 60 segundos; 0 errores y el warning anterior de setDirty en account-forms.tsx:19:17. No se cuenta como detección nueva.
- `node --test tests/backend-routes.test.mjs`: código 0, timeout 30 segundos; 4 comprobaciones pasadas y 0 fallidas. Prueba preexistente inspeccionada completa: lectura/transpilación en memoria, fetch simulado, sin servicios, escritura ni hooks destructivos. Comprueba las nuevas rutas /api/v1, método, cuerpo, query y Authorization; no cubre los diez nuevos bugs ni constituye verificación end-to-end de FE-001.
- Playwright omitido: configuración inicia un servidor persistente y reporter HTML; example.spec.ts visita un sitio externo. Build omitido por escritura de .next y ejecución de páginas. No se instalaron dependencias ni escribieron pruebas nuevas.
- No se ejecutaron solicitudes HTTP reales, procesos persistentes, consultas DB, migraciones, seeds o acciones con datos.
- El estado final cambió por actividad externa: HEAD pasó a 68eb1f5; `git diff 95a255374f821b0013fcd77776b5ca8171a7012c HEAD --stat -- src` mostró cambios en los tres archivos de rutas/server.ts y src/lib/api.ts. No incluyó los archivos que contienen las causas nuevas FE-021 a FE-030. tests/backend-routes.test.mjs sigue existiendo.
- Estado final observado: modificados .gitignore, package-lock.json, package.json y tsconfig.json; sin rastrear .codex/, AI_CONTEXT.md, BUG_REPORT_FRONTEND.md, playwright.config.js y tests/example.spec.ts. `git diff --numstat`: 8/0, 46/0, 1/0 y 1/1 en los cuatro archivos modificados, respectivamente. El agente no realizó el commit, cambios de código, cambio de tsconfig ni sustitución de la configuración Playwright; no se revirtió nada.
- Typecheck/lint y prueba de rutas se obtuvieron antes de ese cambio final de configuración; no se presentaron como validación de todo el estado final. Verificación del reporte: 10 IDs nuevos con todos los campos obligatorios y 20 IDs históricos preservados, sin reutilizar ni renumerar.

Limitations: Los diez bugs nuevos tienen evidencia estática concluyente en los archivos revisados, pero no reproducción visual o end-to-end. Otros errores de los servicios pueden impedir alcanzar los escenarios; las validaciones recomendadas permiten respuestas simuladas. Solo se actualizó este reporte y se preservó trabajo ajeno. El repositorio cambió durante el análisis y los resultados automáticos son una instantánea anterior al último cambio de configuración. AI_CONTEXT.md está obsoleto respecto a pruebas y rutas /api/v1 y no se modificó. Las 20 entradas anteriores se conservan como históricas, no se afirman vigentes ni resueltas; en particular, FE-001 y el cliente relacionado con FE-016 tienen cambios externos. Los 30 IDs acumulados no significan 30 bugs actualmente abiertos.

### Orden recomendado histórico

1. FE-021 — Alinear el cuerpo de alta de matrícula con el contrato de la API.
2. FE-022 — Usar el método de cancelación admitido por el backend.
3. FE-023 — Refrescar la matrícula tras cancelación exitosa; depende de FE-022 para integración real.
4. FE-029 — Aplicar la política de rol a subrutas protegidas, no solo al inicio.
5. FE-024 — Mantener coherencia entre periodo seleccionado y grupos consultados.
6. FE-026 — Corregir el conjunto contado como matrículas activas del periodo.
7. FE-027 — Mostrar el contador de docentes, no el de estudiantes.
8. FE-028 — Consultar indicadores por claves de estado, no etiquetas traducidas.
9. FE-025 — Corregir el orden matriculados/capacidad.
10. FE-030 — Evitar saludo undefined para nombres de una palabra.

Verificar autenticación y conectividad antes de pruebas integradas; la prueba existente de rutas no garantiza que los servicios estén disponibles. No reabrir ni reordenar automáticamente bugs antiguos.

### Entradas históricas de los primeros dos lotes

Entradas FE-001 a FE-020 preservadas del lote anterior, incluidos sus campos Status y evidencia original. Sus estados se refieren al momento de aquel análisis, no a una comprobación vigente. No se cuentan como detecciones actuales ni se declaran resueltas. FE-001 en particular conserva una descripción anterior al cambio de rutas realizado por el usuario; la prueba offline de rutas actual pasa, pero no se ejecutó su validación integrada completa.

Notas históricas preservadas: los dos lotes anteriores usaron TypeScript sin emisión y lint sin autofix, ambos sin errores (un warning de FE-002), y no ejecutaron build, Playwright ni mutaciones reales. El orden recomendado anterior fue FE-001, FE-016, FE-005, FE-017, FE-008, FE-018, FE-003, FE-004, FE-006, FE-012, FE-014, FE-011, FE-019, FE-020, FE-002, FE-009, FE-007, FE-013, FE-010 y FE-015. Es histórico, no la prioridad de este lote.

### FE-001

Severity: high

Status: confirmed

Symptom:
Con BACKEND_URL apuntando al origen del backend NestJS de este proyecto y el backend accesible, el login se envía a /api/auth/login en lugar de /api/v1/auth/login y no alcanza su controller. Las llamadas de páginas server-side y el proxy general presentan la misma incompatibilidad y reciben 404. Si el servidor no es accesible, el error de conexión no demuestra este bug.

Root cause:
POST de login, forward() y apiGet() construyen el prefijo remoto /api sin el segmento /v1 exigido por el contrato global de Nest. Es una única causa de integración duplicada en tres puntos de construcción de URL, no tres bugs distintos.

Evidence:
- src/app/api/auth/login/route.ts:6-14: POST usa `${BACKEND_URL}/api/auth/login`.
- src/app/api/[...path]/route.ts:7-9: forward() construye `${BACKEND_URL}/api/${path.join("/")}` y conserva query string.
- src/lib/server.ts:6,30-38: BACKEND_URL por defecto es el origen local en puerto 3000; apiGet() usa `${BACKEND_URL}/api${path}`.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/main.ts:11 configura `app.setGlobalPrefix('api/v1')` (línea actual revalidada en el segundo lote); src/auth/auth.controller.ts:10,16 define controller auth y POST login. Por composición, la ruta esperada es /api/v1/auth/login.
- Evidencia estática: ninguna de las tres construcciones incorpora /v1; no se hizo petición HTTP ni se inspeccionó lógica interna del backend.

Files involved:
- src/app/api/auth/login/route.ts
- src/app/api/[...path]/route.ts
- src/lib/server.ts

Suggested fix:
Alinear en los tres puntos el prefijo remoto a /api/v1, preferiblemente mediante una construcción compartida. Mantener /api como ruta local del frontend, BACKEND_URL como origen y conservar método, token, cuerpo y query string. No resolverlo agregando indiscriminadamente v1 a todos los paths del navegador ni cambiando el backend dentro de este arreglo frontend.

Validation after fix:
- Desde la raíz, ejecutar `& './node_modules/.bin/tsc.cmd' --noEmit --incremental false --pretty false` y `& './node_modules/.bin/eslint.cmd' src --no-fix --no-cache`.
- En un entorno local explícitamente seguro con puertos distintos, comprobar que login usa /api/v1/auth/login, una página server-side consulta /api/v1/users/me y una llamada del proxy general conserva query y Authorization al reenviar a /api/v1. Resultado esperado: llegan a los endpoints correspondientes, sin 404 por prefijo. Usar credenciales de prueba existentes, sin registrarlas en logs.

### FE-002

Severity: medium

Status: confirmed

Symptom:
En /cuenta, cambiar “Nombre completo” por otro valor no vacío y distinto del nombre actual nunca habilita “Guardar nombre”. El usuario no puede actualizarlo mediante el botón del formulario.

Root cause:
AccountForms inicializa dirty en false y jamás llama a setDirty. El onChange solo actualiza newName, mientras disabled contiene !dirty; esa condición permanece true en todos los renders y bloquea el botón aunque el nuevo nombre sea válido.

Evidence:
- src/app/(app)/cuenta/account-forms.tsx:18-19: estados newName y dirty=false.
- src/app/(app)/cuenta/account-forms.tsx:77-83: onChange llama únicamente a setNewName; disabled evalúa `!dirty || !newName.trim() || newName.trim() === name`.
- src/components/ui/button.tsx:19-22: Button aplica disabled al elemento HTML button; no es solo una apariencia visual.
- src/app/(app)/cuenta/page.tsx:10-15: la página obtiene el usuario y monta AccountForms con el nombre vigente.
- ESLint desde la raíz: warning en account-forms.tsx:19:17 sobre setDirty nunca usado. El fallo funcional se demuestra por la condición siempre verdadera, no por la advertencia aislada.

Files involved:
- src/app/(app)/cuenta/account-forms.tsx
- src/components/ui/button.tsx
- src/app/(app)/cuenta/page.tsx

Suggested fix:
Derivar la condición de cambio comparando el nombre editado normalizado con el nombre vigente, o actualizar dirty coherentemente al editar y guardar. El botón debe estar habilitado para un nombre no vacío y distinto, y permanecer bloqueado mientras guarda. No hace falta modificar Button ni la página; se incluyen como evidencia del flujo.

Validation after fix:
- Desde la raíz, ejecutar `& './node_modules/.bin/eslint.cmd' 'src/app/(app)/cuenta/account-forms.tsx' --no-fix --no-cache` y `& './node_modules/.bin/tsc.cmd' --noEmit --incremental false --pretty false`.
- Después de FE-001, con una cuenta de prueba y entorno seguro: nombre original → botón deshabilitado; nombre distinto no vacío → habilitado; vacío o solo espacios → deshabilitado; restaurar original → deshabilitado. Guardar un nombre válido debe enviar PATCH /api/users/me desde el navegador, persistir el cambio y actualizar la vista. Esta prueba modifica el perfil de prueba y requiere autorización para ejecutarla; no se realizó durante el análisis.

### FE-003

Severity: medium

Status: confirmed

Symptom:
En un listado administrativo filtrado con más de 15 coincidencias, pulsar “Siguiente” conserva los filtros visibles pero consulta la página 2 del listado sin esos filtros. Aparecen registros fuera de la selección y cambia el total mostrado.

Root cause:
ResourceManager.load() agrega filters a URLSearchParams únicamente cuando page === 1. Paginación y filtros no representan el mismo conjunto de datos a partir de la segunda página.

Evidence:
- src/components/admin/resource-manager.tsx:63,112-117: PAGE_SIZE=15; la condición `if (page === 1)` envuelve el agregado de todos los filtros.
- src/components/admin/resource-manager.tsx:146-164,235-245: los filtros siguen en estado y el botón Siguiente incrementa page sin limpiarlos.
- src/components/admin/configs.tsx:257-259: usuarios configura role y active; por ejemplo, page=2 elimina role=docente aunque continúe seleccionado.
- Inconsistencia estática concluyente entre la selección visible y la URL enviada; no requiere que falle TypeScript o lint.

Files involved:
- src/components/admin/resource-manager.tsx
- src/components/admin/configs.tsx
- src/components/admin/operations.tsx

Suggested fix:
Agregar los filtros no vacíos en todas las páginas. Conservar el reinicio a página 1 cuando cambia un filtro y verificar que el total y la paginación correspondan al mismo criterio.

Validation after fix:
En entorno de prueba después de FE-001, usar un filtro con al menos 16 coincidencias. Página 1 y página 2 deben enviar los mismos parámetros de filtro, cambiando solo page. Volver a la primera página debe conservar el conjunto y el total. Para diagnóstico aislado se pueden usar respuestas simuladas; no crear datos durante este análisis.

### FE-004

Severity: medium

Status: confirmed

Symptom:
En /admin/usuarios, abrir “Editar” y, sin tocar ningún campo, pulsar “Cancelar” o la X no cierra el modal. Incluso volver a los valores originales tras editar mantiene el bloqueo.

Root cause:
RecordForm compara JSON.stringify(values), que contiene la representación del formulario obtenida por config.initial(row), con JSON.stringify(row), que es el documento crudo. No compara dos representaciones equivalentes. Un documento con _id siempre difiere del formulario de usuarios sin _id; además, el formulario incluye password vacío. Esto marca dirty=true sin ninguna edición y activa el bloqueo keepOpenIfDirty de closeForm().

Evidence:
- src/components/admin/resource-manager.tsx:293-298: inicializa values con config.initial(row) pero calcula dirty contra row directamente.
- src/components/admin/configs.tsx:249-254,274: usuarios activa keepOpenIfDirty; initial genera name, email, password, role y active, sin _id.
- src/components/admin/resource-manager.tsx:84-88,203,216,260-263: row tiene _id; el dirty calculado llega a la referencia que impide setForm(null).
- src/components/admin/resource-manager.tsx:413-415 y src/components/ui/modal.tsx:31: tanto Cancelar como X llaman al mismo onClose bloqueado.
- Evidencia estática: las formas de los dos objetos son distintas aun antes de editar; se agrupan todos los bloqueos derivados en una sola causa.

Files involved:
- src/components/admin/resource-manager.tsx
- src/components/admin/configs.tsx
- src/components/ui/modal.tsx

Suggested fix:
Comparar values con la misma representación inicial del registro, no con el documento API crudo. La apertura sin cambios y la reversión al estado original deben producir dirty=false. Revisar aparte la experiencia de descarte para cambios reales, sin convertirla en otro bug de este lote.

Validation after fix:
En /admin/usuarios: abrir edición y cancelar inmediatamente; debe cerrarse. Reabrir, editar y restaurar exactamente el valor original; debe permitir cerrar. La comparación debe ignorar campos del documento que no forman parte del formulario. No guardar ni modificar usuarios para esta verificación.

### FE-005

Severity: medium

Status: confirmed

Symptom:
El formulario administrativo permite intentar crear un programa con “Créditos del programa” igual a 0 o negativo, pese a min=1. Envía un cuerpo inválido y deja al usuario descubrir el error en la API. Lo mismo sucede con límites configurados de otros campos numéricos del formulario compartido.

Root cause:
RecordForm usa noValidate y su única condición missing comprueba campos vacíos, no rangos o validez numérica. Aunque Field recibe min y max, el navegador no ejecuta validación al enviar y submit tampoco valida los valores. La configuración de límites existe pero no se aplica al guardado.

Evidence:
- src/components/admin/resource-manager.tsx:327-330: missing considera 0 representado como "0" o negativos como valores presentes y válidos para habilitar el botón.
- src/components/admin/resource-manager.tsx:333-340,349,403-405,417: submit envía el cuerpo sin verificar min/max; formulario con noValidate.
- src/components/admin/configs.tsx:77-85: totalCredits tiene min=1; toBody convierte mediante Number, enviando 0 cuando se introduce "0".
- src/components/ui/field.tsx:21-33: Field transmite atributos al input; no realiza validación personalizada.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/programs/dto/program.dto.ts:18-21 exige totalCredits entero y >=1. La incompatibilidad del cuerpo es comprobable estáticamente; no se enviaron altas inválidas.

Files involved:
- src/components/admin/resource-manager.tsx
- src/components/admin/configs.tsx
- src/components/ui/field.tsx

Suggested fix:
Aplicar las restricciones configuradas antes de construir/enviar el cuerpo, con errores por campo, o habilitar una validación nativa compatible y comprobarla en submit. No confiar únicamente en deshabilitar el botón: proteger también la vía de envío por teclado. No agrupar aquí otras reglas de negocio no verificadas.

Validation after fix:
Desde la raíz ejecutar el typecheck sin emisión documentado en Summary. Con respuestas simuladas o entorno local seguro, introducir 0 y -1 en créditos: deben mostrarse errores y no enviarse POST. Con 1 y demás campos válidos debe permitir continuar. Verificar un campo con max definido, como créditos de materia=11 con max=10, sin persistir datos reales.

### FE-006

Severity: medium

Status: confirmed

Symptom:
En “Nueva materia”, elegir un programa A y un prerrequisito de A, luego cambiar a un programa B, oculta la selección anterior pero conserva su ID. Crear envía el programa B junto con el prerrequisito invisible de A; el usuario ya no dispone de su casilla para quitarlo.

Root cause:
RecordForm cambia únicamente el campo program y recarga las opciones de prerequisites, sin limpiar o reconciliar values.prerequisites. El contenido enviado depende del estado elegido antiguo, no de las opciones actualmente visibles para el nuevo programa.

Evidence:
- src/components/admin/configs.tsx:114-121: prerrequisitos dependen de program; la ayuda especifica materias del mismo programa.
- src/components/admin/resource-manager.tsx:304,307-325,362-364: cambiar program actualiza solo ese valor; el efecto reemplaza dynamic, no values.prerequisites.
- src/components/admin/resource-manager.tsx:369-390: solo se dibujan opciones del nuevo resultado; chosen conserva los IDs anteriores, que no se muestran si ya no están en options.
- src/components/admin/configs.tsx:138-140: toBody envía program nuevo y prerequisites antiguo íntegro.
- Inconsistencia estática de estado y payload; no se afirma que el backend acepte o persista la relación incompatible, comportamiento no comprobado.

Files involved:
- src/components/admin/resource-manager.tsx
- src/components/admin/configs.tsx
- src/app/(app)/admin/materias/page.tsx

Suggested fix:
Al cambiar la dependencia, limpiar o reconciliar la selección del multiselect contra las opciones válidas del programa nuevo. Mantener explícita la política si existen selecciones inválidas, evitando mandar IDs ocultos sin aviso. No borrar selecciones legítimas al cargar por primera vez una edición.

Validation after fix:
Con programas y materias de prueba ya existentes: seleccionar A y un prerrequisito de A; cambiar a B y esperar las opciones. No debe quedar seleccionado ni enviarse el ID oculto de A. Reabrir una materia existente debe conservar y mostrar sus prerrequisitos válidos. Puede comprobarse el cuerpo mediante respuesta simulada, sin crear materias.

### FE-007

Severity: low

Status: confirmed

Symptom:
En las evaluaciones de un grupo, un plan que suma 60% muestra “Te pasaste 40%”; uno que suma 120% muestra “Faltan 20%”. El indicador informa la acción contraria a la necesaria para completar el plan.

Root cause:
EvaluationsPanel define remaining=total-100, pero la rama de texto interpreta remaining positivo como porcentaje faltante y negativo como exceso. Se invirtió el signo de la diferencia respecto al contrato de las ramas.

Evidence:
- src/app/(app)/docente/grupos/[id]/evaluations-panel.tsx:43-44: total es la suma de pesos y remaining=total-100.
- Mismo archivo:176-177: positivo → Faltan; negativo → Te pasaste con el valor negado.
- Cálculo estático: 60-100=-40 produce “Te pasaste 40%”; 120-100=20 produce “Faltan 20%”. La rama total===100 no está afectada.

Files involved:
- src/app/(app)/docente/grupos/[id]/evaluations-panel.tsx

Suggested fix:
Hacer consistente la diferencia y las ramas: usar 100-total como restante, o invertir la interpretación del signo en el mensaje. Conservar la indicación especial de plan completo.

Validation after fix:
En la pestaña evaluaciones, usar datos sintéticos con totales 0, 60, 100 y 120. Resultado: Faltan 100%, Faltan 40%, El plan está completo y Te pasaste 20%, respectivamente. No es necesario crear evaluaciones reales para probar el cálculo.

### FE-008

Severity: medium

Status: confirmed

Symptom:
Con una nota guardada, borrar todo su contenido deja la celda visualmente vacía, pero no se cuenta como cambio pendiente. “Guardar cambios” puede seguir deshabilitado y “Finalizar grupo” puede habilitarse usando los valores guardados aunque la planilla muestre una nota en blanco. Al guardar otra celda, el borrado no se envía y su draft también se descarta.

Root cause:
El cálculo de changes ignora cualquier draft vacío o con solo espacios, sin distinguirlo de la ausencia de edición. La representación del input sí usa ese draft vacío. unsaved se deriva exclusivamente de changes y deja de proteger la finalización, creando discrepancia entre lo visible y lo persistido.

Evidence:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx:55-60: text.trim()==="" hace continue, aunque row.grades contenga una nota numérica guardada.
- Mismo archivo:164-176: value usa draft antes que saved; un draft="" muestra una celda vacía.
- Mismo archivo:73-76,114-115,215,234: el borrado no forma parte del cuerpo, unsaved=false si no hay otros cambios y no bloquea finalizar; un guardado exitoso de otras notas limpia los drafts no fallidos.
- Condición concreta: fila activa, periodo editable, plan completo, summary.readyToFinalize>0 y nota previamente guardada; al vaciarla, la interfaz y la protección de pendientes divergen. No se ejecutó finalización.

Files involved:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx

Suggested fix:
Distinguir sin draft de draft vacío que difiere de una nota guardada. Si el contrato no permite borrar notas, mostrar el vacío como modificación inválida y bloquear guardar/finalizar o restaurar explícitamente el valor con aviso. Si permite borrado, usar el contrato correspondiente; no inventar una operación ni enviar null sin verificarla.

Validation after fix:
Con planilla sintética lista para finalizar y nota guardada=4: borrar la celda debe producir un pendiente o error y bloquear finalizar, sin fingir que la nota persistida desapareció. Restaurar 4 debe limpiar el pendiente. Cambiar otra celda y guardar no debe descartar silenciosamente el borrado. No ejecutar POST finalize sobre datos reales.

### FE-009

Severity: medium

Status: confirmed

Symptom:
En listados administrativos con datos y una pantalla estrecha, las columnas derechas y los botones de acciones quedan recortados y no hay desplazamiento horizontal para alcanzarlos. El usuario móvil pierde acceso a editar u operar registros.

Root cause:
ResourceManager coloca una tabla con ancho mínimo 40rem dentro de un Card con overflow-hidden, pero el div envolvente no tiene overflow-x-auto. Cuando el contenedor es más estrecho que la tabla, el excedente se recorta en vez de ofrecer scroll.

Evidence:
- src/components/admin/resource-manager.tsx:186-188: Card overflow-hidden, div sin clase de scroll y table min-w-[40rem].
- Mismo archivo:209-224: la columna Acciones se encuentra a la derecha, en la zona afectada al reducir el ancho.
- src/components/ui/card.tsx:4-5 y src/lib/cn.ts:2-3: las clases se transmiten al div; no se añade scroll ni se elimina overflow-hidden.
- src/components/app-shell.tsx:153-154: main con min-w-0, padding horizontal y contenedor de ancho disponible; un viewport de 375px es menor que 40rem con tamaño de fuente normal.
- src/app/globals.css:1,43-65: Tailwind importado; no hay regla global que agregue scroll al contenedor. Confirmación por estructura y reglas CSS, sin captura en navegador.
- Comparación local: grade-sheet-panel.tsx:136-138 usa correctamente overflow-x-auto dentro del Card, evitando el recorte equivalente.

Files involved:
- src/components/admin/resource-manager.tsx
- src/components/ui/card.tsx
- src/components/app-shell.tsx

Suggested fix:
Agregar desplazamiento horizontal en el envolvente de la tabla o una presentación responsiva equivalente. Mantener el borde redondeado del Card sin recortar el acceso a las acciones.

Validation after fix:
Con respuestas de listado simuladas o entorno local seguro, abrir un manager en viewport de 375px y 768px. Todas las columnas y acciones deben poder alcanzarse por scroll o layout responsivo, sin ensanchar la página completa. Verificar también ancho de escritorio; no es necesario editar datos.

### FE-010

Severity: low

Status: confirmed

Symptom:
Escribir una nota decimal como “3,5” en la planilla la marca inválida y bloquea guardar, mientras “3.5” se acepta. Contradice la aceptación de coma o punto prevista por el propio parser y dificulta el uso del teclado decimal en configuraciones con coma.

Root cause:
parse() solo hace trim y acepta un punto literal en la expresión regular; no normaliza coma a punto antes de comprobar y convertir. Number() tampoco acepta “3,5”.

Evidence:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx:17: el formato previsto se documenta como “acepta coma o punto”.
- Mismo archivo:18-22: la regex exige `\.` y el valor se convierte con Number sin normalización; parse("3,5")=null, parse("3.5")=3.5.
- Mismo archivo:58,66,166,171-173,215-218: ese resultado activa aria-invalid, la lista de notas inválidas y el bloqueo de guardar; el input usa inputMode=decimal.
- No es una advertencia de estilo: una entrada decimal prevista es rechazada. La reproducción en dispositivos concretos queda pendiente; el rechazo del string es concluyente.

Files involved:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx

Suggested fix:
Normalizar el separador decimal admitido antes de validar y convertir, conservando rango 0-5 y máximo dos decimales. No aceptar separadores múltiples ni interpretarlos como miles.

Validation after fix:
Comprobar con entradas sintéticas: “3,5” y “3.5” → 3.5; “0,25” → 0.25; “5,00” → 5; “5,01”, “3,555” y “3,5,1” → inválidas. En planilla con respuestas simuladas, una nota válida con coma debe habilitar el guardado y producir un número en el cuerpo HTTP, no un string con coma.

### FE-011

Severity: medium

Status: confirmed

Symptom:
Una clase cuyo day es sabado aparece dentro de la tarjeta “Viernes”, y “Sábado” informa “Sin clases”. Afecta tanto al horario del estudiante como al del docente.

Root cause:
WeekSchedule agrupa días mediante Math.min(DAYS.indexOf(d), 4) en vez de consultar byDay[day]. El índice de sábado, 5, se reduce a 4, por lo que sus franjas se incorporan al viernes y nunca a la columna 5.

Evidence:
- src/components/week-schedule.tsx:13-18: recorre los días con col y obtiene slots mediante el índice limitado a 4; el encabezado sigue usando el día original.
- src/lib/format.ts:3,10-11: DAYS contiene viernes en índice 4 y sabado en índice 5, con etiquetas distintas.
- src/app/(app)/estudiante/horario/page.tsx:36-39 y src/app/(app)/docente/horario/page.tsx:35-38: ambos consumen WeekSchedule con byDay.
- Evaluación estática para d=sabado: Math.min(5,4)=4; ninguna franja puede satisfacer col=5.

Files involved:
- src/components/week-schedule.tsx
- src/lib/format.ts
- src/app/(app)/estudiante/horario/page.tsx
- src/app/(app)/docente/horario/page.tsx

Suggested fix:
Usar las franjas del día de la tarjeta sin limitar el índice a viernes. Conservar sábado, admitido por los tipos y por la edición de horarios administrativos.

Validation after fix:
Con byDay sintético que tenga una franja exclusiva de viernes y otra exclusiva de sábado, cada tarjeta debe mostrar únicamente su día; ninguna debe duplicarse o desaparecer. Comprobar las dos pantallas consumidoras con respuestas simuladas, sin crear grupos.

### FE-012

Severity: medium

Status: confirmed

Symptom:
En /estudiante/notas, una materia sin nota final publicada y con evaluaciones de pesos diferentes muestra un “Acumulado” incorrecto. Con notas 5 al 20% y 1 al 80%, muestra 3.00 pese a que el resultado ponderado completo es 1.80.

Root cause:
GradesPage calcula points como media aritmética de las notas registradas, ignorando ev.weight, aunque presenta un acumulado de evaluaciones ponderadas por porcentaje. El peso solo se suma para indicar cuánto está evaluado, no para calcular la nota.

Evidence:
- src/app/(app)/estudiante/notas/page.tsx:37-41: points suma valores y divide por graded.length; evaluated suma weights por separado.
- Mismo archivo:71-74,83-93: muestra peso por evaluación y utiliza points como acumulado cuando e.finalGrade es undefined.
- src/lib/types.ts:94-105: Evaluation y MyGrade incluyen weight; la información necesaria para ponderar está disponible.
- Ejemplo concluyente con 100% evaluado: (5+1)/2=3.00 frente a 5*0.20+1*0.80=1.80. Usar un plan completo evita ambigüedad sobre cómo presentar evaluaciones aún pendientes.

Files involved:
- src/app/(app)/estudiante/notas/page.tsx
- src/lib/types.ts

Suggested fix:
Calcular el acumulado con los pesos de las evaluaciones, en la misma escala y con la misma semántica que la planilla académica. Definir explícitamente el tratamiento de porcentajes pendientes sin reemplazar la ponderación por una media simple.

Validation after fix:
Con respuestas sintéticas: 5 al 20% + 1 al 80% debe mostrar 1.80 antes de finalizar; 4 al 50% + 2 al 50% debe mostrar 3.00. Verificar también una nota igual a 0 y evaluaciones pendientes. No finalizar matrículas ni modificar notas reales.

### FE-013

Severity: low

Status: confirmed

Symptom:
En la tabla “Mis notas”, una evaluación con nota exactamente 3.0 se pinta con el color de peligro, pese a que la misma página anuncia que se aprueba con 3.0 o más. La nota final 3.0 sí se pinta como aprobatoria, creando contradicción visual.

Root cause:
GradesPage usa value <= PASSING para el color desaprobatorio de notas parciales, incluyendo incorrectamente el umbral de aprobación. La condición de nota final sí usa < PASSING.

Evidence:
- src/app/(app)/estudiante/notas/page.tsx:12,30: PASSING=3.0 y texto “Se aprueba con 3.0 o más”.
- Mismo archivo:73: value=3.0 cumple <= y recibe text-danger-600.
- Mismo archivo:86: e.finalGrade=3.0 no cumple < y recibe text-success-600.
- No depende del formatter o de FE-012: basta un valor numérico exactamente igual al umbral.

Files involved:
- src/app/(app)/estudiante/notas/page.tsx

Suggested fix:
Usar la misma comparación estricta de desaprobación (<3.0) en notas parciales y finales. Mantener el estilo de pendientes separado.

Validation after fix:
Renderizar valores sintéticos 2.99, 3.0 y 3.01: peligro, éxito y éxito respectivamente, sin cambiar la regla a partir de un valor redondeado. Verificar coherencia entre filas y nota final.

### FE-014

Severity: medium

Status: confirmed

Symptom:
Una matrícula con status=reprobada se muestra como “Aprobada” en historial, notas, planilla docente y administración, aunque el tono sea de peligro. La interfaz comunica un resultado académico opuesto al estado recibido.

Root cause:
La constante compartida STATUS_LABEL asigna a reprobada el texto “Aprobada”, igual que a aprobada. Los consumidores confían directamente en ese mapa para su etiqueta.

Evidence:
- src/lib/format.ts:22-26: aprobada y reprobada comparten la etiqueta “Aprobada”.
- src/lib/format.ts:29-33: el mapa de tonos sí distingue reprobada como danger, confirmando la contradicción de presentación.
- src/app/(app)/estudiante/historial/page.tsx:77-78, src/app/(app)/estudiante/notas/page.tsx:53 y src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx:198: usan STATUS_LABEL[status].
- src/components/admin/operations.tsx:329: el listado administrativo de matrículas también usa el mapa. Se cuenta una sola causa compartida, no un bug por consumidor.

Files involved:
- src/lib/format.ts
- src/app/(app)/estudiante/historial/page.tsx
- src/app/(app)/estudiante/notas/page.tsx
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx
- src/components/admin/operations.tsx

Suggested fix:
Asignar “Reprobada” al estado reprobada, manteniendo sin cambios el estado de la API y su tono. No modificar resultados académicos en la base de datos para compensar un error de etiqueta.

Validation after fix:
Mostrar los cuatro estados con datos sintéticos: activa → En curso, aprobada → Aprobada, reprobada → Reprobada y cancelada → Cancelada. Comprobar al menos historial y planilla, que usan el mismo mapa.

### FE-015

Severity: low

Status: confirmed

Symptom:
Los horarios semanales muestran “Lrrrrunes” como encabezado del lunes, incluso cuando ese día no tiene clases.

Root cause:
DAY_LABEL.lunes contiene un texto corrupto en el diccionario compartido. WeekSchedule lo renderiza directamente como título, sin otra transformación.

Evidence:
- src/lib/format.ts:5-6: lunes está asignado a “Lrrrrunes”.
- src/components/week-schedule.tsx:13,18: se crea la tarjeta para cada día y se imprime DAY_LABEL[day].
- Los consumidores verificados son los horarios de estudiante y docente. Es un defecto visual observable, no una advertencia de estilo ni un problema de agrupación como FE-011.

Files involved:
- src/lib/format.ts
- src/components/week-schedule.tsx

Suggested fix:
Restaurar la etiqueta “Lunes” sin cambiar la clave lunes usada por contratos y horarios.

Validation after fix:
Mostrar el horario con todas las listas vacías: sus encabezados deben ser Lunes, Martes, Miércoles, Jueves, Viernes y Sábado. Verificar también con clases cargadas.

### FE-016

Severity: medium

Status: confirmed

Symptom:
Con la ruta de login corregida o una respuesta simulada, introducir credenciales incorrectas que producen 401 provoca navegación completa a /login?expired=1. Se pierden los campos introducidos y se informa que la sesión venció, en lugar de mostrar el error de credenciales.

Root cause:
api() aplica la política global de sesión vencida a cualquier 401, incluida la solicitud pública /auth/login. Redirige antes de leer el mensaje de la respuesta, sin distinguir un intento de autenticación fallido de la expiración de una sesión existente.

Evidence:
- src/app/login/login-form.tsx:18-28: LoginForm usa api('/auth/login') y espera mostrar el error en el formulario; :34 muestra el aviso de sesión vencida cuando expired=true.
- src/lib/api.ts:31-41: todo 401 asigna window.location.href y lanza “Sesion vencida” antes de leer el cuerpo.
- src/app/api/auth/login/route.ts:19-21: conserva el código de fallo y el mensaje del backend.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/auth/auth.service.ts:17,24 identifica login y UnauthorizedException('Credenciales invalidas'); src/common/filters/all-exceptions.filter.ts:36,44-51 conserva el status HTTP de la excepción.
- La reproducción integrada requiere FE-001; el manejo incorrecto de una respuesta 401 del login es verificable independientemente de ese prefijo.

Files involved:
- src/lib/api.ts
- src/app/login/login-form.tsx
- src/app/api/auth/login/route.ts

Suggested fix:
Excluir el login público de la redirección por expiración o usar una política explícita por llamada. Para credenciales incorrectas, conservar el formulario y mostrar el mensaje de autenticación; mantener la redirección para 401 de recursos protegidos.

Validation after fix:
Con respuestas simuladas: POST /api/auth/login → 401 debe mostrar el error de credenciales sin recargar ni añadir expired=1. GET de un recurso protegido → 401 debe seguir cerrando la sesión visual y dirigir al login. No hacer intentos repetidos contra cuentas reales.

### FE-017

Severity: high

Status: confirmed

Symptom:
En la planilla docente, pulsar Guardar y editar otra celda mientras la solicitud está pendiente hace que esa nueva edición desaparezca al llegar una respuesta exitosa. También se pierde una modificación posterior de una celda que ya estaba en el envío. La interfaz anuncia notas guardadas aunque esas ediciones posteriores nunca se enviaron.

Root cause:
save() captura changes para construir items, pero al responder filtra el estado actual de drafts conservando únicamente failedKeys de aquella solicitud. Si failed=[] elimina todos los drafts actuales, incluidos los creados después del envío. La tabla sigue editable durante saving y no hay reconciliación con la instantánea enviada.

Evidence:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx:68-76: items deriva de la instantánea capturada; setDrafts recibe el estado más reciente y lo filtra por fallos del envío anterior.
- Mismo archivo:155,169-180: editable depende solo de readOnly y status; el input no se deshabilita por saving y onChange continúa agregando drafts.
- Mismo archivo:77-82: se informa éxito y se recarga la planilla persistida, que no contiene las modificaciones posteriores.
- Secuencia concluyente: enviar cambio A; crear draft B antes de responder; respuesta failed=[] → failedKeys vacío → filtro elimina también B, aunque no estuviera en items. No se provocó esta carrera en un servicio real.

Files involved:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx

Suggested fix:
Eliminar únicamente drafts de cambios enviados y exitosos cuyo valor siga coincidiendo con la instantánea, preservando ediciones nuevas. Alternativamente bloquear de manera coherente toda edición mientras guarda. Evitar usar el éxito de un lote para descartar el estado actual completo.

Validation after fix:
Con respuesta PUT /grades/bulk demorada y simulada: enviar A, editar B y resolver éxito de A. B debe seguir pendiente o no debe haber podido editarse mientras guardaba. Repetir cambiando nuevamente A durante el envío y con éxito parcial. No registrar notas reales para reproducirlo.

### FE-018

Severity: high

Status: confirmed

Symptom:
En una planilla lista para finalizar, abrir la confirmación y después editar una nota permite pulsar “Confirmar” sin guardar la nueva edición. Se inicia una operación anunciada como irreversible usando las notas persistidas, no las que el docente ve editadas.

Root cause:
La comprobación de unsaved, ready y planComplete existe solo en el botón que abre la confirmación. Una vez confirming=true, el botón Confirmar no vuelve a evaluar esas precondiciones y finalize() tampoco las verifica. Los inputs permanecen editables, por lo que el estado válido inicial puede quedar invalidado antes de confirmar.

Evidence:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx:221-234: botón inicial con disabled por unsaved/ready/plan; Confirmar solo usa loading y onClick.
- Mismo archivo:155,169-176: se puede editar después de abrir la confirmación, creando un draft no vacío y detectado en changes.
- Mismo archivo:90-96: finalize() hace POST directo sin revisar cambios pendientes; no transmite los drafts.
- Escenario concreto: nota guardada 4, plan completo, ready>0, sin pendientes; abrir confirmación, cambiar a 2 y confirmar. Este defecto persiste aunque se corrijan FE-008 y FE-017: no usa un borrado vacío ni un guardado en curso.

Files involved:
- src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx

Suggested fix:
Revalidar las precondiciones al confirmar y dentro del handler, cerrar o invalidar la confirmación cuando aparezcan cambios pendientes, o bloquear edición durante la confirmación. La finalización no debe continuar con una vista de notas distinta de lo guardado sin aviso y aceptación explícitos.

Validation after fix:
Con planilla y respuestas simuladas: abrir confirmación, modificar una nota válida y verificar que no se envía POST finalize hasta resolver el pendiente. Repetir con nota inválida. Sin cambios, debe permitir confirmar una única vez. No ejecutar finalizaciones reales durante el diagnóstico.

### FE-019

Severity: medium

Status: confirmed

Symptom:
En “Sin leer”, con 16 notificaciones y página 2, marcar como leída su único elemento puede dejar una página vacía que dice “No tienes notificaciones sin leer”, aunque quedan 15. Desaparece la paginación, impidiendo volver mediante “Anterior”; como alternativa hay que volver a pulsar el filtro para reiniciar la página.

Root cause:
markRead() recarga la misma page después de quitar un elemento del conjunto filtrado. No ajusta page si disminuye totalPages. El estado vacío se basa exclusivamente en data.length y los controles se ocultan si totalPages<=1, sin distinguir una página fuera de rango de un conjunto realmente vacío.

Evidence:
- src/app/(app)/notificaciones/notification-list.tsx:22,28-40,47-49: LIMIT=15, page persistida y recarga después de marcar sin reinicio ni acotación.
- Mismo archivo:89-90,120-131: data=[] muestra ausencia total; totalPages=1 oculta incluso Anterior aunque page siga siendo 2.
- Mismo archivo:70-72: pulsar un filtro sí reinicia page, explicando la alternativa de recuperación.
- Respuesta coherente que activa el fallo tras la marca: data=[], meta.page=2, meta.total=15, meta.totalPages=1 y unread=15. El cliente la acepta y muestra el estado vacío engañoso. No se consumieron notificaciones reales.

Files involved:
- src/app/(app)/notificaciones/notification-list.tsx

Suggested fix:
Reubicar la página al reducirse el conjunto filtrado, o volver a consultar la última página válida. Mostrar “sin notificaciones” solo cuando el total del conjunto sea cero; no ocultar la recuperación de una página fuera de rango.

Validation after fix:
Simular 16 notificaciones sin leer, pasar a página 2 y marcar la única allí. Debe volver a una página válida que muestre las 15 restantes, con contador coherente y sin mensaje de ausencia. Probar también el caso de una sola notificación, donde el vacío sí es correcto.

### FE-020

Severity: medium

Status: confirmed

Symptom:
Si falla “Marcar leída” o “Marcar todas como leídas”, la interfaz no comunica el error de la acción. Si la recarga posterior funciona, simplemente muestra otra vez los elementos sin leer, dejando al usuario sin explicación del fallo.

Root cause:
markRead() y markAll() convierten todo rechazo de la mutación en undefined mediante catch vacío y luego llaman load(). La carga exitosa hace setError(null), por lo que no existe una vía de mostrar el error original de la acción.

Evidence:
- src/app/(app)/notificaciones/notification-list.tsx:47-54: ambas mutaciones usan `.catch(() => undefined)` y recargan sin distinguir éxito/fallo.
- Mismo archivo:33-38: load() solo registra errores de lectura y los limpia al tener éxito.
- Mismo archivo:84-85,109-111: los botones ejecutan estos handlers; no reciben resultado, aviso ni estado de fallo.
- Escenario concreto: PATCH responde 500 o rechaza por red, seguido de GET 200 con datos sin cambiar. El rechazo se absorbe y no llega a ningún mensaje visible. No se atribuye la causa del fallo HTTP al backend como otro bug.

Files involved:
- src/app/(app)/notificaciones/notification-list.tsx

Suggested fix:
Capturar y mostrar los errores de la mutación con un estado independiente o una gestión que no borre el aviso durante la recarga. Recargar como éxito solo cuando proceda y permitir reintento con información clara.

Validation after fix:
Simular PATCH fallido y GET exitoso para las dos acciones: el aviso debe permanecer visible, los elementos seguir sin leer y debe poder reintentarse. Con PATCH exitoso, actualizar lista y contador sin aviso de error. No ejecutar mutaciones sobre notificaciones reales.

### Entradas históricas del tercer lote

### FE-021

Severity: high

Status: confirmed

Symptom:
Al intentar matricular un grupo desde la pantalla del estudiante o desde administración, el cuerpo enviado no cumple el DTO de creación: envía group y omite groupId. Con la validación global activa, el alta se rechaza antes de completar la matrícula.

Root cause:
EnrollView.enroll() y la configuración administrativa enrollments.toBody() usan el nombre local group como clave HTTP, pero el contrato CreateEnrollmentDto declara groupId obligatorio. La validación rechaza además propiedades no declaradas. Ambos consumidores tienen una misma incompatibilidad de payload, no dos bugs separados.

Evidence:
- src/app/(app)/estudiante/matricula/enroll-view.tsx:46-50: POST /enrollments con `{ group: g.group }`.
- src/components/admin/operations.tsx:331-336: el selector se llama group y toBody envía `{ student, group }`.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/enrollments/dto/enrollment.dto.ts:6-14 declara groupId con IsMongoId, sin IsOptional; student sí es opcional.
- Contrato externo: src/main.ts:12-17 activa whitelist y forbidNonWhitelisted; src/enrollments/enrollments.service.ts:56 consume dto.groupId, confirmando que no es solo un cambio de nombre en Swagger.
- Evidencia estática concluyente: ningún cuerpo aporta groupId y ambos añaden group no admitido. No se intentaron matrículas reales.

Files involved:
- src/app/(app)/estudiante/matricula/enroll-view.tsx
- src/components/admin/operations.tsx

Suggested fix:
Traducir la selección local de grupo a groupId al construir el cuerpo en ambos consumidores. Mantener student para el flujo administrativo y no enviar group como campo adicional. No renombrar campos del backend para compensar este contrato frontend.

Validation after fix:
Con respuestas simuladas, seleccionar un grupo con ID válido y verificar POST /api/enrollments: estudiante → `{ groupId }`; administración → `{ student, groupId }`. Deben conservarse los IDs completos y no aparecer group. Una prueba integrada con autorización en entorno local seguro debe superar la validación de DTO, sin usar producción ni matricular cuentas reales.

### FE-022

Severity: medium

Status: confirmed

Symptom:
Confirmar la cancelación de una matrícula envía PATCH a una ruta cuya operación registrada es POST. El backend no encuentra ese método/ruta y no cancela la matrícula, tanto desde estudiante como desde administración.

Root cause:
CancelButton.cancel() y la acción administrativa de cancelación usan PATCH para /enrollments/:id/cancel, en desacuerdo con el método del controller. El proxy actual conserva el método, por lo que no convierte PATCH en POST.

Evidence:
- src/app/(app)/estudiante/materias/cancel-button.tsx:13-17: api(.../cancel, method PATCH).
- src/components/admin/operations.tsx:337-347: run administrativo también usa PATCH para la misma acción.
- src/app/api/[...path]/route.ts:15-16: forward transmite request.method.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/enrollments/enrollments.controller.ts:47-51 registra Post(':id/cancel'), con acceso administrativo y de estudiante.
- Incompatibilidad estática de método; no se hicieron peticiones que cancelaran datos.

Files involved:
- src/app/(app)/estudiante/materias/cancel-button.tsx
- src/components/admin/operations.tsx
- src/app/api/[...path]/route.ts

Suggested fix:
Usar POST en las dos llamadas a la acción de cancelación según el contrato actual. No cambiar genéricamente PATCH en el proxy ni alterar otros endpoints de edición.

Validation after fix:
Interceptar las dos llamadas mediante respuestas simuladas: deben ser POST a /api/enrollments/:id/cancel y conservar el ID. Comprobar manejo de 200 y de error sin modificar matrículas reales. La comprobación integrada requiere autorización específica por ser una mutación.

### FE-023

Severity: medium

Status: confirmed

Symptom:
Tras una cancelación exitosa desde “Mis materias”, la tarjeta sigue mostrando el estado previo de matrícula activa y el botón para cancelarla otra vez. Solo una recarga o navegación obtiene el estado cancelado.

Root cause:
CancelButton.cancel() solo cierra su confirmación y limpia loading tras el éxito. No refresca los datos server-side de la página ni notifica al padre para actualizar la matrícula. El estado del registro y su etiqueta provienen de props que permanecen iguales.

Evidence:
- src/app/(app)/estudiante/materias/cancel-button.tsx:13-19: tras await api solo ejecuta setConfirming(false) y setLoading(false); no usa router.refresh ni callback de actualización.
- Mismo archivo:8,26-30: recibe únicamente id/name y vuelve a dibujar Cancelar al cerrar la confirmación.
- src/app/(app)/estudiante/materias/page.tsx:13-14,57-58: estado y presencia del botón dependen de la consulta server-side inicial y e.status.
- La condición de reproducción es una respuesta exitosa simulada o FE-022 corregido. No es el síntoma del método erróneo: se verifica específicamente después de éxito.

Files involved:
- src/app/(app)/estudiante/materias/cancel-button.tsx
- src/app/(app)/estudiante/materias/page.tsx

Suggested fix:
Refrescar la página server-side después de éxito o actualizar el registro mediante un mecanismo de estado coherente. Eliminar la acción de cancelación cuando el registro ya está cancelado y mostrar el nuevo estado.

Validation after fix:
Simular matrícula activa, acción de cancelación exitosa y consulta posterior con status=cancelada. La tarjeta debe actualizarse sin recarga manual y dejar de ofrecer Cancelar. Ante un fallo, conservar el registro activo y mostrar el error. Integración real después de FE-022, solo con datos de prueba autorizados.

### FE-024

Severity: medium

Status: confirmed

Symptom:
Entrar directamente a /docente/grupos sin query period muestra el periodo abierto seleccionado, pero consulta todos los periodos. Pueden aparecer grupos históricos bajo un selector que indica únicamente el periodo actual.

Root cause:
MyGroupsPage calcula selected usando current._id cuando falta period, pero añade el filtro HTTP solo si requested ya era un string en la URL. El valor por defecto se usa en el selector y no en la consulta, desacoplando filtro visible y datos.

Evidence:
- src/app/(app)/docente/grupos/page.tsx:17-21: selected adopta current._id; la interpolación del filtro exige typeof requested === 'string'.
- Mismo archivo:28: PeriodSelect recibe selected aunque la consulta no haya añadido &period.
- src/app/(app)/docente/grupos/period-select.tsx:11-18: refleja el ID seleccionado y ofrece Todos como opción distinta.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/groups/groups.service.ts:64-66,84-86 filtra por periodo únicamente cuando query.period está presente; no aplica el periodo actual automáticamente.
- Caso concreto: periodo abierto P, requested=undefined → selector=P, URL /groups/mine?limit=100 sin period.

Files involved:
- src/app/(app)/docente/grupos/page.tsx
- src/app/(app)/docente/grupos/period-select.tsx

Suggested fix:
Construir la consulta a partir del periodo efectivo seleccionado, incluyendo el valor por defecto. Omitir el filtro solo para Todos o cuando realmente no haya periodo seleccionado.

Validation after fix:
Con respuestas simuladas y periodo abierto P: URL sin query debe consultar period=P y mostrar P; period=todos debe omitir el filtro; period=Q debe consultar y seleccionar Q. Sin periodo abierto, Todos puede ser el valor por defecto.

### FE-025

Severity: low

Status: confirmed

Symptom:
Las tarjetas de “Mis grupos” muestran la capacidad antes del número matriculado. Un grupo con 8 estudiantes y 30 cupos aparece como “30 / 8 estudiantes”, sugiriendo una ocupación invertida o superior al cupo.

Root cause:
MyGroupsPage interpola g.capacity como numerador y g.enrolled como denominador en el indicador de estudiantes, contrario al significado matriculados/capacidad usado en el resto de pantallas.

Evidence:
- src/app/(app)/docente/grupos/page.tsx:49-53: muestra `{g.capacity} / {g.enrolled} estudiantes`.
- src/lib/types.ts:157-161 distingue las propiedades capacity y enrolled de TeacherGroup.
- src/app/(app)/docente/grupos/[id]/page.tsx:50-52 usa enrolled / capacity para el mismo grupo; src/components/admin/operations.tsx:244 usa el orden correcto en Cupos.
- Comparación estática con capacity=30 y enrolled=8: listado 30/8, detalle 8/30.

Files involved:
- src/app/(app)/docente/grupos/page.tsx

Suggested fix:
Presentar enrolled / capacity, con un rótulo que deje claro que son estudiantes matriculados respecto a cupos disponibles totales.

Validation after fix:
Con datos sintéticos de capacidad 30 y matrículas 0, 8 y 30, mostrar 0/30, 8/30 y 30/30. La tarjeta y el detalle deben coincidir sin división por el número de estudiantes.

### FE-026

Severity: medium

Status: confirmed

Symptom:
El inicio del estudiante presenta el total histórico de matrículas como “Matrículas activas este periodo”. Registros cancelados, aprobados o de periodos anteriores aumentan indebidamente el indicador; sin periodo abierto puede seguir mostrando un total histórico.

Root cause:
StudentHome consulta /enrollments/mine?limit=1 sin status=activa ni period, y toma meta.total como el número de materias activas del periodo. El límite afecta las filas devueltas, no el conjunto contado. Se obtiene el periodo actual pero no se utiliza para filtrar esa consulta.

Evidence:
- src/app/(app)/estudiante/page.tsx:13-18: solicitudes paralelas de periodo y matrículas; la consulta de matrículas solo incluye limit=1.
- Mismo archivo:31: consume active.meta.total con ayuda “Matrículas activas este periodo”.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/enrollments/dto/enrollment.dto.ts:28-36 admite filtros period/status; src/enrollments/enrollments.service.ts:119-136 aplica esos filtros solo si se reciben y findMine solo fuerza el estudiante.
- Ejemplo con respuesta autorizada o simulada: 2 activas del periodo abierto y 6 históricas → meta.total sin filtros=8, indicador muestra 8 en lugar de 2. No se investigaron ni remediaron otros problemas de autorización del endpoint.

Files involved:
- src/app/(app)/estudiante/page.tsx

Suggested fix:
Consultar el total de matrículas activas del periodo efectivo, usando status y period, o un indicador específico con ese contrato. Sin periodo abierto, no etiquetar un total histórico como actividad actual.

Validation after fix:
Simular 2 activas actuales y 6 registros de otros estados/periodos: mostrar 2 y enviar ambos filtros. Sin periodo abierto, mostrar 0 o un estado explícito de ausencia, sin consultar todo el historial como sustituto. No crear matrículas reales para la prueba.

### FE-027

Severity: medium

Status: confirmed

Symptom:
En el panel administrativo, “Docentes activos” repite el número de estudiantes activos. Si hay 120 estudiantes y 8 docentes, ambas tarjetas muestran 120.

Root cause:
AdminHome vincula la tarjeta de docentes a d.active.students en vez de d.active.teachers. Los datos de docentes están disponibles en el contrato y no se usan para ese indicador.

Evidence:
- src/app/(app)/admin/page.tsx:21-24: tanto Estudiantes activos como Docentes activos leen d.active.students.
- src/lib/types.ts:33-35: Dashboard.active declara students y teachers como contadores distintos.
- Para active={students:120, teachers:8, ...}, la expresión de la segunda tarjeta produce 120 independientemente de teachers.

Files involved:
- src/app/(app)/admin/page.tsx

Suggested fix:
Usar d.active.teachers en la tarjeta de docentes, sin cambiar el contador de estudiantes ni el contrato de reportes.

Validation after fix:
Con dashboard simulado donde los dos contadores difieran, cada tarjeta debe mostrar su propiedad correcta. Repetir con 0 docentes y estudiantes positivos para evitar que datos coincidentes oculten el error.

### FE-028

Severity: medium

Status: confirmed

Symptom:
El panel administrativo del periodo abierto muestra cero para todos los estados de matrícula aunque la respuesta tenga conteos positivos bajo activa, aprobada, reprobada y cancelada.

Root cause:
AdminHome recorre [key,label] de STATUS_LABEL pero busca enrollmentsByStatus[label], usando el texto traducido plural (p.ej. Activas) en vez de la clave contractual (activa). La búsqueda falla y el fallback ??0 oculta el error.

Evidence:
- src/app/(app)/admin/page.tsx:11: mapa con claves activa/aprobada/reprobada/cancelada y etiquetas Activas/Aprobadas/Reprobadas/Canceladas.
- Mismo archivo:54-58: toma label para acceder al registro; key solo se utiliza como clave de React.
- Contrato externo, raíz Git C:/Users/Nat/examen/BackendProyecto1: src/reports/reports.service.ts:56-58,68 construye el registro por los valores de status originales, no por traducciones de la interfaz.
- Ejemplo: enrollmentsByStatus={activa:12}; la consulta ['Activas'] devuelve undefined y se presenta 0.

Files involved:
- src/app/(app)/admin/page.tsx

Suggested fix:
Acceder al conteo por key y reservar label para el texto visible. Mantener el fallback a cero para estados realmente ausentes, no para enmascarar nombres incompatibles.

Validation after fix:
Simular conteos distintos para los cuatro estados, por ejemplo 12, 7, 3 y 2, y comprobar cada etiqueta y valor. Con una clave ausente, solo ese estado debe mostrar 0. Es independiente de FE-027 aunque ambos estén en el mismo archivo.

### FE-029

Severity: medium

Status: confirmed

Symptom:
Un usuario con sesión de estudiante es redirigido si abre /admin, pero no si abre directamente /admin/usuarios. Las subpáginas de otras áreas por rol pasan la revisión frontend y pueden mostrar una pantalla ajena o fallar después en la API, en vez de redirigir al inicio del rol.

Root cause:
proxy() encuentra el área con pathname === p y no considera subrutas. El chequeo de rol solo funciona para las tres rutas raíz /admin, /docente y /estudiante; cualquier descendiente obtiene area=undefined y retorna NextResponse.next().

Evidence:
- src/proxy.ts:6,20-23: AREAS contiene las raíces; find usa igualdad exacta y el control de rol depende de area.
- Mismo archivo:26-28: el matcher sí incluye las subrutas de páginas, por lo que el problema está en la comparación y no en la exclusión del proxy.
- src/app/(app)/layout.tsx:7-13: el layout común exige sesión y obtiene datos del usuario, pero no rechaza el rol de la página solicitada.
- src/app/(app)/admin/usuarios/page.tsx:7-11: una subruta existente renderiza UsersManager sin una comprobación adicional de rol en la página.
- Caso estático: pathname=/admin/usuarios con session.role=estudiante → ninguna raíz coincide → se omite la redirección. No se afirma acceso autorizado a datos ni escalada de privilegios: el backend conserva sus controles y no se probaron accesos reales.

Files involved:
- src/proxy.ts
- src/app/(app)/layout.tsx
- src/app/(app)/admin/usuarios/page.tsx

Suggested fix:
Reconocer la raíz exacta o su descendiente con límite de segmento, por ejemplo p o p+'/…', manteniendo intacta la validación de sesión y el control del backend. No usar un startsWith sin límite que confunda /admin con rutas como /administrativo.

Validation after fix:
Con sesiones simuladas de cada rol, probar raíces y subrutas existentes de las otras dos áreas: deben redirigir a HOME[role] antes de renderizar la pantalla ajena. Permitir el área propia y páginas comunes /cuenta y /notificaciones. El backend debe seguir exigiendo sus permisos de forma independiente.

### FE-030

Severity: low

Status: confirmed

Symptom:
El inicio del estudiante muestra “Hola, undefined” si me.name contiene una sola palabra, por ejemplo “Ana”. Con nombres de varias palabras toma la segunda en vez de una selección consistente con el saludo del docente.

Root cause:
StudentHome usa me.name.split(' ')[1] sin comprobar que exista una segunda palabra ni ofrecer fallback. El tipo Me solo exige un string y la presentación no puede asumir ese índice.

Evidence:
- src/app/(app)/estudiante/page.tsx:22: interpolación del elemento [1] del split.
- src/lib/types.ts:25-29: Me.name es string sin una estructura de nombres de dos partes.
- src/app/(app)/docente/page.tsx:20: el saludo equivalente del docente toma [0], no [1].
- Evaluación estática con name='Ana': split devuelve ['Ana']; [1] es undefined y la plantilla imprime literalmente ese valor.

Files involved:
- src/app/(app)/estudiante/page.tsx

Suggested fix:
Elegir una parte existente del nombre o un fallback seguro, normalizando espacios si corresponde. No imponer que todas las personas tengan un nombre de dos palabras para evitar una falla de presentación.

Validation after fix:
Con usuarios sintéticos llamados Ana, Ana Ruiz y con espacios adicionales, el saludo debe contener un nombre válido y nunca undefined. Mantener el resto del resumen del estudiante sin cambios.

## Bugs

### FE-031

Title: Opciones del menú lateral no son visibles por falta de contraste

Severity: medium

Status: confirmed

Symptom:
En el panel del administrador, las opciones inactivas del menú lateral están presentes pero su texto e íconos no se distinguen del fondo blanco. Al pasar el mouse se vuelven visibles. Los títulos de sección también quedan blancos sobre blanco. No faltan pestañas ni rutas: falla su presentación. La opción activa sí tiene un fondo violeta que permite distinguir su texto blanco.

Root cause:
AppShell.renderLink() asigna text-white a los enlaces inactivos dentro de un contenedor bg-surface, cuyo color es #ffffff. Solo hover:text-ink cambia el texto a oscuro; los íconos Lucide heredan el color del enlace. Los encabezados de sección y Cuenta también usan text-white sobre ese mismo fondo. Es una única causa de contraste incorrecto del menú compartido.

Evidence:
- src/components/app-shell.tsx:81-87: rama inactiva `text-white hover:bg-primary-50 hover:text-ink`; el Icon y el span no definen otro color.
- Mismo archivo:103-113: las opciones se renderizan mediante items.map y common.map; los títulos de sección y Cuenta usan text-white (líneas 106 y 112).
- Mismo archivo:131,144-148: tanto la barra lateral de escritorio como el cajón móvil usan bg-surface y el mismo contenido sidebar.
- src/app/globals.css:31-35: ink=#1c1633, muted=#6a6585 y surface=#ffffff; blanco sobre blanco tiene contraste 1:1. La rama activa usa bg-primary-600, definido como #6a3fe8 en la línea 15.
- Reporte del usuario: el menú solo se ve al pasar el mouse. Evidencia estática concluyente de la causa; ESLint acotado pasa sin errores y no comprueba contraste. No se realizó reproducción visual propia.

Files involved:
- src/components/app-shell.tsx
- src/app/globals.css (referencia de paleta; no requiere cambio para la corrección propuesta)

Suggested fix:
Usar un color oscuro con suficiente contraste en los enlaces inactivos, por ejemplo text-ink, y text-muted en los títulos de sección. Conservar texto blanco sobre violeta para la opción activa, así como los estados hover y foco. Los íconos deben heredar el color visible del enlace. No eliminar opciones ni modificar rutas o permisos para compensar el problema.

Validation after fix:
- Desde la raíz ejecutar `& './node_modules/.bin/eslint.cmd' src/components/app-shell.tsx --no-fix --no-cache`.
- Con sesión de prueba o datos simulados, abrir el panel administrativo sin situar el cursor sobre el menú: todas las etiquetas, íconos y títulos deben ser visibles. Verificar opción activa, inactivas, hover y navegación por teclado; el contraste del texto normal debe alcanzar al menos 4.5:1 respecto al fondo efectivo.
- Repetir en el cajón móvil sin hover y en los otros roles que consumen AppShell. No es necesario modificar datos para validar la presentación.
