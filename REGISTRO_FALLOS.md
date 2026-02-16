REGISTRO DE FALLOS Y OBSERVACIONES
==================================

Usar este formato para anotar problemas detectados durante pruebas.

ID: F-001
Fecha:
Rol:
Pantalla:
Paso:
Resultado esperado:
Resultado real:
Severidad (Baja/Media/Alta):
Skin:
Captura:
Notas:

ID: F-002
Fecha:
Rol:
Pantalla:
Paso:
Resultado esperado:
Resultado real:
Severidad (Baja/Media/Alta):
Skin:
Captura:
Notas:

ID: F-003
Fecha: 2026-02-09
Rol: General
Pantalla: Inicio
Paso: Cambiar skin desde el selector
Resultado esperado: cambio visual consistente y control discreto
Resultado real: selector aparece en medio de la pantalla y la interfaz se percibe basica
Severidad (Baja/Media/Alta): Media
Skin: Base
Captura: (adjunta)
Notas: Estudio: Usabilidad (control fuera de contexto)

ID: F-004
Fecha: 2026-02-09
Rol: General
Pantalla: Inicio
Paso: Revisar tarjetas de funcionalidades con skins 2 y 3
Resultado esperado: cards con mismo alto y alineacion uniforme
Resultado real: cards con alturas diferentes en skins 2 y 3
Severidad (Baja/Media/Alta): Baja
Skin: Mejorada/Accesible
Captura: (adjunta)
Notas: Estudio: Responsive / Usabilidad (consistencia visual)

ID: F-005
Fecha: 2026-02-09
Rol: General
Pantalla: Inicio
Paso: Ver cuadro derecho del hero
Resultado esperado: informacion legible
Resultado real: texto no se ve por bajo contraste
Severidad (Baja/Media/Alta): Alta
Skin: Base
Captura: (adjunta)
Notas: Estudio: Usabilidad + Accesibilidad (contraste)

ID: F-006
Fecha: 2026-02-09
Rol: General
Pantalla: Analisis
Paso: Navegar a Analisis
Resultado esperado: solo videos del estudio
Resultado real: Salud personal estaba dentro de Analisis
Severidad (Baja/Media/Alta): Media
Skin: Todas
Captura: (adjunta)
Notas: Estudio: Usabilidad (arquitectura de la informacion). Ya corregido.

ID: F-007
Fecha: 2026-02-09
Rol: Paciente
Pantalla: Dashboard
Paso: Revisar graficos de adherencia
Resultado esperado: graficos claros y bien ubicados
Resultado real: graficos descolocados y saturan la vista
Severidad (Baja/Media/Alta): Media
Skin: Todas
Captura: (adjunta)
Notas: Estudio: Usabilidad (sobrecarga). Ya corregido.

 - Verificar mapas web de los 3 roles. ok
 - añadir dentro de cada usuario mientras estan conectados el rol que asumen dentro de la app para que quede claro en todo momento. ok 
- Boton nueva dispensacion en farmaceutico tampoco hace nada solo muestra un alert pero no es nada util. los graficos de paciente creo que no funcionan correctament no estoy seguro del todo alomejor si y soy yo que no lo he interpretado correctamente. ok 
Estos cambios de skins deben de estar integradas en el login en lugar de en el navbar. ok

necesitamos modificar las skins de manera que: 1 sea la buena la que nos da "buena accesibilidad y usabilidad", la segunda skins debe ser no usable "mala usabilidad" y la tercera tiene que ser no accesible "mala accesibilidad" para hacer las comparaciones entre ellas para los estudios de accesibilidad y usabilidad. Para ello no vale solo con tocar colores o css debemos de meternos en el codigo html. ok