# Registro de cambios

Lo que cambia en cada versión de Cloudy Canvas. La versión en inglés está en
[CHANGELOG.md](CHANGELOG.md).

## Sin publicar

### Novedades

- Exporta pizarras y diseños como SVG, ya sea la selección o toda la página. Las formas siguen siendo
  vectoriales, así que se ven nítidas a cualquier tamaño y se pueden editar en otras herramientas de
  diseño, y tú eliges si el texto se convierte en contornos que se ven igual en todas partes o sigue
  siendo editable.
- Exporta imágenes como WebP, que conserva la transparencia y genera archivos más pequeños que PNG,
  en pizarras y diseños y en las filas de exportación de una capa.
- Los PDF exportados ahora se mantienen nítidos a cualquier zoom y al imprimir, con texto que puedes
  buscar y copiar. Unas nuevas opciones permiten conservar el PDF de tipo imagen, convertir el texto
  en contornos y elegir la calidad de imagen, la resolución, el tamaño de papel, la orientación y
  los márgenes.
- Guarda ajustes de exportación en las capas de un diseño: añade filas con un tamaño, un sufijo para
  el nombre y un tipo de archivo, y expórtalas todas con un clic a una carpeta o a un ZIP. Se quedan
  en el archivo, así que puedes volver a generar los mismos archivos tras cualquier cambio.
- Enmarcar selección en los diseños: Ctrl+Alt+G, o la opción junto a Agrupar selección, envuelve las
  capas seleccionadas en un marco nuevo a su alrededor, sin cambiar cómo se ven.
- Elige si el relleno de un marco aparece al exportar: desactiva Mostrar en exportaciones en Rellenos
  y el marco conserva su relleno en el lienzo, mientras que los archivos exportados lo omiten.

### Mejoras

- El cursor y la selección de un agente ahora se desvanecen unos segundos después de que deja de
  trabajar, para no estorbar en lo que estás haciendo. Vuelven en cuanto retoma el trabajo.

### Correcciones

- Copiar como PNG ahora copia exactamente lo que seleccionaste, sin un margen vacío alrededor.
- Los títulos de los marcos ya no aparecen en imágenes, PDF, SVG ni copias exportadas.

## 0.6.0 - 2026-10-29

### Novedades

- Exporta una pizarra como HTML y envíala a quien quieras: es un solo archivo que se abre en su
  navegador sin instalar nada. Puede moverse por ella y acercarse con la misma nitidez que en la app
  y ver el código de cada tabla o diagrama ER, pero no puede cambiar nada.
- Exporta tu esquema de base de datos como código para Laravel, Angular, NestJS (Prisma o TypeORM),
  MySQL, PostgreSQL o MongoDB, eligiendo la versión que usas. Obtienes los modelos, las
  migraciones, las entidades o los scripts escritos como ese framework espera: una tabla como su
  modelo, o todo el esquema como una carpeta lista para tu proyecto.

### Correcciones

- La ventana Acerca de ya no muestra su texto encima del video de las focas: el video queda solo
  arriba, con la versión, la licencia y los créditos debajo.

## 0.5.0 - 2026-10-27

### Novedades

- Cloudy Canvas ya está disponible en español. El idioma sigue al de tu sistema, o puedes elegirlo
  en Configuración > Idioma y reiniciar al momento para aplicarlo. Las nuevas pizarras, diseños y
  capas se nombran en el idioma de quien los crea.
- Una pantalla de inicio rediseñada: retoma tu último archivo desde la tarjeta Continuar, crea una
  pizarra, un diseño o un catálogo con un clic y explora los archivos recientes en cuadrícula o en
  lista, filtrados por tipo y con búsqueda por nombre, título o descripción.
- Empieza desde una plantilla lista en Inicio: diagrama ER, esquema de base de datos, retrospectiva,
  aplicación móvil, página de aterrizaje de escritorio o folleto A4.
- Si algo falla, la aplicación ahora muestra una página de error clara con botones para recargar,
  volver a Inicio o copiar un código de error para compartirlo al informar del problema.
- Consulta qué cambió en cada versión: los cambios de una nueva versión se muestran antes de
  actualizar, la aplicación te avisa una vez después de actualizarse y el historial completo está en
  Registro de cambios, dentro de Acerca de y Configuración.

### Mejoras

- Los temas de Configuración > Apariencia se agrupan por familia, con un selector Claro/Oscuro en
  cada tarjeta, para encontrar antes la variante que buscas.
- La pantalla de bienvenida que aparece antes de tener archivos recientes ahora incluye un botón
  Abrir archivo, para abrir una pizarra, un diseño o un archivo de Figma sin conocer el atajo ni
  arrastrarlo a la ventana.

### Correcciones

- Un plugin que no se puede cargar, como uno cuya carpeta enlazada se eliminó, ahora muestra el
  motivo en Configuración y se puede quitar desde allí.
