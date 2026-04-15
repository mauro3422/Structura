# Structura 💻

Structura es una plataforma web educativa mobile-first para aprender estructura de datos, bases de datos, algoritmos y redes directamente desde tu celular.

Diseñada con un enfoque de _gamificación_ estilo Duolingo, Structura permite enseñar conceptos complejos de ingeniería e infraestructura a estudiantes mediante contenido visual rápido y altamente interactivo.

## Características

- 📱 **Mobile-First Absolute:** Interfaz limpia adaptada exclusivamente para disfrutar desde un tamaño de celular.
- ⚡ **Animaciones Hápticas Visuales:** Fluidez y sensaciones premium en cada botón e interacción.
- 🧱 **API de Módulos (Fluent Builder):** Permite escribir lecciones completas, quizzes y tablas visuales interactivamente solo con Javascript en minutos.
- 🧠 **Progreso en Memoria:** Rastrea y graba automáticamente tu avance dentro de tus materias con un porcentaje y checkmarks `✅`.
- 🔋 **Zero Backend:** Preparado al frente (Vite + Vanilla JS) para un despliegue gratuito en Vercel/Github Pages o futuras conexiones a Supabase para el panel de administración.

## Arquitectura Modular

Cada curso/materia en Structura se aloja independiente. Para crear una materia, solo ocupás copiar la carpeta de `_template` en `src/modules/` y usar nuestro constructor semántico:

```javascript
lesson('introduccion', '¿Qué es una Estructura?')
  .duration('5 min')
  .text('...')
  .quiz(...)
  .build()
```

## Setup de Desarrollo Local

Si deseas contribuir localmente y testear los recursos:

```bash
npm install
npm run dev
```

## Hoja de Ruta (Futuro)

- [ ] Consolidación del Panel de Administración en **Supabase** para profesores.
- [ ] Incorporación de métricas a tiempo real de estudiantes.
- [ ] Exportación de datos analíticos estructurados.

---
_Hecho con 💜 para democratizar el aprendizaje integral de sistemas de software._
