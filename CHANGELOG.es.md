# Registro de cambios

Lo que cambia en cada versión de Cloudy Canvas. La versión en inglés está en
[CHANGELOG.md](CHANGELOG.md).

## Sin publicar

### Novedades

- Los diseños ya pueden tener fuentes de datos, como un archivo CSV o JSON o una API web: la nueva
  pestaña Datos las lista con sus filas, y Actualizar vuelve a leerlas cuando tú lo elijas. Las
  claves de API se quedan en este dispositivo y nunca se guardan en el archivo, y cada clave solo se
  envía al sitio para el que se escribió. La ubicación de un archivo también se queda en este
  dispositivo, así que en otro equipo eliges el archivo una vez allí.

## 0.8.0 - 2026-11-04

### Novedades

- En pantallas táctiles, pellizca con dos dedos para hacer zoom en el lienzo y arrastra con dos dedos
  para moverlo, con cualquier herramienta seleccionada.
- Los folletos pueden tener maestras: una cabecera y un pie diseñados una vez, con un marco para
  las páginas izquierdas y otro para las derechas, y repetidos en cada página que la usa. El texto
  de una maestra puede mostrar el número de página, el total de páginas, el título del folleto, la
  sección y la fecha, y cada página elige su maestra o ninguna. En el modo Diseño, las capas de la
  maestra están bloqueadas y marcadas para que todas las páginas sigan iguales, y Separar hace una
  editable en una sola página. Al duplicar un folleto se conservan sus maestras.
- Los folletos pueden dividirse en secciones y subsecciones, con tantos niveles como haga falta. En
  la lista de páginas del modo Catálogo cada sección es una carpeta con sus páginas: se puede
  plegar, arrastrar para mover la sección entera, soltar páginas en ella y, con clic derecho,
  añadir una página o una subsección, subirla o bajarla de nivel, renombrarla o quitarla. La
  numeración puede reiniciarse o pasar a números romanos en una sección, con las portadas
  contadas, ocultas o sin contar.
- Una cabecera puede mostrar el nombre de la sección solo o con las secciones en las que está, como
  «Túneles › Shotcrete».
- Una lista de elementos de página listos (número de página, «Página 3 de 24», título, sección,
  fecha e índice) se puede añadir con un clic o arrastrar a una maestra o una página, ya colocados
  en su margen.
- El elemento de índice lista las secciones del folleto, con las subsecciones sangradas, o sus
  páginas, con sus números de página, y se actualiza cuando las páginas se mueven. Las
  comprobaciones avisan cuando pasa del margen inferior de su página.
- Cada folleto tiene su propio idioma, así que un diseño puede tener una versión en español y otra
  en francés del mismo catálogo. Las fechas, los elementos de página y el PDF lo siguen, y al
  cambiarlo se reescriben las cabeceras y los pies ya colocados, salvo que hayas editado su texto.
  Cada folleto de una página conserva sus propias cabeceras y pies.
- En el modo Catálogo, la lista de páginas tiene un menú para añadir una página en blanco o una
  sección nueva: desde el botón «+», con clic derecho en la lista o con clic derecho en una página
  para añadirlas justo después.

### Mejoras

- En el modo Catálogo, Suprimir ahora se llama «Sacar del folleto», ya que deja el marco en el
  lienzo. La nueva opción «Eliminar página y marco» (Mayús+Supr) también quita el marco del diseño,
  en un solo paso de deshacer, salvo que otro folleto de la página lo siga imprimiendo.
- En la lista de páginas de un folleto, Ctrl (⌘ en Mac) + clic y Mayús + clic seleccionan varias
  páginas, que luego puedes arrastrar juntas, y Alt+↑/↓ mueve las páginas seleccionadas un lugar
  hacia arriba o hacia abajo.
- En el editor de diseño, las personas y agentes que trabajan en el archivo aparecen ahora como una
  columna de avatares en la barra lateral izquierda, sobre el botón de Agentes, para que la parte
  superior del panel de propiedades siga ordenada aunque se unan muchos.

### Correcciones

- Los trazos rápidos con el bolígrafo ya no se rellenan como formas negras sólidas en los giros
  cerrados, y siguen mejor tu mano.
- En la lista de páginas de un folleto, ahora puedes soltar una página sobre una página en blanco
  para que ocupe su lugar, sobre el encabezado de un pliego para que lo empiece (o sobre
  «Contraportada» para que sea la contraportada) y debajo de la última página para llevarla al
  final. Soltar la contraportada sobre la página en blanco añadida antes de ella la convierte en una
  última página normal, sin contraportada. Antes, soltarla ahí no hacía nada.

## 0.7.0 - 2026-11-01

### Novedades

- Los diagramas ER tienen menús nuevos basados en imágenes. En lugar de listas desplegables y códigos
  como (0,n), eliges cuántos con puntos, ves cada opción tal como se dibuja y compruebas qué hace en
  las tablas: haz clic en una fila y una línea muestra la clave que añade tu relación y dónde va.
  Haz clic en cualquier forma nombrada en un menú para seleccionarla y usa el botón de volver para
  regresar.
- Los GIF animados ahora se reproducen en pizarras y diseños, también en rellenos de imagen,
  recortes y mosaicos, y en las pizarras exportadas como HTML. Añádelos soltando el archivo o
  eligiéndolo en el selector de imágenes, ya que un GIF pegado desde otra app llega como imagen fija.
  Se pausan cuando están fuera de la pantalla, y puedes desactivarlos en Ajustes › Apariencia.
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
- Exporta un PDF con una página por sección en una pizarra, o por marco principal en un diseño, para
  que los archivos grandes se sigan leyendo bien. Lo que quede fuera va en una última página.
- Elige si el relleno de un marco aparece al exportar: desactiva Mostrar en exportaciones en Rellenos
  y el marco conserva su relleno en el lienzo, mientras que los archivos exportados lo omiten.
- Lleva tus diagramas a archivos Markdown: exporta un diagrama ER o un esquema de base de datos como
  un bloque Mermaid y pégalo en un README, una wiki o una nota. Los diagramas ER conservan sus
  entidades, relaciones y atributos, y GitHub, GitLab, Notion y Obsidian los dibujan por ti. Lo
  encontrarás en la barra de herramientas del modo ER y en Exportar código.
- Elige qué exportar de las variables de un diseño: un nuevo diálogo, en la ventana Variables y en
  Sistema de diseño, te permite escoger el formato, marcar las colecciones, los grupos o los estilos
  que quieres incluir, ver el archivo y copiarlo o guardarlo. Todo aquello de lo que dependen las
  variables marcadas se incluye también, para que el archivo siga funcionando.
- Copiar como SVG: copia tu selección en una pizarra o un diseño como código SVG, desde el menú del
  botón derecho, y pégala directamente en tu código o en otras herramientas de diseño.
- Exportar todo en Diseño: desde el menú principal, exporta todos los marcos de una página o de todo
  el archivo a una carpeta o a un ZIP. Las capas con sus propios ajustes de exportación los usan, y
  las demás usan el predeterminado que elijas. Con todas las páginas, cada una tiene su propia carpeta.
- Los folletos ya vienen listos para cortar: los PDF incluyen sangrado y marcas de corte, con las cajas
  de página que esperan las imprentas, y las capas colocadas más allá del borde llegan al sangrado.
  Ajusta el sangrado o quita las marcas en la sección Impresión del panel de Catálogo.
- Exporta folletos en CMYK real: carga el perfil .icc de tu imprenta en la sección Impresión, y el
  texto, las formas, los degradados y las imágenes se convierten con él, mientras que el texto negro
  puro se imprime solo con tinta negra. El perfil se queda en el archivo, así que puedes volver a
  exportar el mismo folleto en cualquier momento.
- Los folletos CMYK ahora se exportan como PDF/X para las imprentas: PDF/X-4 con el tipo Nítido y
  PDF/X-1a con Imagen, cada uno con el perfil de impresión dentro. Las comprobaciones avisan si un
  folleto CMYK no tiene perfil y si una capa termina justo en el borde, y Mostrar márgenes también
  dibuja el sangrado.

### Mejoras

- La aplicación ahora muestra una pantalla de inicio con la foca watona mientras arranca, en lugar
  de una ventana vacía.
- La aplicación arranca mucho más rápido: Inicio se abre primero y las pizarras y los diseños se
  cargan detrás, así que están listos cuando abres uno. Si usas plugins, estos se siguen cargando
  antes de que aparezca Inicio.
- El cursor y la selección de un agente ahora se desvanecen unos segundos después de que deja de
  trabajar, para no estorbar en lo que estás haciendo. Vuelven en cuanto retoma el trabajo.
- Los PDF de folletos y sistemas de diseño ahora son nítidos a cualquier zoom, con texto que puedes
  buscar y copiar. Los folletos tienen un ajuste de tipo de PDF para las imprentas que piden páginas
  planas de imagen.
- Al abrir un diseño con una fuente que este equipo no tiene, ahora se te indica qué fuentes faltan,
  para que el texto que se mueva no te tome por sorpresa.

### Correcciones

- En los diagramas ER, las líneas de una jerarquía hacia sus hijos ahora salen de la punta del
  triángulo, así que ya no lo atraviesan, y el arco de exclusividad crece para cubrir todas las líneas
  al mover los hijos.
- Copiar como PNG ahora copia exactamente lo que seleccionaste, sin un margen vacío alrededor.
- Los títulos de los marcos ya no aparecen en imágenes, PDF, SVG ni copias exportadas.
- En Sistema de diseño, al hacer clic en una zona vacía del lienzo la sección desaparece del panel
  lateral y vuelve la vista general, con los botones de exportación.
- El texto de los PDF nítidos ahora siempre se puede buscar y copiar. Antes se omitían las líneas con
  caracteres como €, comillas tipográficas, griego, cirílico, japonés o emojis.
- Los atajos de teclado ahora funcionan en teclados donde una tecla necesita AltGr u Opción, como
  los atajos de orden de capas [ y ] en teclados españoles en Windows y macOS. Desbloquear todo
  también funciona en macOS.
- En Windows, F5, Ctrl+R y Actualizar en el menú contextual ya no recargan la app ni pierden los
  cambios sin guardar, y los atajos de imprimir o buscar ya no abren ventanas del navegador.
- Los archivos que sueltas en el lienzo ahora caen donde los sueltas en Mac con pantalla Retina y en
  pantallas Linux de alta resolución.
- En macOS, Cmd+Q ahora pregunta por los cambios sin guardar y termina de guardar antes de cerrar la
  app.
- Pellizcar en el trackpad de un Mac ahora hace zoom en el lienzo donde está el puntero.
- Reordenar páginas, páginas de folleto y categorías de la guía de estilo arrastrándolas ahora
  funciona en Windows y macOS, y las listas largas se desplazan mientras arrastras.
- Reordenar efectos y mover modos de variables entre grupos arrastrándolos ahora funciona en Windows
  y macOS.
- Soltar una imagen en el asistente de color ahora funciona en la app de escritorio.
- El lienzo se mantiene nítido cuando mueves la ventana a una pantalla con otra escala.
- Guardar ya no falla cuando un antivirus o una app de sincronización como OneDrive retiene el
  archivo un momento.
- En Ubuntu y Debian, los archivos de pizarra y diseño ahora se reconocen y se abren en Cloudy
  Canvas con doble clic. Los Mac en español ahora abren la app en español.
- Exportar capas con nombres de archivos del sistema de Windows, como CON, ya no falla, y el
  selector de fuentes de macOS ya no muestra fuentes ocultas del sistema.
- El lienzo ahora se recupera solo cuando se reinicia el controlador gráfico, por ejemplo al
  despertar de la suspensión.

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
