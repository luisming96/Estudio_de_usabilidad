CHECKLIST Y MATRIZ DE ESTUDIOS (RESPONSIVE, USABILIDAD, ACCESIBILIDAD)
========================================================================

Mapeo oficial de skins para los estudios
----------------------------------------
- `skin-base` => **Skin mala usabilidad** (rompe flujos/jerarquía)
- `skin-access` => **Skin mala accesibilidad** (rompe contraste, foco, semántica)
- `skin-good` => **Skin buena** (corrige usabilidad + accesibilidad + responsive)

Regla del profesor (obligatoria)
--------------------------------
- En cada punto debe haber cambios en **HTML** (estructura, orden, etiquetas, controles, textos o atributos).
- CSS/JS solo se usa como apoyo; no cuenta por sí solo para justificar el problema/solución.

----------------------------------------------------------------------
MATRIZ 1/3: ESTUDIO RESPONSIVE (10 puntos)
----------------------------------------------------------------------

[ ] R1 - Navbar en móvil
- Skin con problema: `skin-base`
- Problema: menú sin colapso útil y enlaces desordenados en 320px.
- Cambio HTML obligatorio: reorganizar bloques del `nav` (orden `brand`, `toggler`, `collapse`) y simplificar opciones visibles.
- Apoyo CSS/JS: breakpoints y estilos de `navbar-toggler`.
- Evidencia vídeo: comparar 320px (mala) vs 375/768px (buena).

[ ] R2 - CTA en formularios
- Skin con problema: `skin-base`
- Problema: botones no ocupan ancho y se cortan en pantallas pequeñas.
- Cambio HTML obligatorio: usar estructura `col-12` + botones en contenedor de ancho completo.
- Apoyo CSS/JS: clases utilitarias responsive.
- Evidencia vídeo: login/alertas antes vs después.

[ ] R3 - Tablas densas
- Skin con problema: `skin-base`
- Problema: tablas desbordan horizontalmente.
- Cambio HTML obligatorio: envolver tablas en `div.table-responsive` y simplificar columnas en móvil.
- Apoyo CSS/JS: ajuste de tipografía y paddings.
- Evidencia vídeo: dashboard médico/farmacéutico en 360px.

[ ] R4 - Cards con alturas incoherentes
- Skin con problema: `skin-base`
- Problema: contenido irregular rompe alineación de tarjetas.
- Cambio HTML obligatorio: homogeneizar estructura interna (título, texto, acciones) en todas las cards.
- Apoyo CSS/JS: grid/flex para altura consistente.
- Evidencia vídeo: home y secciones de tarjetas.

[ ] R5 - Hero no reordena bien
- Skin con problema: `skin-base`
- Problema: columnas del hero quedan invertidas o con solapes.
- Cambio HTML obligatorio: reordenar bloques del hero para mobile-first y lectura vertical.
- Apoyo CSS/JS: clases de orden y espaciado responsive.
- Evidencia vídeo: 320px, 768px, 1366px.

[ ] R6 - Controles demasiado juntos
- Skin con problema: `skin-access`
- Problema: inputs y botones se pegan en móvil.
- Cambio HTML obligatorio: separar controles en filas/columnas claras (`row g-*`, `col-12`).
- Apoyo CSS/JS: `gap` y márgenes.
- Evidencia vídeo: formularios médico/farmacia.

[ ] R7 - Gráficos fuera de contenedor
- Skin con problema: `skin-access`
- Problema: canvas no respeta el layout en pantallas pequeñas.
- Cambio HTML obligatorio: encapsular gráficos en contenedores con altura definida.
- Apoyo CSS/JS: render responsive del canvas.
- Evidencia vídeo: seguimiento/dashboard paciente.

[ ] R8 - Bloques informativos largos
- Skin con problema: `skin-access`
- Problema: textos extensos rompen tarjetas y empujan acciones fuera de vista.
- Cambio HTML obligatorio: dividir texto en párrafos/cajas semánticas más cortas.
- Apoyo CSS/JS: límites de ancho y espaciado.
- Evidencia vídeo: sobre/mapa/analisis.

[ ] R9 - Footer saturado en móvil
- Skin con problema: `skin-access`
- Problema: columnas de footer no se apilan correctamente.
- Cambio HTML obligatorio: reorganizar columnas del footer en orden lógico para móvil.
- Apoyo CSS/JS: breakpoints de columnas.
- Evidencia vídeo: páginas largas con scroll.

[ ] R10 - Orden de lectura responsive
- Skin con problema: `skin-access`
- Problema: el orden visual no coincide con el orden de lectura en móvil.
- Cambio HTML obligatorio: reordenar DOM de bloques principales para secuencia natural.
- Apoyo CSS/JS: solo ajuste menor de orden visual.
- Evidencia vídeo: recorrido de lectura en 360px.

----------------------------------------------------------------------
MATRIZ 2/3: ESTUDIO DE USABILIDAD (10 puntos)
----------------------------------------------------------------------

[ ] U1 - Navegación confusa
- Skin con problema: `skin-base`
- Problema: etiquetas ambiguas y opciones redundantes.
- Cambio HTML obligatorio: renombrar etiquetas del menú y agrupar enlaces por rol.
- Apoyo CSS/JS: estado activo de navegación.
- Evidencia vídeo: tiempo de encontrar funciones clave.

[ ] U2 - Jerarquía visual deficiente
- Skin con problema: `skin-base`
- Problema: títulos/subtítulos/acciones sin prioridad clara.
- Cambio HTML obligatorio: ajustar niveles (`h1/h2/h3`) y orden de bloques.
- Apoyo CSS/JS: tamaños y pesos tipográficos.
- Evidencia vídeo: lectura rápida de cada pantalla.

[ ] U3 - CTA principal poco claro
- Skin con problema: `skin-base`
- Problema: múltiples botones compiten por atención.
- Cambio HTML obligatorio: dejar una acción principal por bloque y secundarias separadas.
- Apoyo CSS/JS: estilo diferencial de CTA principal.
- Evidencia vídeo: flujo de login y dashboard.

[ ] U4 - Sobrecarga cognitiva
- Skin con problema: `skin-base`
- Problema: demasiados elementos simultáneos en secciones clave.
- Cambio HTML obligatorio: dividir contenido en bloques/accordion/pestañas.
- Apoyo CSS/JS: espaciado y visibilidad progresiva.
- Evidencia vídeo: comparación de densidad visual.

[ ] U5 - Formularios largos sin guía
- Skin con problema: `skin-base`
- Problema: campos sin agrupación lógica.
- Cambio HTML obligatorio: agrupar campos por categorías y encabezados de sección.
- Apoyo CSS/JS: columnas y separación.
- Evidencia vídeo: tiempo para completar formulario.

[ ] U6 - Mensajes de estado ambiguos
- Skin con problema: `skin-base`
- Problema: feedback poco específico.
- Cambio HTML obligatorio: añadir áreas de estado dedicadas (éxito/error/progreso).
- Apoyo CSS/JS: alertas visuales y timing.
- Evidencia vídeo: crear/editar acciones en app.

[ ] U7 - Prevención de errores insuficiente
- Skin con problema: `skin-base`
- Problema: controles permiten entradas conflictivas.
- Cambio HTML obligatorio: atributos de validación (`required`, `type`, `min`, `max`, `step`) y textos de ayuda.
- Apoyo CSS/JS: validación en vivo.
- Evidencia vídeo: intentar enviar formularios inválidos.

[ ] U8 - Consistencia entre pantallas
- Skin con problema: `skin-base`
- Problema: componentes similares con estructura distinta.
- Cambio HTML obligatorio: unificar plantillas de cards/tablas/formularios.
- Apoyo CSS/JS: estilos reutilizables.
- Evidencia vídeo: comparar pantallas por rol.

[ ] U9 - Visibilidad del estado del sistema
- Skin con problema: `skin-base`
- Problema: usuario no ve claramente progreso, alertas o rol activo.
- Cambio HTML obligatorio: ubicar indicadores de estado en zonas fijas y semánticas.
- Apoyo CSS/JS: badges y contadores.
- Evidencia vídeo: dashboard + alertas.

[ ] U10 - Flujo de tarea principal
- Skin con problema: `skin-base`
- Problema: pasos dispersos para tareas frecuentes.
- Cambio HTML obligatorio: secuenciar flujo en orden natural (entrada, acción, confirmación).
- Apoyo CSS/JS: transiciones y foco al siguiente paso.
- Evidencia vídeo: completar una tarea fin a fin.

----------------------------------------------------------------------
MATRIZ 3/3: ESTUDIO DE ACCESIBILIDAD (10 puntos)
----------------------------------------------------------------------

[ ] A1 - Contraste insuficiente
- Skin con problema: `skin-access`
- Problema: textos clave no cumplen contraste.
- Cambio HTML obligatorio: reforzar semántica de mensajes clave (`strong`, encabezados, orden de bloques) para lectura robusta.
- Apoyo CSS/JS: paleta con contraste AA/AAA.
- Evidencia vídeo: comparación visual + lectura real.

[ ] A2 - Foco no visible
- Skin con problema: `skin-access`
- Problema: navegación por teclado no localiza foco.
- Cambio HTML obligatorio: asegurar elementos interactivos reales (`button`, `a`, `input`) en vez de `div` clicables.
- Apoyo CSS/JS: estilos `:focus-visible`.
- Evidencia vídeo: navegación con tabulador.

[ ] A3 - Estructura semántica pobre
- Skin con problema: `skin-access`
- Problema: secciones sin landmarks.
- Cambio HTML obligatorio: usar `header`, `nav`, `main`, `section`, `footer` correctamente.
- Apoyo CSS/JS: sin dependencia crítica.
- Evidencia vídeo: navegación por lector/inspector de accesibilidad.

[ ] A4 - Etiquetas de formulario incompletas
- Skin con problema: `skin-access`
- Problema: campos sin `label` asociado.
- Cambio HTML obligatorio: `label for` + `id` único en todos los campos.
- Apoyo CSS/JS: validación y mensajes asociados.
- Evidencia vídeo: foco en campo y lectura del label.

[ ] A5 - ARIA mal aplicado o ausente
- Skin con problema: `skin-access`
- Problema: controles complejos sin contexto accesible.
- Cambio HTML obligatorio: añadir `aria-label`, `aria-describedby`, `aria-live`, `aria-expanded` donde toque.
- Apoyo CSS/JS: actualizar estados ARIA dinámicamente.
- Evidencia vídeo: alertas y navegación dinámica.

[ ] A6 - Orden de tabulación incoherente
- Skin con problema: `skin-access`
- Problema: el foco salta sin lógica.
- Cambio HTML obligatorio: ordenar elementos en DOM según flujo real de uso.
- Apoyo CSS/JS: evitar hacks visuales que rompan orden.
- Evidencia vídeo: recorrido completo con teclado.

[ ] A7 - Objetivos táctiles pequeños
- Skin con problema: `skin-access`
- Problema: botones/enlaces difíciles de activar.
- Cambio HTML obligatorio: sustituir enlaces mínimos por botones/enlaces con área suficiente y texto descriptivo.
- Apoyo CSS/JS: paddings mínimos y estados hover/focus.
- Evidencia vídeo: uso en móvil táctil.

[ ] A8 - Texto alternativo e iconografía
- Skin con problema: `skin-access`
- Problema: iconos sin soporte textual y alt deficiente.
- Cambio HTML obligatorio: `alt` útiles en imágenes e `aria-hidden`/texto auxiliar en iconos decorativos.
- Apoyo CSS/JS: estilos para texto auxiliar.
- Evidencia vídeo: inspección de elementos.

[ ] A9 - Mensajes de error no anunciados
- Skin con problema: `skin-access`
- Problema: error solo visual, no anunciado.
- Cambio HTML obligatorio: contenedores de error asociados por campo + región `aria-live`.
- Apoyo CSS/JS: inyección/limpieza de mensajes.
- Evidencia vídeo: forzar error en formularios.

[ ] A10 - Salto a contenido principal
- Skin con problema: `skin-access`
- Problema: navegación repetitiva sin atajo.
- Cambio HTML obligatorio: incluir enlace “Saltar al contenido” funcional y destino válido.
- Apoyo CSS/JS: visibilidad del skip-link en foco.
- Evidencia vídeo: teclado desde inicio de página.

Guion mínimo para grabación (profesor)
--------------------------------------
- Responsive: demostrar 10 puntos en 320px, 768px y desktop.
- Usabilidad: comparar `skin-base` (mala) vs `skin-good` (buena) en 10 puntos.
- Accesibilidad: comparar `skin-access` (mala) vs `skin-good` (buena) en 10 puntos.
- En cada punto, mostrar primero el problema y luego el arreglo con cambios en HTML + apoyo CSS/JS.
