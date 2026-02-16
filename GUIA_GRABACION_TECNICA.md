GUIA TECNICA PARA GRABACION (SIN ROMPER LA APP)
===============================================

Objetivo
--------
- Implementar y explicar 3 skins para estudio sin romper la lógica funcional actual.
- `skin-base`: mala usabilidad.
- `skin-access`: mala accesibilidad.
- `skin-good`: versión corregida.

Zonas protegidas (NO tocar para evitar regresiones)
----------------------------------------------------
- Control de skins y estado global: [assets/js/core.js](assets/js/core.js#L42-L57)
- Control de rol y permisos: [assets/js/core.js](assets/js/core.js#L60-L181)
- Login/logout y autenticación: [assets/js/core.js](assets/js/core.js#L183-L226)
- Orquestación principal: [assets/js/main.js](assets/js/main.js#L1-L24)

Estrategia segura de trabajo
----------------------------
1) Cambiar primero HTML semántico/estructura en páginas, no lógica de negocio.
2) Ajustar CSS por skin en bloques ya existentes: [assets/css/style.css](assets/css/style.css#L59-L110) y [assets/css/style.css](assets/css/style.css#L445-L460).
3) Hacer 1 punto = 1 commit (fácil revertir).
4) Tras cada 2-3 puntos: prueba rápida de login + dashboard + médico + farmacéutico.

Anclas base para grabación
--------------------------
- Selector de skin en login: [pages/login.html](pages/login.html#L47-L74)
- Inicialización de skin: [assets/js/core.js](assets/js/core.js#L42-L57)
- `skip-link` y foco: [assets/css/style.css](assets/css/style.css#L119-L131)
- Navbar responsive (ejemplo): [pages/index.html](pages/index.html#L17-L46)

------------------------------------------------------------------
30 PUNTOS (QUE EXPLICAR Y DONDE MIRAR)
------------------------------------------------------------------

RESPONSIVE (10)
---------------
R1 Navbar móvil
- Comentar: colapso y orden de navegación.
- Código: [pages/index.html](pages/index.html#L17-L46), [pages/login.html](pages/login.html#L17-L39)

R2 CTA en móvil
- Comentar: botón principal en ancho completo.
- Código: [pages/login.html](pages/login.html#L66-L81)

R3 Tablas sin desbordar
- Comentar: uso de contenedor responsive.
- Código: [pages/dashboard-farmaceutico.html](pages/dashboard-farmaceutico.html#L94-L149), [pages/dashboard-medico.html](pages/dashboard-medico.html#L81-L178)

R4 Cards consistentes
- Comentar: misma estructura de título-contenido-acción.
- Código: [pages/index.html](pages/index.html#L166-L236), [pages/sobre.html](pages/sobre.html#L121-L162)

R5 Hero reordenado
- Comentar: lectura natural en móvil.
- Código: [pages/index.html](pages/index.html#L48-L113)

R6 Formularios con grid mobile-first
- Comentar: separación por filas y columnas.
- Código: [pages/salud.html](pages/salud.html#L59-L102), [pages/dashboard-farmaceutico.html](pages/dashboard-farmaceutico.html#L83-L123)

R7 Canvas responsive
- Comentar: gráfico dentro de contenedor estable.
- Código: [pages/seguimiento.html](pages/seguimiento.html#L59-L63)

R8 Bloques de texto largos
- Comentar: división en secciones para no romper layout.
- Código: [pages/sobre.html](pages/sobre.html#L53-L118), [pages/mapa.html](pages/mapa.html#L53-L151)

R9 Footer apilable
- Comentar: estructura por columnas con comportamiento móvil.
- Código: [pages/index.html](pages/index.html#L269-L304), [assets/css/style.css](assets/css/style.css#L553-L562)

R10 Orden DOM vs orden visual
- Comentar: lectura lineal sin saltos.
- Código: [pages/medico-comunicacion.html](pages/medico-comunicacion.html#L45-L83), [pages/farmaceutico-comunicacion.html](pages/farmaceutico-comunicacion.html#L45-L88)

USABILIDAD (10)
---------------
U1 Navegación clara
- Comentar: etiquetas y agrupación por rol.
- Código: [pages/mapa.html](pages/mapa.html#L26-L36), [assets/js/core.js](assets/js/core.js#L65-L75)

U2 Jerarquía visual
- Comentar: `h1` + subtítulo + CTA.
- Código: [pages/dashboard.html](pages/dashboard.html#L49-L66), [pages/analisis.html](pages/analisis.html#L49-L53)

U3 Acción principal visible
- Comentar: una CTA primaria por bloque.
- Código: [pages/login.html](pages/login.html#L77-L81), [pages/dashboard-farmaceutico.html](pages/dashboard-farmaceutico.html#L55-L56)

U4 Menos carga cognitiva
- Comentar: separar secciones funcionales.
- Código: [pages/dashboard-medico.html](pages/dashboard-medico.html#L70-L206), [pages/seguimiento.html](pages/seguimiento.html#L56-L167)

U5 Formularios guiados
- Comentar: etiquetas y placeholders útiles.
- Código: [pages/salud.html](pages/salud.html#L60-L102), [pages/medico-comunicacion.html](pages/medico-comunicacion.html#L58-L68)

U6 Feedback de acciones
- Comentar: estado, alertas y resultado visible.
- Código: [assets/js/core.js](assets/js/core.js#L289-L293), [assets/js/pharmacy.js](assets/js/pharmacy.js#L98-L106)

U7 Prevención de errores
- Comentar: `required`, `type`, validaciones previas.
- Código: [pages/login.html](pages/login.html#L50-L63), [assets/js/pharmacy.js](assets/js/pharmacy.js#L74-L82)

U8 Consistencia entre pantallas
- Comentar: patrón de cards/tablas repetido.
- Código: [pages/dashboard.html](pages/dashboard.html#L88-L129), [pages/dashboard-medico.html](pages/dashboard-medico.html#L72-L83)

U9 Estado del sistema
- Comentar: progreso y alertas visibles.
- Código: [pages/dashboard.html](pages/dashboard.html#L68-L86), [pages/alertas.html](pages/alertas.html#L37-L40)

U10 Flujo completo de tarea
- Comentar: login -> dashboard -> acción -> feedback.
- Código: [assets/js/core.js](assets/js/core.js#L186-L212), [assets/js/main.js](assets/js/main.js#L13-L24)

ACCESIBILIDAD (10)
------------------
A1 Contraste
- Comentar: diferencias intencionales entre skins.
- Código: [assets/css/style.css](assets/css/style.css#L445-L460), [assets/css/style.css](assets/css/style.css#L84-L110)

A2 Foco visible
- Comentar: navegación por teclado con foco perceptible.
- Código: [assets/css/style.css](assets/css/style.css#L119-L131)

A3 Semántica estructural
- Comentar: `nav`, `main`, `footer`, secciones.
- Código: [pages/index.html](pages/index.html#L17-L47), [pages/index.html](pages/index.html#L48-L267)

A4 Etiquetado de formularios
- Comentar: relación `label` + `input`.
- Código: [pages/login.html](pages/login.html#L49-L76), [pages/salud.html](pages/salud.html#L60-L102)

A5 ARIA en controles
- Comentar: `aria-label` y roles de tabs.
- Código: [pages/alertas.html](pages/alertas.html#L37-L40), [pages/alertas.html](pages/alertas.html#L78-L95)

A6 Orden de tabulación
- Comentar: secuencia DOM natural.
- Código: [pages/login.html](pages/login.html#L47-L85), [pages/medico-comunicacion.html](pages/medico-comunicacion.html#L58-L70)

A7 Tamaño de objetivos táctiles
- Comentar: botones suficientemente grandes.
- Código: [pages/login.html](pages/login.html#L77-L81), [pages/farmaceutico-comunicacion.html](pages/farmaceutico-comunicacion.html#L68-L71)

A8 Texto alternativo e iconos
- Comentar: imágenes con `alt` y uso decorativo de iconos.
- Código: [pages/sobre.html](pages/sobre.html#L61), [pages/index.html](pages/index.html#L20)

A9 Errores comprensibles
- Comentar: mensajes de validación y contexto.
- Código: [assets/js/core.js](assets/js/core.js#L191-L201), [assets/js/doctor.js](assets/js/doctor.js#L17-L24)

A10 Saltar al contenido
- Comentar: acceso directo al `main` en teclado.
- Código: [pages/login.html](pages/login.html#L15), [pages/login.html](pages/login.html#L40), [assets/css/style.css](assets/css/style.css#L119-L131)

Checklist de no-regresión (después de cada bloque)
--------------------------------------------------
- Login correcto por los 3 roles: [assets/js/core.js](assets/js/core.js#L183-L212)
- Redirección por rol correcta: [assets/js/core.js](assets/js/core.js#L126-L181)
- Selector de skin aplica y persiste: [assets/js/core.js](assets/js/core.js#L42-L57)
- Dashboards y formularios siguen operativos:
  - [assets/js/doctor.js](assets/js/doctor.js)
  - [assets/js/pharmacy.js](assets/js/pharmacy.js)
  - [assets/js/patient.js](assets/js/patient.js)
