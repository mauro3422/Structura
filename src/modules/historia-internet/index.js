/**
 * MÓDULO: Historia del Internet
 * 
 * Recorre la historia de Internet desde ARPANET hasta la era moderna.
 */
import { Module, lesson, concept, stat, event, term } from '../../core/Module.js';

// ─── LECCIONES ────────────────────────────────────────

const origenes = lesson('origenes-internet', 'Los Orígenes')
  .description('De ARPANET al Internet moderno')
  .duration('6 min')
  .text('¿Alguna vez te preguntaste cómo empezó todo esto? La historia del Internet empieza en plena <b>Guerra Fría</b>, en los años 60.')
  .diagram(`timeline
    title La Ruta del Internet
    1969 : ARPANET
         : 4 Universidades y el DoD
    1971 : Email (Ray Tomlinson)
         : Se inventa el @
    1983 : TCP/IP Adoptado
         : El "idioma" oficial nace
    1989 : World Wide Web
         : Tim Berners-Lee y HTML/HTTP
    1993 : Navegador Mosaic
         : Internet para el público
    1998 : Google Inc.
         : Cambia la búsqueda
    2004 : Facebook
         : Era de las Redes Sociales
    2007 : iPhone
         : Internet se vuelve móvil
    2020+ : IA y Nube
         : Conexión Global Total
  `)
  .quiz('¿Cuál fue el antecesor directo del Internet?', [
    'Facebook', 'Google', 'ARPANET', 'Windows',
  ], 2, 'ARPANET (1969) fue la primera red de computadoras y el antepasado directo del Internet moderno.')
  .build();

const importancia = lesson('importancia-internet', 'Importancia del Internet')
  .description('Cómo cambió la comunicación, educación y trabajo')
  .duration('5 min')
  .text('Internet cambió <b>todo</b>. Cómo estudiamos, trabajamos, nos comunicamos y hasta cómo nos entretenemos. Veamos el impacto:')
  .conceptCards([
    concept('📚', 'Educación', 'Acceso a cursos, tutoriales y plataformas educativas desde cualquier lugar. ¡Como esta app!', 'primary'),
    concept('💬', 'Comunicación', 'WhatsApp, videollamadas, redes sociales. Conectamos con cualquier persona del mundo al instante.', 'secondary'),
    concept('💼', 'Trabajo', 'Trabajo remoto, freelancing, economía digital. Nuevas formas de generar ingresos.', 'accent'),
    concept('🏥', 'Salud', 'Telemedicina, historias clínicas digitales, investigación médica compartida globalmente.', 'warning'),
  ])
  .heading('Datos que impactan')
  .stats([
    stat('5.4B', 'Usuarios de Internet en el mundo', '🌍'),
    stat('1.13B', 'Sitios web activos', '🌐'),
    stat('500h', 'Video subido a YouTube por minuto', '📹'),
    stat('95%', 'Tráfico web es móvil en LatAm', '📱'),
  ])
  .quiz('¿Por qué es importante Internet para la educación?', [
    'Solo sirve para entretenimiento',
    'Permite acceder a información y cursos desde cualquier lugar',
    'Reemplaza completamente a los profesores',
    'Solo es útil si tenés una computadora',
  ], 1, 'Internet democratiza la educación, permitiendo aprender desde cualquier dispositivo y lugar. ¡Exactamente lo que estás haciendo ahora!')
  .build();

// ─── GLOSARIO ────────────────────────────────────────

const glossary = [
  term('ARPANET', 'Red de computadoras creada en 1969 por el departamento de defensa de EE.UU. Fue el antepasado directo del Internet moderno.', 'historia'),
];

// ─── EXPORT MODULE ───────────────────────────────────

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
