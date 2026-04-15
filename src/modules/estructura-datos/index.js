/**
 * MÓDULO: Estructura de Datos
 * 
 * Enseña los fundamentos de bases de datos:
 * tablas, campos, claves primarias/foráneas y relaciones.
 */
import { Module, lesson, concept, col, dataType, term } from '../../core/Module.js';

// ─── LECCIONES ────────────────────────────────────────

const conceptosBasicos = lesson('conceptos-basicos', '¿Qué es una Base de Datos?')
  .description('Conceptos fundamentales: tablas, campos, registros')
  .duration('5 min')
  .text(`Imaginate que tenés una <b>agenda de contactos</b> en tu celular. Tenés nombres, números de teléfono, emails... todo organizado. ¡Eso es básicamente una base de datos!`)
  .info('Una <b>base de datos</b> es una colección organizada de información que se puede acceder, gestionar y actualizar fácilmente.', { icon: '💡' })
  .heading('Las partes de una Base de Datos')
  .text('Una base de datos se compone de <b>tablas</b>, y cada tabla tiene:')
  .conceptCards([
    concept('📋', 'Tabla', 'Organiza datos sobre UN tema. Ej: tabla "Alumnos", tabla "Materias".', 'primary'),
    concept('↔️', 'Columna (Campo)', 'Cada categoría de información. Ej: "Nombre", "Edad", "Nota".', 'secondary'),
    concept('↕️', 'Fila (Registro)', 'Cada entrada individual. Cada alumno es una fila diferente.', 'accent'),
    concept('📦', 'Celda', 'El cruce de una fila con una columna. Un dato específico.', 'warning'),
  ])
  .heading('Ejemplo Visual')
  .text('Mirá esta tabla de <b>Alumnos</b>. Cada columna tiene un color diferente para que identifiques cada parte:')
  .tableExample('Alumnos', [
    col('ID', 'INT', { isPK: true }),
    col('Nombre', 'VARCHAR'),
    col('Edad', 'INT'),
    col('Curso', 'VARCHAR'),
  ], [
    [1, 'Juan Pérez', 20, '1ro A'],
    [2, 'María García', 21, '1ro B'],
    [3, 'Carlos López', 19, '1ro A'],
  ])
  .info('¿Ves el campo <b>ID</b> con la llave 🔑? Es la <b>Clave Primaria</b>: un número único que identifica a cada alumno. ¡No puede repetirse!', { variant: 'secondary', icon: '🔑' })
  .heading('Tipos de Datos')
  .text('Cada campo tiene un <b>tipo de dato</b> que define qué puede guardar:')
  .dataTypes([
    dataType('INT', 'Entero', '1, 42, 1000', '🔢'),
    dataType('VARCHAR', 'Texto', '"Juan", "Hola"', '📝'),
    dataType('FLOAT', 'Decimal', '3.14, 9.5', '🔣'),
    dataType('DATE', 'Fecha', '2024-03-15', '📅'),
    dataType('BOOLEAN', 'Sí/No', 'true, false', '✅'),
  ])
  .quiz(
    '¿Cuál es la diferencia entre una FILA y una COLUMNA?',
    [
      'Son lo mismo, solo cambia el nombre',
      'La fila es un registro completo, la columna es un tipo de dato',
      'La columna tiene los datos y la fila los nombres',
      'No hay diferencia en bases de datos',
    ],
    1,
    '¡Correcto! Cada <b>fila</b> es un registro (ej: un alumno), y cada <b>columna</b> es un campo/categoría (ej: Nombre, Edad).'
  )
  .build();

// ─── TABLA INTERACTIVA ───────────────────────────────

const tablaInteractiva = lesson('tabla-interactiva', 'Tabla Interactiva')
  .description('Creá y editá tu propia tabla de datos')
  .duration('10 min')
  .text('Ahora es tu turno. Vas a <b>crear y editar tu propia tabla</b> de datos. Tocá las celdas para editar, usá el botón <b>+</b> para agregar filas, y el botón <b>+</b> en las columnas para agregar nuevos campos.')
  .info('Tocá cualquier celda para editarla. Usá el <b>+</b> de abajo para agregar filas y el <b>+</b> de la derecha para agregar columnas.', { variant: 'accent', icon: '👆' })
  .interactiveTable('Mi Primera Tabla', [
    col('ID', 'INT', { isPK: true, autoIncrement: true }),
    col('Producto', 'VARCHAR', { placeholder: 'Ej: Manzana' }),
    col('Precio', 'FLOAT', { placeholder: 'Ej: 150.50' }),
    col('Stock', 'INT', { placeholder: 'Ej: 25' }),
  ], [
    [1, 'Coca Cola', 1500, 50],
    [2, 'Pan', 800, 30],
  ], { canAddColumns: true })
  .heading('¿Para qué sirve cada parte?')
  .text('En tu tabla podés ver cómo funciona todo junto:')
  .conceptCards([
    concept('🔑', 'ID (Clave Primaria)', 'Se genera automáticamente. Cada producto tiene un número único. Nunca se repite.', 'warning'),
    concept('📝', 'Campos de texto', '"Producto" guarda texto (VARCHAR). Puede tener letras, números y espacios.', 'primary'),
    concept('🔢', 'Campos numéricos', '"Precio" usa decimales (FLOAT) y "Stock" usa enteros (INT).', 'secondary'),
  ])
  .heading('Así se vería en código SQL')
  .code('sql', `CREATE TABLE Productos (
  ID    INT PRIMARY KEY AUTO_INCREMENT,
  Producto  VARCHAR(100),
  Precio    FLOAT,
  Stock     INT
);

-- Insertar un registro:
INSERT INTO Productos (Producto, Precio, Stock)
VALUES ('Coca Cola', 1500, 50);`)
  .info('No te preocupes por memorizar SQL ahora. Lo importante es que entiendas la <b>estructura</b>: tabla → columnas → filas → celdas.', { icon: '📌' })
  .build();

// ─── CLAVES Y RELACIONES ─────────────────────────────

const clavesRelaciones = lesson('claves-relaciones', 'Claves y Relaciones')
  .description('Clave primaria, foránea y relaciones entre tablas')
  .duration('8 min')
  .text('Las tablas no viven solas. En una base de datos real, las tablas se <b>conectan</b> entre sí. ¿Cómo? ¡Con claves!')
  .heading('🔑 Clave Primaria (Primary Key)')
  .text('Es un campo que identifica de forma <b>ÚNICA</b> a cada registro. Como tu DNI: no hay dos personas con el mismo.')
  .info('Reglas de la Clave Primaria:<br>• No puede repetirse<br>• No puede estar vacía (NULL)<br>• Cada tabla debe tener una', { variant: 'warning', icon: '⚠️' })
  .heading('🔗 Clave Foránea (Foreign Key)')
  .text('Es un campo que <b>apunta</b> a la clave primaria de otra tabla. Es como un link que conecta datos relacionados.')
  .text('Mirá este ejemplo: tenemos una tabla de <b>Alumnos</b> y otra de <b>Inscripciones</b>. La tabla Inscripciones tiene un campo "alumno_id" que apunta al ID del alumno:')
  .tableExample('Alumnos', [
    col('ID', 'INT', { isPK: true }),
    col('Nombre', 'VARCHAR'),
  ], [
    [1, 'Juan'],
    [2, 'María'],
  ])
  .tableExample('Inscripciones', [
    col('ID', 'INT', { isPK: true }),
    col('alumno_id', 'INT', { isFK: true }),
    col('Materia', 'VARCHAR'),
  ], [
    [1, 1, 'Matemáticas'],
    [2, 1, 'Programación'],
    [3, 2, 'Matemáticas'],
  ])
  .info('¿Ves el <b>alumno_id</b>? Los valores 1 y 2 hacen referencia a los IDs de la tabla Alumnos. Así se conectan las tablas.', { variant: 'secondary', icon: '🔗' })
  .heading('Tipos de Relaciones')
  .conceptCards([
    concept('1️⃣', 'Uno a Uno (1:1)', 'Cada registro de A se relaciona con exactamente UNO de B. Ej: Persona ↔ DNI.', 'primary'),
    concept('📑', 'Uno a Muchos (1:N)', 'Un registro de A se relaciona con MUCHOS de B. Ej: Un alumno → muchas inscripciones.', 'secondary'),
    concept('🔀', 'Muchos a Muchos (N:N)', 'Muchos de A se relacionan con muchos de B. Requiere una tabla intermedia. Ej: Alumnos ↔ Materias.', 'accent'),
  ])
  .quiz(
    'En el ejemplo anterior, ¿qué tipo de relación hay entre Alumnos e Inscripciones?',
    ['Uno a Uno (1:1)', 'Uno a Muchos (1:N)', 'Muchos a Muchos (N:N)', 'No hay relación'],
    1,
    '¡Exacto! Un alumno puede tener MUCHAS inscripciones (Juan tiene 2), pero cada inscripción pertenece a UN solo alumno. Eso es 1:N.'
  )
  .build();

// ─── EJERCICIOS ──────────────────────────────────────

const ejerciciosTablas = lesson('ejercicios-tablas', 'Ejercicios Prácticos')
  .description('Poné a prueba lo que aprendiste')
  .duration('10 min')
  .text('¡Hora de practicar! Respondé estas preguntas para reforzar lo aprendido sobre tablas, claves y relaciones.')
  .quiz('¿Qué es una Clave Primaria?', [
    'El primer campo de cualquier tabla',
    'Un campo que identifica de forma única a cada registro',
    'La contraseña de la base de datos',
    'Un campo que siempre es un número',
  ], 1, 'La Clave Primaria (PK) es un identificador único. No se repite y no puede estar vacío.')
  .quiz('¿Cuál de estos es un tipo de dato correcto para guardar un nombre?', [
    'INT', 'BOOLEAN', 'VARCHAR', 'FLOAT',
  ], 2, 'VARCHAR (Variable Character) es para texto. INT es para números enteros, BOOLEAN para verdadero/falso, y FLOAT para decimales.')
  .quiz('Tenés una tabla "Libros" y otra "Autores". Un autor puede escribir muchos libros. ¿Qué tipo de relación es?', [
    'Uno a Uno (1:1)', 'Uno a Muchos (1:N)', 'Muchos a Muchos (N:N)', 'No necesitan relación',
  ], 1, 'Es 1:N: UN autor → MUCHOS libros. La tabla Libros tendría un campo "autor_id" como clave foránea.')
  .quiz('¿Para qué sirve una Clave Foránea (FK)?', [
    'Para encriptar los datos de la tabla',
    'Para conectar una tabla con otra tabla',
    'Para eliminar registros automáticamente',
    'Para ordenar los datos alfabéticamente',
  ], 1, '¡Correcto! La FK crea una conexión (relación) entre dos tablas, referenciando la Clave Primaria de otra tabla.')
  .heading('🏆 Desafío Final')
  .text('Creá una tabla para un <b>sistema de notas</b>. Pensá: ¿qué columnas necesitás? ¿Cuál sería la clave primaria? ¿Necesitás claves foráneas?')
  .interactiveTable('Tu Tabla de Notas', [
    col('ID', 'INT', { isPK: true, autoIncrement: true }),
    col('Alumno', 'VARCHAR', { placeholder: 'Nombre...' }),
    col('Materia', 'VARCHAR', { placeholder: 'Materia...' }),
    col('Nota', 'FLOAT', { placeholder: '1-10' }),
  ], [], { canAddColumns: true })
  .build();

// ─── GLOSARIO ────────────────────────────────────────

const glossary = [
  term('Base de Datos', 'Colección organizada de datos que se pueden acceder, gestionar y actualizar fácilmente. Ejemplo: la lista de contactos de tu celular.', 'fundamentos'),
  term('Tabla', 'Estructura que organiza datos en filas y columnas, similar a una planilla de cálculo. Cada tabla almacena información sobre un tipo de cosa (alumnos, materias, etc.).', 'fundamentos'),
  term('Campo (Columna)', 'Cada categoría de información dentro de una tabla. Por ejemplo: "Nombre", "Edad", "Email". Define QUÉ tipo de dato se guarda.', 'fundamentos'),
  term('Registro (Fila)', 'Cada entrada individual dentro de una tabla. Si la tabla es "Alumnos", cada fila es un alumno diferente con todos sus datos.', 'fundamentos'),
  term('Clave Primaria (PK)', 'Un campo especial que identifica de manera ÚNICA a cada registro. Como el DNI de una persona: no puede repetirse. Ejemplo: ID del alumno.', 'claves'),
  term('Clave Foránea (FK)', 'Un campo que conecta una tabla con otra, referenciando la clave primaria de la otra tabla. Es como un "link" entre tablas.', 'claves'),
  term('Relación', 'Conexión lógica entre dos tablas. Hay tres tipos: uno a uno (1:1), uno a muchos (1:N) y muchos a muchos (N:N).', 'claves'),
  term('Tipo de Dato', 'Define qué clase de valor puede almacenar un campo: texto (VARCHAR), número entero (INT), número decimal (FLOAT), fecha (DATE), verdadero/falso (BOOLEAN).', 'fundamentos'),
  term('SQL', 'Lenguaje estándar para gestionar bases de datos. Permite crear tablas, insertar datos, hacer consultas y más. Significa "Structured Query Language".', 'lenguajes'),
  term('Consulta (Query)', 'Instrucción que le das a la base de datos para obtener, modificar o eliminar información. Ejemplo: "dame todos los alumnos con nota mayor a 7".', 'operaciones'),
  term('Índice', 'Estructura que acelera las búsquedas en una tabla, como el índice de un libro que te dice en qué página está cada tema.', 'optimización'),
  term('Normalización', 'Proceso de organizar las tablas de una base de datos para reducir la redundancia (datos repetidos) y mejorar la integridad de los datos.', 'optimización'),
];

// ─── EXPORT MODULE ───────────────────────────────────

export default new Module({
  id: 'estructura-datos',
  icon: '📊',
  color: 'primary',
  title: 'Estructura de Datos',
  description: 'Tablas, campos, claves primarias y relaciones entre datos',
  order: 1,
  lessons: [conceptosBasicos, tablaInteractiva, clavesRelaciones, ejerciciosTablas],
  glossary,
});
