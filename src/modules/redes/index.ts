import { Module, lesson, concept, term } from '../../core/Module.ts';

export default new Module({
  id: 'redes',
  icon: '🌐',
  color: 'secondary',
  title: 'Redes de Computadoras',
  description: 'Descubrí cómo funciona Internet, las IPs, los routers y el DNS.',
  order: 4,
  lessons: [
    lesson('introduccion-redes', '¿Qué es una Red?')
      .duration('5 min')
      .heading('El mundo conectado')
      .text('Una red de computadoras es un conjunto de dispositivos conectados entre sí para **compartir información y recursos**.')
      .conceptCards([
        concept('💻', 'Nodos', 'Computadoras, celulares o servidores que forman la red.'),
        concept('🔗', 'Enlaces', 'Cables, WiFi o fibra óptica que conectan los nodos.'),
        concept('🗣️', 'Protocolos', 'Reglas que permiten que los dispositivos se entiendan.'),
      ])
      .heading('Topología de Red Estrellada')
      .diagram(`graph TD
          R((📡 Router))
          R ---|WiFi| L[💻 Laptop]
          R ---|WiFi| C[📱 Celular]
          R ---|Cable| S[(🗄️ Servidor Local)]
      `)
      .info('Si no existieran las redes, tendrías que pasarme este sistema en un pendrive. ¡Internet es solo la red más grande que existe!', { variant: 'accent', icon: '✨' })
      .build(),

    lesson('como-viaja-info', '¿Cómo viaja la información?')
      .duration('7 min')
      .heading('Paquetes de Datos')
      .text('Cuando mandás una foto por WhatsApp, no viaja entera. Se divide en pedacitos llamados **paquetes**.')
      .stepAnimation({
        title: 'El viaje de una foto',
        steps: [
          { text: 'Tu celular corta la foto en muchos paquetes.', icon: '✂️' },
          { text: 'Los paquetes salen por tu router WiFi.', icon: '📡' },
          { text: 'Viajan por cables submarinos y routers intermedios.', icon: '⚡' },
          { text: 'El celular de tu amigo recibe todo y rearma la imagen.', icon: '🖼️' },
        ],
      })
      .quiz(
        '¿Por qué cortamos la información en paquetes?',
        [
          'Porque así se ve más linda.',
          'Para que si un paquete se pierde, reenviemos solo ese pedacito.',
          'Porque los celulares no pueden abrir archivos grandes.',
        ],
        1,
        '¡Exacto! Reenviar un paquete perdido es mucho más eficiente que mandar todo de nuevo.',
      )
      .build(),

    lesson('direcciones-ip', 'Direcciones IP y DNS')
      .duration('6 min')
      .heading('El DNI de las computadoras')
      .text('Para que un paquete sepa a dónde ir, cada computadora necesita un identificador único: la **Dirección IP**.')
      .code('json', '// Ejemplo de una dirección IP (IPv4)\n192.168.1.15')
      .heading('El Sistema de Nombres (DNS)')
      .text('Como los humanos somos malos recordando números, usamos el **DNS (Domain Name System)**.')
      .comparison(
        { title: 'Tú escribes', content: 'www.google.com' },
        { title: 'El DNS traduce a', content: '142.250.78.46' },
        {
          title: 'Traducción DNS',
          summary: 'A la izquierda está el nombre que escribís y a la derecha la IP real que entiende la red.',
        },
      )
      .diagram(`sequenceDiagram
        participant U as 📱 Tu celular
        participant D as 🌐 Servidor DNS
        participant S as 🗄️ Google (142.250...)

        U->>D: 1. ¿Cuál es la IP de google.com?
        D-->>U: 2. ¡Es 142.250.78.46!
        U->>S: 3. Hola 142..., dame la página
        S-->>U: 4. Acá tenés la página web
      `)
      .info('El DNS funciona como la libreta de contactos del celular: vos buscás un nombre y la app resuelve el número.', { variant: 'secondary' })
      .build(),
  ],
  glossary: [
    term('Dirección IP', 'Identificador numérico único asignado a cada dispositivo en una red.', 'redes'),
    term('Router', 'Dispositivo que dirige los paquetes de datos entre diferentes redes para que lleguen a destino.', 'redes'),
    term('DNS', 'Sistema que traduce nombres de dominio a direcciones IP numéricas.', 'redes'),
    term('Paquete', 'Pequeña porción en la que se divide la información para enviarla por la red.', 'redes'),
  ],
});
