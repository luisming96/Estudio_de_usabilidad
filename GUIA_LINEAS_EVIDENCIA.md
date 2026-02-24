# GUIA RAPIDA DE LINEAS DE EVIDENCIA (R/U/A)

## Punto de entrada (siempre mostrar primero)

- Selector de skin y aplicación global:
  - [setSkin](assets/js/core.js#L443-L450)
  - [applyStudyEvidenceBySkin](assets/js/core.js#L436-L440)
- Funciones clave por escenario:
  - [resetStudyEvidenceMutations](assets/js/core.js#L63-L215)
  - [applyBaseStudyEvidence](assets/js/core.js#L217-L347)
  - [applyAccessStudyEvidence](assets/js/core.js#L349-L415)
  - [applyGoodStudyEvidence](assets/js/core.js#L417-L434)

## Modalidad de grabación por estudio (regla práctica)

- Responsive (R1-R10): **no hace falta doble navegador simultáneo**.
  - Graba en 320px (o ancho móvil), muestra primero el fallo en `skin-base` y luego cambia a `skin-good` para mostrar la corrección en el mismo flujo.
  - Aquí lo importante es el comportamiento por tamaño de pantalla + la línea CSS/JS que lo causa.
- Usabilidad (U1-U10): **sí conviene comparación por temas**.
  - Puedes usar dos navegadores lado a lado (`skin-base` vs `skin-good`) o un solo navegador alternando skin en la misma pantalla/tarea.
  - Aquí lo importante es que se vea el impacto en la comprensión y en el flujo de uso.
- Accesibilidad (A1-A10): **sí conviene comparación por temas**.
  - Recomendado dos navegadores (`skin-access` vs `skin-good`) para que el contraste, foco y atributos se comparen de forma inmediata.
  - Aquí lo importante es mostrar cambio visible + atributo/estructura en DOM.

## Evidencias Responsive (R1-R10)

- R1 Navbar móvil roto en base:
  - Línea clave: [navbar oculto en base](assets/css/style.css#L1261-L1266)
  - Página recomendada: `dashboard.html` a 320px.
  - Qué mostrar: en `skin-base` no aparece navegación usable; al pasar a `skin-good` vuelve el acceso al menú.
  - Frase corta: “Aquí se pierde navegación en móvil por reglas de la skin base; la skin buena restablece el menú.”
- R2 Formularios comprimidos:
  - Línea clave: [grid forzado de formularios](assets/css/style.css#L1221-L1232)
  - Soporte DOM: [hook HTML de formularios](pages/login.html#L47), [salud](pages/salud.html#L59), [alertas](pages/alertas.html#L59)
  - Página recomendada: `salud.html` a 320px.
  - Qué mostrar: en `skin-base` los campos quedan en columnas estrechas; en `skin-good` se apilan y se leen mejor.
  - Frase corta: “La base fuerza una rejilla no móvil; la buena recupera el flujo vertical natural.”
- R3 Composición degradada del formulario:
  - Línea clave: [clase forzada row g-0](assets/js/core.js#L244)
  - Soporte de validación alterada: [novalidate aplicado](assets/js/core.js#L243)
  - Página recomendada: `dashboard-medico.html` (formulario) a 320px.
  - Qué mostrar: en `skin-base` el form pierde separación visual por clase mutada; en `skin-good` vuelve composición limpia.
  - Frase corta: “No es solo CSS: aquí hay mutación de clase desde JS que rompe la composición.”
- R4 Header con overflow:
  - Línea clave JS: [header flex-nowrap desde JS](assets/js/core.js#L340-L342)
  - Línea clave CSS: [min-width en hijos header](assets/css/style.css#L1308-L1311)
  - Página recomendada: `dashboard.html` a 320px, parte superior.
  - Qué mostrar: en `skin-base` aparece scroll horizontal en cabecera; en `skin-good` desaparece el desborde.
  - Frase corta: “Con `flex-nowrap` y `min-width` rígido, la cabecera no refluye en móvil.”
- R5 Bloques clave en fila/truncados:
  - Línea clave JS: [stat-grid forzado](assets/js/core.js#L344-L346)
  - Línea clave CSS: [study-force-two-cols + stat-grid scroll](assets/css/style.css#L1244-L1254)
  - Soporte portada: [hero-list horizontal/truncado en inicio](assets/css/style.css#L1285-L1302)
  - Página recomendada: `index.html` (hero) o `dashboard.html` (paneles) a 320px.
  - Qué mostrar: en `skin-base` bloques quedan en horizontal con recorte; en `skin-good` se ordenan verticalmente.
  - Frase corta: “La base fuerza dos columnas y recorta lectura; la buena prioriza legibilidad móvil.”
- R6 Cards con ancho fijo:
  - Línea clave: [map-card/alert-card con min-width 420](assets/css/style.css#L1276-L1279)
  - Página recomendada: `mapa.html` o `alertas.html` a 320px.
  - Qué mostrar: en `skin-base` la tarjeta obliga scroll lateral; en `skin-good` la card encaja en viewport.
  - Frase corta: “El `min-width` fijo rompe móviles pequeños; la skin buena vuelve a ancho fluido.”
- R7 Gráfico con ancho forzado:
  - Línea clave: [chart-wrap min-width 520](assets/css/style.css#L1281-L1283)
  - Página recomendada: `seguimiento.html` a 320px.
  - Qué mostrar: en `skin-base` el contenedor del gráfico sobrepasa pantalla; en `skin-good` vuelve ajuste responsive.
  - Frase corta: “La base impone un mínimo de 520px; la buena deja adaptar el gráfico al contenedor.”
- R8 Tabla sin adaptación:
  - Línea clave JS: [unwrap de wrappers en base](assets/js/core.js#L53-L61)
  - Línea clave CSS: [tabla con min-width 980 en base](assets/css/style.css#L1323-L1324)
  - Soporte HTML: [wrappers originales en dashboards](pages/dashboard-medico.html#L81), [farmacéutico](pages/dashboard-farmaceutico.html#L94)
  - Página recomendada: `dashboard-medico.html` a 320px.
  - Qué mostrar: en `skin-base` se elimina `table-responsive` y aparece desborde; en `skin-good` se restaura wrapper.
  - Frase corta: “Aquí se rompe la adaptación de tabla quitando el contenedor responsive desde JS.”
- R9 Controles táctiles pequeños:
  - Línea base: [controles reducidos en base (24px)](assets/css/style.css#L1233-L1236)
  - Línea good: [controles recuperados en good (46px)](assets/css/style.css#L1351-L1354)
  - Página recomendada: `salud.html` a 320px.
  - Qué mostrar: en `skin-base` botones e inputs quedan pequeños para dedo; en `skin-good` recuperan tamaño táctil cómodo.
  - Frase corta: “Base reduce objetivos táctiles; buena restituye tamaño usable para interacción móvil.”
- R10 Footer no apila:
  - Línea clave: [footer rígido en base](assets/css/style.css#L1313-L1319)
  - Página recomendada: final de `dashboard.html` o `salud.html` a 320px.
  - Qué mostrar: en `skin-base` el footer queda en fila rígida y desborda; en `skin-good` apila correctamente.
  - Frase corta: “La base bloquea el wrap del footer; la buena devuelve el apilado vertical en móvil.”

## Evidencias Usabilidad (U1-U9)

### Qué cambia en la app (Usabilidad)

- U1: menú con etiquetas ambiguas (`Ini`, `Dash`, `Sal`) vs etiquetas claras.
- U2: `select` con opciones genéricas (`Elegir`, `Opcion N`) vs opciones con significado clínico.
- U3: títulos/labels convertidos a `Dato` vs textos que orientan la tarea.
- U4: botones principales en `OK` vs botones con acción específica (`Guardar`, `Enviar`, etc.).
- U5: placeholders `...` vs placeholders guía.
- U6: campos especiales degradados a `text` vs teclado/control correcto según dato (`email`, `date`, `number`).
- U7: formulario deja enviar datos inválidos vs validación que bloquea errores.
- U8: autocompletado desactivado vs autocompletado operativo.
- U9: interfaz comprimida y densa vs bloques legibles con mejor escaneo.

- U1 Etiquetas ambiguas de navegación:
  - [mapa de etiquetas cortas](assets/js/core.js#L42-L50)
- U2 Selects genéricos:
  - [opciones mutadas a Elegir/Opcion N](assets/js/core.js#L254-L261)
- U3 Títulos/labels a Dato:
  - [mutación textContent a Dato](assets/js/core.js#L326-L334)
- U4 CTA ambiguo OK:
  - [botones principales a OK](assets/js/core.js#L307)
- U5 Placeholders inútiles:
  - [placeholder => ...](assets/js/core.js#L263-L274)
- U6 Tipos de input degradados a text:
  - [type/inputmode forzados](assets/js/core.js#L276-L288)
- U7 Validación desactivada:
  - [required eliminado](assets/js/core.js#L337)
  - [novalidate activado](assets/js/core.js#L243)
- U8 Autocompletado desactivado:
  - [autocomplete off en form y campos](assets/js/core.js#L239-L251)

- U9 Densidad/escaneabilidad degradada:
  - [formularios compactos + métricas forzadas](assets/js/core.js#L244-L346)

## Evidencias Accesibilidad (A1-A10)

### Qué cambia en la app (Accesibilidad)

- A1: colores con peor legibilidad vs contraste suficiente.
- A2: no se aprecia foco al tabular vs foco visible claro.
- A3: skip-link no usable vs salto a contenido funcional.
- A4: label ya no está asociado al input vs asociación restaurada.
- A5: controles sin nombre accesible vs `aria-label` presente.
- A6: tabulación no llega a controles clave vs navegación completa por teclado.
- A7: imágenes sin texto alternativo vs `alt` restaurado.
- A8: idioma de página incorrecto (`en`) vs idioma correcto (`es`).
- A9: encabezados ocultos para AT vs jerarquía disponible.
- A10: experiencia inconsistente en formularios vs estado accesible completo restaurado.

- A1 Contraste degradado (AA):
  - [tokens de skin-access](assets/css/style.css#L1084-L1094)
- A2 Foco no visible (AA):
  - [focus/focus-visible anulados](assets/css/style.css#L1125-L1129)
- A3 Skip-link roto (A):
  - [skip-link tabindex -1 + aria-hidden true](assets/js/core.js#L357-L364)
  - [skip-link oculto en CSS](assets/css/style.css#L1327-L1329)
- A4 Label-for roto (A):
  - [removeAttribute for](assets/js/core.js#L366-L370)
- A5 Nombre accesible ausente (A):
  - [removeAttribute aria-label](assets/js/core.js#L372-L377)
- A6 Tabulación bloqueada (A):
  - [tabindex -1 masivo](assets/js/core.js#L398-L402)
- A7 Alternativa textual degradada (A):
  - [alt forzado a vacío](assets/js/core.js#L386-L395)
- A8 Idioma de página incorrecto (A):
  - [html lang en](assets/js/core.js#L355)
  - [lang original en páginas](pages/index.html#L2)
- A9 Estructura de encabezados oculta (A):
  - [aria-hidden true en h1/h2/h3](assets/js/core.js#L404-L413)
- A10 Restauración accesible en good:
  - [reset de atributos y estado](assets/js/core.js#L63-L215)

## Hooks HTML que debes mostrar (DOM real)

- Formularios con data-study-grid:
  - [login](pages/login.html#L47)
  - [salud](pages/salud.html#L59)
  - [medico-comunicacion](pages/medico-comunicacion.html#L58)
  - [herramientas](pages/herramientas.html#L76)
  - [farmaceutico-comunicacion](pages/farmaceutico-comunicacion.html#L59)
  - [dashboard-medico](pages/dashboard-medico.html#L116)
  - [dashboard-farmaceutico stock](pages/dashboard-farmaceutico.html#L83)
  - [dashboard-farmaceutico dispensacion](pages/dashboard-farmaceutico.html#L110)
  - [alertas](pages/alertas.html#L59)
- Skip-link presente en páginas:
  - [index](pages/index.html#L15)
  - [salud](pages/salud.html#L15)
  - [seguimiento](pages/seguimiento.html#L15)

## Orden recomendado de grabación (rápido)

1. Mostrar cambio de skin en [setSkin](assets/js/core.js#L443-L450).
2. Mostrar primero qué cambia en la app (visual/funcional).
3. Abrir inspector y enseñar atributo/clase exacta en línea.
4. Mostrar restauración en `skin-good` y cerrar con frase de impacto en usuario.
