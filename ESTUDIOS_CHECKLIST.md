# CHECKLIST Y MATRIZ DE ESTUDIOS

## Mapeo oficial de skins

- `skin-base`: mala usabilidad + mal responsive.
- `skin-access`: mala accesibilidad.
- `skin-good`: solución global (usabilidad + responsive + accesibilidad).

## Regla del profesor (obligatoria)

- Cada punto debe poder demostrarse con cambio real de HTML/atributos/estructura en el DOM (aunque el disparador sea JS).
- CSS se usa como apoyo visual, no como única justificación.

## Entrega de vídeos (nueva directriz)

- Se graban **31 vídeos en total**:
  - 1 vídeo demo general de la app.
  - 10 vídeos de responsive.
  - 10 vídeos de usabilidad.
  - 10 vídeos de accesibilidad.
- Todos los vídeos deben estar accesibles desde `analisis.html`, separados por secciones.
- Cada vídeo debe incluir cartelito introductorio; en responsive el cartel debe ser animación del alumno.

---

## MATRIZ 1/3: ESTUDIO RESPONSIVE (10 puntos)

[ ] **R1 - Navbar móvil no funcional**

- Skin con problema: `skin-base`.
- Problema: en móvil desaparece la navegación (sin toggler ni panel desplegable).
- Solución en `skin-good`: navegación móvil funcional.
- Evidencia código: CSS de `body.study-skin-base .navbar-toggler/.navbar-collapse`.
- Evidencia vídeo: `dashboard.html` a 320px (base vs buena).

[ ] **R2 - Formularios comprimidos en móvil**

- Skin con problema: `skin-base`.
- Problema: los campos se fuerzan en 3/2 columnas y no pasan a flujo vertical natural.
- Solución en `skin-good`: campos apilados a una columna en móvil.
- Evidencia código: `form[data-study-grid] > [class*='col']` (base) vs `study-skin-good`.
- Evidencia vídeo: `salud.html` o `alertas.html` a 320px.

[ ] **R3 - Gutter y composición degradada de formulario**

- Skin con problema: `skin-base`.
- Problema: pérdida de separación por mutación de clase del formulario.
- Solución en `skin-good`: recuperación de clase original y espaciado.
- Evidencia código: `form.className = 'row g-0 mt-1'` en `applyBaseStudyEvidence()` + reset.
- Evidencia vídeo: `dashboard-medico.html` / `dashboard-farmaceutico.html`.

[ ] **R4 - Cabecera con reflow roto**

- Skin con problema: `skin-base`.
- Problema: la franja superior no envuelve y fuerza scroll lateral.
- Solución en `skin-good`: flujo normal sin overflow en header.
- Evidencia código: `flex-nowrap overflow-auto` en `.page-header` + `min-width` en hijos.
- Evidencia vídeo: `dashboard.html` a 320px (solo cabecera).

[ ] **R5 - Bloques clave en fila y texto truncado**

- Skin con problema: `skin-base`.
- Problema: bloques informativos se fuerzan horizontalmente y se corta texto en móvil.
- Solución en `skin-good`: lectura vertical completa.
- Evidencia código: `study-force-two-cols` + reglas de `.hero-list` forzado en portada.
- Evidencia vídeo: `index.html` (beneficios del hero) o panel rápido en `dashboard.html`.

[ ] **R6 - Tarjetas informativas con ancho fijo**

- Skin con problema: `skin-base`.
- Problema: tarjetas de mapa/alertas se cortan y obligan desplazamiento horizontal.
- Solución en `skin-good`: ancho fluido (`min-width: 0`).
- Evidencia código: `min-width: 420px` en `.map-card/.alert-card` solo en base.
- Evidencia vídeo: `mapa.html` y `alertas.html`.

[ ] **R7 - Gráfico con ancho forzado**

- Skin con problema: `skin-base`.
- Problema: el contenedor del chart rompe el viewport móvil.
- Solución en `skin-good`: gráfico vuelve a adaptarse al contenedor.
- Evidencia código: `body.study-skin-base .chart-wrap { min-width: 520px; }`.
- Evidencia vídeo: `seguimiento.html` o `analisis.html` en móvil.

[ ] **R8 - Tabla sin adaptación responsive**

- Skin con problema: `skin-base`.
- Problema: se elimina el wrapper responsive y la tabla queda sobredimensionada.
- Solución en `skin-good`: tabla envuelta en `div.table-responsive`.
- Evidencia código: `unwrapStudyTableWrappers()` en base + wrapper en `applyGoodStudyEvidence()`.
- Evidencia vídeo: `dashboard-medico.html` o `dashboard-farmaceutico.html` (inspección DOM + vista móvil).

[ ] **R9 - Objetivos táctiles demasiado pequeños**

- Skin con problema: `skin-base`.
- Problema: controles con altura reducida (interacción táctil peor).
- Solución en `skin-good`: controles con altura mínima cómoda (`46px`).
- Evidencia código: `.btn/.form-control/.form-select` en base vs good.
- Evidencia vídeo: formularios en `salud.html` / `alertas.html`.

[ ] **R10 - Footer no apila en móvil**

- Skin con problema: `skin-base`.
- Problema: el footer fuerza una fila rígida y desborda el viewport.
- Solución en `skin-good`: apilado vertical normal.
- Evidencia código: `.footer-main .row { flex-wrap: nowrap; min-width: 760px; }` solo en base.
- Evidencia vídeo: final de `dashboard.html` o `salud.html` a 320px.

---

## MATRIZ 2/3: ESTUDIO DE USABILIDAD (10 puntos)

[ ] **U1 - Reconocimiento en navegación**

- Skin con problema: `skin-base`.
- Mala práctica: menú con etiquetas ambiguas (`Ini`, `Dash`, `Sal`).
- Solución en `skin-good`: etiquetas descriptivas restauradas.
- Cambio HTML/atributo: mutación de `textContent` en enlaces `data-nav`.
- Principio de Nielsen: **Relación entre el sistema y el mundo real**.
- Frase para vídeo: "Aquí el sistema no habla el lenguaje del usuario; en la skin buena recuperamos nombres claros y reconocibles."

[ ] **U2 - Significado de opciones**

- Skin con problema: `skin-base`.
- Mala práctica: `select` con opciones genéricas (`Elegir`, `Opcion N`).
- Solución en `skin-good`: opciones reales restauradas.
- Cambio HTML/atributo: mutación de texto en etiquetas `<option>`.
- Principio de Nielsen: **Relación entre el sistema y el mundo real**.
- Frase para vídeo: "En la skin mala las opciones no tienen significado; en la buena el usuario entiende qué está seleccionando."

[ ] **U3 - Orientación de la interfaz**

- Skin con problema: `skin-base`.
- Mala práctica: títulos/labels degradados a `Dato`.
- Solución en `skin-good`: textos contextuales originales.
- Cambio HTML/atributo: mutación de `textContent` en `.form-label/.page-title/.section-title`.
- Principio de Nielsen: **Visibilidad del estado del sistema**.
- Frase para vídeo: "Si todo dice ‘Dato’, el usuario pierde contexto; en la skin buena cada bloque vuelve a indicar su función."

[ ] **U4 - Claridad de acción principal**

- Skin con problema: `skin-base`.
- Mala práctica: botones principales convertidos a `OK`.
- Solución en `skin-good`: acciones con texto específico.
- Cambio HTML/atributo: mutación de `textContent` en `.btn-primary/.btn-outline-primary`.
- Principio de Nielsen: **Relación entre el sistema y el mundo real**.
- Frase para vídeo: "Un botón ‘OK’ no explica la tarea; en la skin buena el texto del botón comunica exactamente la acción."

[ ] **U5 - Pistas de entrada**

- Skin con problema: `skin-base`.
- Mala práctica: placeholders degradados a `...`.
- Solución en `skin-good`: placeholders originales y útiles.
- Cambio HTML/atributo: mutación del atributo `placeholder`.
- Principio de Nielsen: **Reconocer mejor que recordar**.
- Frase para vídeo: "Sin pistas, el usuario tiene que recordar el formato; en la skin buena el campo guía la entrada."

[ ] **U6 - Precisión de captura**

- Skin con problema: `skin-base`.
- Mala práctica: campos `email/tel/date/number` convertidos a `type="text"`.
- Solución en `skin-good`: tipos de campo correctos restaurados.
- Cambio HTML/atributo: mutación del atributo `type` (y `inputmode`).
- Principio de Nielsen: **Flexibilidad y eficiencia de uso**.
- Frase para vídeo: "Al forzar `text` se pierde el teclado adecuado; en la skin buena cada tipo de dato usa su control correcto."

[ ] **U7 - Prevención de errores**

- Skin con problema: `skin-base`.
- Mala práctica: validación nativa desactivada (`required` fuera + `novalidate`).
- Solución en `skin-good`: validación obligatoria recuperada.
- Cambio HTML/atributo: mutación de `required` y `novalidate`.
- Principio de Nielsen: **Prevención de errores**.
- Frase para vídeo: "En la skin mala se permite enviar datos inválidos; en la buena se bloquea el error antes de enviarlo."

[ ] **U8 - Eficiencia de uso**

- Skin con problema: `skin-base`.
- Mala práctica: autocompletado desactivado (`autocomplete="off"`).
- Solución en `skin-good`: comportamiento original recuperado.
- Cambio HTML/atributo: mutación de `autocomplete` en form/campos.
- Principio de Nielsen: **Flexibilidad y eficiencia de uso**.
- Frase para vídeo: "Al quitar autocompletado se fuerza trabajo repetitivo; en la skin buena se acelera el flujo de entrada."

[ ] **U9 - Integridad del flujo**

- Skin con problema: `skin-base`.
- Mala práctica: botones de envío mutados a `type="button"` (no envían).
- Solución en `skin-good`: envío funcional restaurado.
- Cambio HTML/atributo: mutación de atributo `type` en `<button>`.
- Principio de Nielsen: **Visibilidad del estado del sistema**.
- Frase para vídeo: "En la skin mala la acción no produce resultado y rompe el flujo; en la buena el envío vuelve a funcionar."

[ ] **U10 - Densidad y escaneabilidad**

- Skin con problema: `skin-base`.
- Mala práctica: layout comprimido (`row g-0`, métricas forzadas, bloques densos).
- Solución en `skin-good`: separación visual y lectura por bloques.
- Cambio HTML/atributo: mutación de clase en formularios + clase `study-force-two-cols`.
- Principio de Nielsen: **Diseño estético y minimalista**.
- Frase para vídeo: "La skin mala comprime y satura la pantalla; en la buena se recupera jerarquía y escaneo rápido de la información."

---

## MATRIZ 3/3: ESTUDIO DE ACCESIBILIDAD (10 puntos, WCAG 2.1)

[ ] **A1 - Contraste insuficiente (WCAG 1.4.3, nivel AA)**

- Skin con problema: `skin-access`.
- Mala práctica: tokens de color degradados que empeoran legibilidad.
- Solución en `skin-good`: contraste visual más robusto.
- Cambio HTML/atributo: se evidencia en tokens de tema aplicados al `body`.

[ ] **A2 - Foco no visible (WCAG 2.4.7, nivel AA)**

- Skin con problema: `skin-access`.
- Mala práctica: foco visual anulado (`outline/box-shadow` desactivados).
- Solución en `skin-good`: foco visible con anillo claro.
- Cambio HTML/atributo: afecta navegación sobre elementos interactivos reales (`a`, `button`, `input`).

[ ] **A3 - Salto a contenido roto (WCAG 2.4.1, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: `.skip-link` deshabilitado/oculto (`tabindex=-1`, `aria-hidden=true`).
- Solución en `skin-good`: skip-link funcional (`tabindex=0`, visible al foco).
- Cambio HTML/atributo: mutación de `tabindex` y `aria-hidden` en `.skip-link`.

[ ] **A4 - Relación label-campo rota (WCAG 1.3.1, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: eliminación de `for` en `<label>`.
- Solución en `skin-good`: asociación `label for` restaurada.
- Cambio HTML/atributo: mutación del atributo `for`.

[ ] **A5 - Nombre accesible ausente (WCAG 4.1.2, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: eliminación de `aria-label` en controles.
- Solución en `skin-good`: nombres accesibles recuperados.
- Cambio HTML/atributo: mutación de atributo `aria-label`.

[ ] **A6 - Operabilidad por teclado bloqueada (WCAG 2.1.1, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: elementos interactivos con `tabindex=-1`.
- Solución en `skin-good`: secuencia de teclado restaurada.
- Cambio HTML/atributo: mutación masiva de `tabindex` en `a/button/input/select/textarea`.

[ ] **A7 - Alternativa textual degradada (WCAG 1.1.1, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: imágenes forzadas a `alt=""`.
- Solución en `skin-good`: `alt` original restaurado.
- Cambio HTML/atributo: mutación de atributo `alt` en `<img>`.

[ ] **A8 - Idioma de página incorrecto (WCAG 3.1.1, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: `html[lang]` cambiado a `en` en contenido español.
- Solución en `skin-good`: idioma original (`es`) restaurado.
- Cambio HTML/atributo: mutación de atributo `lang` en `<html>`.

[ ] **A9 - Estructura de encabezados oculta (WCAG 1.3.1, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: `h1/h2/h3` con `aria-hidden="true"`.
- Solución en `skin-good`: jerarquía de encabezados disponible para AT.
- Cambio HTML/atributo: mutación de atributo `aria-hidden` en encabezados.

[ ] **A10 - Coherencia visual de formularios accesibles (WCAG 3.3.2, nivel A)**

- Skin con problema: `skin-access`.
- Mala práctica: labels degradadas visualmente + pérdida de contexto al navegar.
- Solución en `skin-good`: etiquetas legibles y foco consistente.
- Cambio HTML/atributo: combinación de restauración de `for`, `aria-label`, `tabindex` y foco visible.

---

## Guion mínimo para grabación

- Responsive: en 320px, mostrar fallo en `skin-base` y corrección en `skin-good` dentro del mismo flujo (R1-R10; no requiere doble navegador simultáneo).
- Usabilidad: comparación por temas (`skin-base` vs `skin-good`) sobre flujo real de tareas (U1-U10).
- Accesibilidad: comparación por temas (`skin-access` vs `skin-good`) con inspección de atributos en DOM (A1-A10).
- En cada punto: mostrar primero problema visual/funcional y luego evidencia de código (atributo o estructura) + solución.
