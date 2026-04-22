/**
 * Módulo: Historia del Internet
 */
import { Module, lesson, concept, stat, event, term, col } from '../../core/Module.ts';

const origenes = lesson('origenes-internet', 'Los Orígenes')
  .description('De ARPANET al Internet moderno')
  .duration('6 min')
  .text('Internet empezó en los años 60 como un proyecto para conectar computadoras de forma robusta.')
  .timeline([
    event('1969', 'ARPANET', 'El Departamento de Defensa de EE. UU. crea la primera red de computadoras.', '🖥️'),
    event('1971', 'Primer email', 'Ray Tomlinson envía el primer correo electrónico y usa @ para separar usuario y destino.', '📧'),
    event('1983', 'TCP/IP', 'Se adopta TCP/IP, el idioma base de Internet.', '🔌'),
    event('1989', 'WWW', 'Tim Berners-Lee inventa la World Wide Web.', '🌐'),
    event('1998', 'Google', 'Google cambia la forma de buscar información.', '🔍'),
    event('2007', 'iPhone', 'Internet se vuelve principalmente móvil.', '📱'),
  ])
  .quiz('¿Cuál fue el antecesor directo de Internet?', [
    'Facebook', 'Google', 'ARPANET', 'Windows',
  ], 2, 'ARPANET fue la primera red de computadoras y el antepasado directo de Internet.')
  .build();

const importancia = lesson('importancia-internet', 'Importancia del Internet')
  .description('Cómo cambió la comunicación, la educación y el trabajo')
  .duration('5 min')
  .text('Internet cambió cómo estudiamos, trabajamos, nos comunicamos y nos entretenemos.')
  .conceptCards([
    concept('📚', 'Educación', 'Acceso a cursos, tutoriales y plataformas educativas desde cualquier lugar.'),
    concept('💬', 'Comunicación', 'Mensajes, videollamadas y redes sociales en tiempo real.'),
    concept('💼', 'Trabajo', 'Trabajo remoto, freelancing y economía digital.'),
    concept('🏥', 'Salud', 'Telemedicina e historias clínicas digitales.'),
  ])
  .heading('Datos que impactan')
  .stats([
    stat('5.4B', 'Usuarios de Internet en el mundo', '🌍'),
    stat('1.13B', 'Sitios web activos', '🌐'),
    stat('500h', 'Video subido a YouTube por minuto', '📹'),
    stat('95%', 'Tráfico web móvil en LatAm', '📱'),
  ])
  .heading('Estructurar la red')
  .text('Para que todo funcione, los datos se organizan de forma ordenada, por ejemplo en tablas.')
  .magicTable('Usuarios_Ejemplo',
    [col('ID', 'INT'), col('Nombre', 'TEXT'), col('País', 'TEXT')],
    [[1, 'Mauro', 'Argentina'], [2, 'Antigravity', 'Deepmind']],
    'Una tabla es la base del almacenamiento digital. Permite guardar miles de registros de forma ordenada.',
  )
  .quiz('¿Por qué es importante Internet para la educación?', [
    'Solo sirve para entretenimiento',
    'Permite acceder a información y cursos desde cualquier lugar',
    'Reemplaza completamente a los profesores',
    'Solo es útil si tenés una computadora',
  ], 1, 'Internet democratiza la educación y permite aprender desde cualquier lugar.')
  .build();

const glossary = [
  term('ARPANET', 'Red de computadoras creada en 1969 por el Departamento de Defensa de EE. UU. Fue el antecesor directo del Internet moderno.', 'historia'),
];

export default new Module({
  id: 'historia-internet',
  icon: '🌐',
  color: 'secondary',
  title: 'Historia del Internet',
  description: 'Cómo nació y evolucionó la red que conecta al mundo',
  order: 2,
  lessons: [origenes, importancia],
  glossary,
});
