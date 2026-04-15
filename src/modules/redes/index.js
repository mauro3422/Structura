import { Module, lesson, concept, term } from '../../core/Module.js';

export default new Module({
  id: 'redes',
  icon: '🌐',
  color: 'secondary', // Cyan color
  title: 'Redes de Computadoras',
  description: 'Descubrí cómo funciona Internet, las IPs, Routers y servidores.',
  order: 4,
  
  // -- LECCIONES DEL MÓDULO --
  lessons: [
    lesson('introduccion-redes', '¿Qué es una Red?')
      .duration('5 min')
      .heading('El mundo conectado')
      .text('Una red de computadoras es simplemente un conjunto de dispositivos conectados entre sí para **compartir información y recursos**.')
      .conceptCards([
        concept('💻', 'Nodos', 'Las computadoras, celulares o servidores que forman la red.'),
        concept('🔗', 'Enlaces', 'Los cables de fibra óptica o señales WiFi que los unen.'),
        concept('🗣️', 'Protocolos', 'El "idioma" que usan para entenderse (ej: HTTP o TCP/IP).', 'secondary')
      ])
      .info('Si no existieran las redes, tendrías que pasarme este sistema usando un pendrive en persona. ¡El Internet es solo la red más grande que existe!', { variant: 'accent', icon: '✨' })
      .build(),

    lesson('como-viaja-info', '¿Cómo viaja la información?')
      .duration('7 min')
      .heading('Paquetes de Datos')
      .text('Cuando mandás una foto por WhatsApp, no viaja entera. Se corta en miles de pedacitos minúsculos llamados **paquetes**.')
      .stepAnimation({
        title: 'El viaje de una foto',
        steps: [
          { text: 'Tu celular corta la foto en 1000 paquetes.', icon: '✂️' },
          { text: 'Los paquetes salen por tu router WiFi.', icon: '📡' },
          { text: 'Viajan por cables submarinos a la velocidad de la luz.', icon: '⚡' },
          { text: 'El celular de tu amigo recibe los 1000 paquetes y re-arma la foto.', icon: '🖼️' }
        ]
      })
      .quiz(
        '¿Por qué cortamos la información en "paquetes"?',
        [
          'Porque los cables son muy finitos y no entra entera.',
          'Para que si un paquete se pierde, solo reenviamos ese pedacito y no el archivo entero.',
          'Para que la foto se vea con más calidad.'
        ],
        1,
        '¡Exacto! Es mucho más eficiente reenviar un paquete que se perdió en el camino que tener que mandar la foto de 5MB entera otra vez.'
      )
      .build(),

    lesson('direcciones-ip', 'Direcciones IP y DNS')
      .duration('6 min')
      .heading('El DNI de las computadoras')
      .text('Para que un paquete sepa a dónde ir, cada computadora en internet necesita un identificador único: la **Dirección IP**.')
      .code('json', '// Ejemplo de una dirección IP (IPv4)\n192.168.1.15')
      .heading('El Sistema de Nombres (DNS)')
      .text('Como los humanos somos malos recordando números (nadie recuerda que Google es `142.250.78.46`), usamos el **DNS (Domain Name System)**.')
      .comparison(
        { title: 'Tú escribes', content: 'www.google.com' },
        { title: 'El DNS traduce a', content: '142.250.78.46' }
      )
      .info('El DNS funciona exactamente igual que la libreta de contactos de tu celular. Vos buscás "Mamá" y el celular marca el número.', { variant: 'secondary' })
      .build()
  ],

  // -- GLOSARIO DEL MÓDULO --
  glossary: [
    term('Dirección IP', 'Identificador numérico único asignado a cada dispositivo en una red.', 'redes'),
    term('Router', 'Dispositivo que dirige los paquetes de datos entre diferentes redes para que lleguen a su destino.', 'redes'),
    term('DNS', 'Sistema que traduce nombres de dominio (como google.com) a direcciones IP numéricas.', 'redes'),
    term('Paquete', 'Pequeña porción en la que se divide la información para ser enviada por la red.', 'redes')
  ]
});
