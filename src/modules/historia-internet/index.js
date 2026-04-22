/**
 * MÓDULO: Historia del Internet
 * 
 * Recorre la historia de Internet desde ARPANET hasta la era moderna.
 */
import { Module, lesson, concept, stat, event, term, col } from '../../core/Module.js';

// ─── LECCIONES ────────────────────────────────────────

const origenes = lesson('origenes-internet', 'Los Orígenes')
  .description('De ARPANET al Internet moderno')
  .duration('6 min')
  .text('¿Alguna vez te preguntaste cómo empezó todo esto? La historia del Internet empieza en plena <b>Guerra Fría</b>, en los años 60.')
  .timeline([
    event('1969', 'ARPANET', 'El Departamento de Defensa de EE.UU. crea la primera red de computadoras. Solo conectaba 4 universidades.', '🖥️'),
    event('1971', 'Primer Email', 'Ray Tomlinson envía el primer correo electrónico. Usó el símbolo @ para separar usuario y destino.', '📧'),
    event('1983', 'TCP/IP', 'Se adopta el protocolo TCP/IP, el "idioma" que usan las computadoras para comunicarse. Nace el Internet como lo conocemos.', '🔌'),
    event('1989', 'World Wide Web', 'Tim Berners-Lee inventa la WWW en el CERN. Creó HTML, HTTP y las URLs. ¡Nace la web!', '🌐'),
    event('1993', 'Mosaic', 'Se lanza Mosaic, el primer navegador web popular. Internet empieza a llegar a la gente común.', '🖱️'),
    event('1998', 'Google', 'Larry Page y Sergey Brin crean Google en un garage. Cambia la forma de buscar información.', '🔍'),
    event('2004', 'Facebook', 'Mark Zuckerberg lanza Facebook desde Harvard. Comienza la era de las redes sociales.', '👥'),
    event('2007', 'iPhone', 'Apple lanza el primer iPhone. Internet empieza a ser principalmente móvil.', '📱'),
    event('2020+', 'IA y Cloud', 'Inteligencia Artificial, computación en la nube y 5G. Estamos en la era más conectada de la historia.', '🤖'),
  ])
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
  .heading('Estructurar la Red')
  .text('Para que todo el Internet funcione, los datos se organizan en <b>Tablas</b>. Así se guarda tu perfil, tus mensajes y tus fotos.')
  .magicTable('Usuarios_Ejemplo', 
    [col('ID', 'INT'), col('Nombre', 'TEXT'), col('País', 'TEXT')],
    [[1, 'Mauro', 'Argentina'], [2, 'Antigravity', 'Deepmind']],
    'Una tabla es la base del almacenamiento digital. Permite guardar miles de registros de forma ordenada.'
  )
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
