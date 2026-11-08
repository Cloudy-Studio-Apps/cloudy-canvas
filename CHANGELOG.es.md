# Registro de cambios

Lo que cambia en cada versión de Cloudy Canvas. La versión en inglés está en
[CHANGELOG.md](CHANGELOG.md).

## Sin publicar

### Novedades

- Añade un archivo existente a un proyecto: haz clic derecho en un archivo de Inicio (o usa su menú
  ⋯) y elige Añadir a un proyecto…, o usa Añadir un archivo existente… en el menú Nuevo de un
  proyecto. Elige el proyecto y la carpeta, y el archivo se mueve allí y empieza a usar las
  bibliotecas del proyecto. Sus colores, variables, estilos e imágenes que el proyecto no tiene se
  añaden a una biblioteca, y para cada uno que se llame igual que uno del proyecto eliges usar el
  del proyecto o conservar ambos. Inicio ahora muestra el proyecto y la carpeta de cada archivo.
- Las variables y los estilos de un diseño muestran de dónde vienen: cada biblioteca del proyecto
  que usa el archivo y después los del propio archivo, en el panel, la ventana Variables y los selectores.
  Elige qué bibliotecas del proyecto usa el archivo con el botón Bibliotecas de la sección
  Variables (al desactivar una, tus capas se siguen viendo igual), mueve tus propias variables,
  colecciones y estilos a una biblioteca con clic derecho para que todos los archivos del proyecto
  los reciban, y ve a la carpeta del archivo desde el nombre del proyecto que aparece sobre el
  nombre del archivo.
- Bibliotecas en la página del proyecto: la pestaña Bibliotecas muestra cada biblioteca con sus
  colores, una muestra de tipografía y los archivos que la usan, y la página de una biblioteca
  lista sus colores, estilos de texto, imágenes, SVG y efectos. Crea una biblioteca vacía, con los
  estilos de un archivo, con una copia de otra biblioteca o con un archivo de tokens, añade
  imágenes y SVG, importa estilos de un archivo, renómbrala o elimínala (queda en la papelera) y
  elige si los archivos nuevos la toman. Contenido muestra un tipo de elemento de todas las
  bibliotecas, la portada del proyecto y la página Proyectos usan los colores de la primera
  biblioteca, y Editar en un archivo abre tu último diseño que usa la biblioteca (o uno nuevo) para
  cambiar sus colores y estilos.
- Los archivos de un proyecto comparten sus bibliotecas: cada diseño que creas en un proyecto usa
  sus colores, variables y estilos, cada pizarra sus colores, y al editar un color de la biblioteca en un
  archivo se actualizan todos los demás archivos que lo usan, estén abiertos o no. Cada archivo
  guarda una copia, así que se sigue viendo bien si lo envías solo; si su proyecto se movió, la app
  te pide que lo busques, y los elementos de biblioteca no se pueden editar hasta que lo encuentres.
- Un proyecto nuevo empieza con una biblioteca llamada Sistema de marca, que puedes rellenar al
  crear el proyecto: con las variables y los estilos de un diseño o una pizarra, o con un archivo
  de tokens. Empieza vacía si prefieres construirla más tarde.
- Lo que borras va a la papelera del proyecto: usa Mover a la papelera en un archivo o carpeta, o
  pulsa Suprimir sobre él, y espera en la pestaña Papelera del proyecto, con dónde estaba y cuándo
  se borró, hasta que lo restaures o vacíes la papelera. El proyecto muestra cuánto guarda la
  papelera y nada se borra hasta que tú lo decidas.
- Los ajustes muestran cuánto espacio usan los proyectos y sus papeleras: una nueva página
  Proyectos y almacenamiento elige dónde van los proyectos nuevos, muestra el tamaño de cada
  proyecto y lo que hay en su papelera, y puede vaciar la de un proyecto o la de todos.
- Inicio del proyecto: abre un proyecto para ver y organizar sus archivos en carpetas. Arriba están
  la portada, el icono y el nombre del proyecto, con sus archivos, bibliotecas y la última edición.
  Crea diseños y pizarras en la carpeta donde estás, crea carpetas y ponles color, y arrastra
  archivos y carpetas sobre otras carpetas (o usa Mover a…) para organizarlos; los archivos que
  moviste siguen apareciendo en los archivos recientes de Inicio. La pestaña Archivos muestra los
  más recientes, busca en la carpeta actual y en las de dentro, los ordena y los presenta en
  cuadrícula o en lista. Desde el menú del proyecto puedes renombrarlo, elegir su icono y su color,
  cambiar la portada o exportar todo el proyecto como .zip.
- Proyectos: reúne las pizarras y los diseños de un cliente en una sola carpeta de tu ordenador. La
  nueva página de Proyectos, que se abre desde Inicio, lista tus proyectos con su color, su tamaño y
  cuándo los abriste por última vez; crea uno desde Inicio o desde esa página, abre uno existente
  desde su carpeta o su archivo de proyecto, fija los que más usas y vuelve a encontrar un proyecto
  si su carpeta cambió de sitio. Al hacer doble clic en un archivo de proyecto, se abre.
- El nuevo modo Prototipo enlaza las capas de tus pantallas: elige una capa y la pantalla que abre,
  o arrastra desde una capa hasta una pantalla para enlazarlas, y unas flechas en el lienzo muestran
  cada enlace. Los flujos empiezan en una pantalla y se preparan para un dispositivo, como un
  teléfono, una tableta, una app de escritorio o un sitio web, así que un archivo puede tener los
  flujos de una app y los de un sitio web a la vez. Reproduce un flujo para probarlo en su
  dispositivo, un teléfono, una tableta, una ventana de escritorio o un navegador: los clics y los
  toques siguen los enlaces con sus animaciones, las superposiciones se abren sobre la pantalla y
  un clic fallido muestra dónde están los enlaces.
- El esquema de la base de datos ahora también se exporta a Java: clases simples con un campo por
  columna y los objetos y listas relacionados, o entidades JPA para Spring Boot 4 con solo las
  anotaciones que Spring no da por supuestas. Ambos se escriben para copiarlos, sin paquetes ni
  imports.
- Al seleccionar un marco, un grupo, un vector o varias capas, el panel de propiedades muestra la
  nueva sección Colores de la selección con todos los colores que usan. Cambia un color allí y se
  actualiza en todos los lugares donde aparece a la vez, o selecciona las capas que lo usan, sin
  tener que abrir cada capa.
- Cada área cerrada de un vector ya puede tener su propio relleno: en el modo de
  edición de vectores, haz clic dentro de un área para seleccionarla y cambia su relleno en la
  sección Rellenos. El relleno de un área puede usar un estilo de color o variables, mostrar datos
  y editar su degradado en el lienzo, y sus colores aparecen entre los colores de la página y en el
  asistente de color. Los archivos .fig importados conservan los colores de los vectores de varios
  colores, como logotipos e iconos, en un solo vector editable.
- Los archivos SVG que pegas o sueltas en un diseño ahora se convierten en un solo vector editable:
  cada forma del archivo es un área con su propio color, degradado o contorno, en
  lugar de una imagen plana. Convertir una pegatina en vectores funciona igual y da un solo vector
  que puedes recolorear área por área.
- Los diseños ya pueden tener fuentes de datos, como un archivo CSV o JSON o una API web: la nueva
  pestaña Datos las lista con sus filas, y Actualizar vuelve a leerlas cuando tú lo elijas. Las
  claves de API se quedan en este dispositivo y nunca se guardan en el archivo, y cada clave solo se
  envía al sitio para el que se escribió. La ubicación de un archivo también se queda en este
  dispositivo, así que en otro equipo eliges el archivo una vez allí.
- Las imágenes que nombra una fuente de datos, como enlaces a imágenes, imágenes incrustadas o
  nombres de archivo en una carpeta que eliges, se guardan en el diseño al actualizarla, así que se
  siguen viendo sin conexión y en otros equipos. La pestaña Datos muestra el progreso de la descarga
  y cuántas imágenes no se pudieron guardar.
- Los textos, las imágenes y los colores ya pueden mostrar datos de una fuente: escribe el nombre de
  un campo entre llaves, como {products[0].name}, o enlaza la imagen, el color, el tamaño o la
  opacidad de una capa en la nueva sección Datos del panel de propiedades. Los números, precios y
  fechas se escriben en tu idioma, una capa puede mostrarse solo cuando un campo cumple una
  condición, y una capa puede ocultarse mientras su valor está vacío.
- Selecciona una tarjeta dentro de un marco y elige Repetir esta capa para mostrarla una vez por
  cada fila de una lista, como una tarjeta por producto, alineadas por el marco y filtradas,
  ordenadas y limitadas como elijas en la nueva sección Repetir. Las copias siguen a la tarjeta que
  diseñas y se actualizan con los datos, y cualquier copia se puede separar para editarla por sí
  sola.
- La pestaña Datos ahora señala los datos que no encajan: campos que una capa lee y ya no existen,
  textos demasiado largos para su caja, imágenes que no se pudieron guardar, fuentes que fallaron o
  nunca se actualizaron, y listas que harían demasiadas copias o copias apiladas. Cada fuente
  muestra su cuenta y Seleccionar te lleva a la capa.
- La conexión de un enlace web ahora se edita en un cuadro Conexión que explica con palabras
  sencillas lo que se enviará. Las opciones al final del enlace se convierten en filas, iniciar
  sesión admite una clave de API, un token o un usuario y contraseña sin escribir encabezados a
  mano, los encabezados habituales se ofrecen con lo que hace cada uno, y un POST puede enviar un
  formulario, JSON creado desde filas o escrito a mano, o texto. Probar muestra las filas que da el
  enlace antes de guardar.
- Los datos que guardan sus filas dentro de un objeto, como la lista de productos de una API, ahora
  muestran de dónde vienen las filas y permiten elegir otra lista. Los campos dentro de grupos, como
  las dimensiones de un producto, se muestran como un árbol con un icono para cada tipo, y una lista
  en cada fila, como sus etiquetas o imágenes, puede mostrar todos sus elementos, solo el primero o
  cuántos hay.
- Los elementos de página ya pueden remitir a otra página: añade una Referencia a página, elige la
  sección o la página a la que remite y seguirá mostrando el número correcto aunque las páginas se
  muevan, como "ver página 12". Al hacer doble clic en un elemento de página ahora se edita su
  texto, como "Página {page} de {pages}", en lugar del número que muestra.
- Las secciones de un folleto ya pueden repetirse por cada fila de tus datos: diseña una vez las
  páginas de un producto (una portada, una descripción, una galería que crece con sus fotos) y el
  folleto las crea para cada producto. Las repeticiones se anidan, así que las categorías pueden
  contener sus productos. Mientras diseñas solo se crean las primeras copias, pero los números de
  página y el índice ya las cuentan todas, y la exportación crea todas las páginas; antes pregunta
  si quieres actualizar los datos.
- Los folletos exportados ya se abren con marcadores en la barra lateral del lector de PDF, que siguen
  tus secciones, y cada línea del índice y cada referencia a página te lleva a su página. Los
  archivos de imprenta en CMYK conservan los marcadores.
- Las fuentes de datos ahora pueden leer archivos de Excel y APIs que devuelven sus filas por páginas, y un paso opcional permite elegir y renombrar campos antes de usarlos. Los plugins pueden añadir sus propios tipos de fuente.
- La pestaña Recursos ahora lista tus imágenes: las de cada biblioteca del proyecto que usa el archivo y las que pertenecen solo a este archivo, en grupos que se pueden plegar. Puedes buscarlas, filtrar por imágenes, SVG o iconos, alternar entre cuadrícula y lista, subir más desde el botón más, y arrastrar cualquier imagen al lienzo o hacer doble clic para colocarla. Una imagen de una biblioteca viaja con el archivo, así que el archivo sigue funcionando por sí solo.
- El panel de colores de una pizarra muestra de dónde viene cada color, como en el diseño: una
  sección por cada biblioteca del proyecto que usa la pizarra y después "Colores de la pizarra".
  Los colores de una biblioteca se pueden editar desde la pizarra y el cambio llega a todos los
  archivos del proyecto; elige qué bibliotecas usa la pizarra con el botón Bibliotecas del panel y
  pasa tus propios colores o colecciones a una biblioteca con clic derecho.

### Mejoras

- El texto de las pizarras ahora tiene sus propias opciones: elige un tamaño predefinido o escribe
  uno exacto, ponlo en negrita o cursiva, alinea sus líneas y elige su color, también un color de
  la pizarra. El texto nuevo usa lo que elegiste, y al seleccionar un texto puedes cambiarlo igual.
  Arrastra los tiradores de un texto para darle un ancho fijo: sus líneas se ajustan a él y su
  altura las sigue, y Ancho automático hace que vuelva a crecer con su texto.
- Los marcos ahora funcionan como en otras herramientas de diseño: arrastrar sobre el fondo de un
  marco con capas dibuja un recuadro de selección para elegir las capas que contiene, y el marco
  se selecciona por su nombre. Arrastrar dentro de un marco seleccionado lo mueve, aunque
  presiones sobre una de sus capas, y un clic sin arrastrar sigue seleccionando esa capa. Enter selecciona las capas
  que hay dentro de lo seleccionado y Mayús+Enter la capa que lo contiene, para moverte entre
  niveles sin abrir el panel de capas.

- Los editores de texto del esquema de base de datos y de los diagramas ER ahora muestran sus
  errores, avisos y sugerencias en español cuando la aplicación está en español. Las palabras clave
  del lenguaje que escribes, como Table, Entity o Relation, siguen siendo las mismas en todos los
  idiomas.
- Al importar un archivo .fig o .jam, el progreso y la lista de lo que no se pudo traer tal
  cual ahora se muestran en español cuando la aplicación está en español.

### Correcciones

- Al exportar una página que no es la que está en pantalla, también las exportaciones que hace un
  agente de IA, sus capas mantienen el orden correcto y sus máscaras y efectos se dibujan como en el
  lienzo.

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
