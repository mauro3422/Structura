/**
 * Módulo: Estructura de Datos
 *
 * Enseña los fundamentos de bases de datos:
 * tablas, campos, claves primarias/foráneas y relaciones.
 */
import { Module, lesson, concept, col, dataType, term } from '../../core/Module.ts';

const conceptosBasicos = lesson('conceptos-basicos', '¿Qué es una Base de Datos?')
  .description('Conceptos fundamentales: tablas, campos y registros')
  .duration('5 min')
  .text('Imaginate una agenda de contactos en tu celular: nombres, teléfonos y mails organizados. Eso es básicamente una base de datos.')
  .info('Una base de datos es una colección organizada de información que se puede acceder, gestionar y actualizar fácilmente.', { icon: '💡' })
  .heading('Las partes de una base de datos')
  .conceptCards([
    concept('📋', 'Tabla', 'Organiza datos sobre un mismo tema.'),
    concept('↔️', 'Columna', 'Cada categoría de información.'),
    concept('↕️', 'Fila', 'Cada registro o entrada individual.'),
    concept('🔲', 'Celda', 'El cruce de una fila con una columna.'),
  ])
  .heading('Ejemplo visual')
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
  .info('El campo ID con la llave es la **clave primaria**: identifica a cada alumno de forma única.', { variant: 'secondary', icon: '🔑' })
  .heading('Tipos de datos')
  .dataTypes([
    dataType('INT', 'Entero', '1, 42, 1000', '🔢'),
    dataType('VARCHAR', 'Texto', '"Juan", "Hola"', '📝'),
    dataType('FLOAT', 'Decimal', '3.14, 9.5', '🔣'),
    dataType('DATE', 'Fecha', '2024-03-15', '📅'),
    dataType('BOOLEAN', 'Sí/No', 'true, false', '✅'),
  ])
  .quiz(
    '¿Cuál es la diferencia entre una fila y una columna?',
    [
      'Son lo mismo',
      'La fila es un registro completo y la columna es un campo',
      'La columna tiene los datos y la fila los nombres',
      'No hay diferencia',
    ],
    1,
    'Correcto: una fila es un registro y una columna es una categoría de datos.',
  )
  .build();

const tablaInteractiva = lesson('tabla-interactiva', 'Tabla Interactiva')
  .description('Creá y editá tu propia tabla de datos')
  .duration('10 min')
  .text('Ahora es tu turno. Vas a crear y editar tu propia tabla de datos.')
  .info('Tocá cualquier celda para editarla. Usá el + de abajo para agregar filas y el + de la derecha para agregar columnas.', { variant: 'accent', icon: '👆' })
  .interactiveTable('Mi Primera Tabla', [
    col('ID', 'INT', { isPK: true, autoIncrement: true }),
    col('Producto', 'VARCHAR', { placeholder: 'Ej: Manzana' }),
    col('Precio', 'FLOAT', { placeholder: 'Ej: 150.50' }),
    col('Stock', 'INT', { placeholder: 'Ej: 25' }),
  ], [
    [1, 'Coca Cola', 1500, 50],
    [2, 'Pan', 800, 30],
  ], { canAddColumns: true })
  .heading('Cómo se ve en SQL')
  .code('sql', `CREATE TABLE Productos (
  ID       INT PRIMARY KEY AUTO_INCREMENT,
  Producto VARCHAR(100),
  Precio   FLOAT,
  Stock    INT
);

INSERT INTO Productos (Producto, Precio, Stock)
VALUES ('Coca Cola', 1500, 50);`)
  .build();

const clavesRelaciones = lesson('claves-relaciones', 'Claves y Relaciones')
  .description('Clave primaria, foránea y relaciones entre tablas')
  .duration('8 min')
  .text('Las tablas no viven solas. En una base de datos real, las tablas se conectan entre sí.')
  .heading('🔑 Clave primaria (Primary Key)')
  .text('Es un campo que identifica de forma única a cada registro. Como tu DNI.')
  .info('Reglas de la clave primaria:<br>• No puede repetirse<br>• No puede estar vacía (NULL)<br>• Cada tabla debe tener una', { variant: 'warning', icon: '⚠️' })
  .heading('🗝️ Clave foránea (Foreign Key)')
  .text('Es un campo que apunta a la clave primaria de otra tabla.')
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
  .info('La clave foránea crea la conexión entre tablas relacionadas.', { variant: 'secondary', icon: '🔗' })
  .quiz(
    'En el ejemplo anterior, ¿qué tipo de relación hay entre Alumno e Inscripción?',
    ['Uno a Uno (1:1)', 'Uno a Muchos (1:N)', 'Muchos a Muchos (N:N)'],
    1,
    'Un alumno puede tener muchas inscripciones, así que es una relación 1:N.',
  )
  .build();

const ejerciciosTablas = lesson('ejercicios-tablas', 'Ejercicios')
  .description('Poné a prueba lo que aprendiste')
  .duration('6 min')
  .text('Hora de practicar. Respondé estas preguntas rápidas para repasar claves, filas y columnas.')
  .quiz('¿Qué es una clave primaria?', [
    'Un campo que identifica de forma única a cada registro',
    'La contraseña de la base de datos',
    'Un campo que siempre es un número',
  ], 0, 'Correcto: una clave primaria identifica de forma única a cada registro.')
  .quiz('¿Cuál de estos es un tipo de dato común?', [
    'SILLA',
    'COLOR',
    'VARCHAR',
  ], 2, 'VARCHAR es un tipo de dato de texto muy común.')
  .quiz('¿Para qué sirve una clave foránea?', [
    'Para eliminar registros automáticamente',
    'Para conectar tablas relacionadas',
    'Para ordenar los datos alfabéticamente',
  ], 1, 'Correcto: la clave foránea conecta tablas relacionadas.')
  .heading('Desafío final')
  .text('Creá una tabla para un sistema de biblioteca con libros, autores y préstamos.')
  .build();

const glossary = [
  term('Base de Datos', 'Colección organizada de información almacenada de forma estructurada.', 'fundamentos'),
  term('Tabla', 'Estructura que organiza datos en filas y columnas.', 'fundamentos'),
  term('Campo', 'Cada categoría de información dentro de una tabla.', 'fundamentos'),
  term('Registro', 'Una fila completa con datos de un elemento.', 'fundamentos'),
  term('Clave Primaria', 'Campo que identifica de forma única a cada registro.', 'claves'),
  term('Clave Foránea', 'Campo que conecta una tabla con otra.', 'claves'),
  term('Relación', 'Conexión lógica entre dos tablas.', 'claves'),
  term('Tipo de Dato', 'Define qué clase de valor puede guardarse en un campo.', 'fundamentos'),
  term('SQL', 'Lenguaje estándar para gestionar bases de datos relacionales.', 'lenguajes'),
  term('Consulta', 'Instrucción que le pedimos a la base de datos para obtener o modificar datos.', 'operaciones'),
];

export default new Module({
  id: 'estructura-datos',
  icon: '📋',
  color: 'primary',
  title: 'Estructura de Datos',
  description: 'Tablas, campos, claves primarias y relaciones entre datos',
  order: 1,
  lessons: [conceptosBasicos, tablaInteractiva, clavesRelaciones, ejerciciosTablas],
  glossary,
});
