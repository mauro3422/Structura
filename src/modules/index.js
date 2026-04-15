/**
 * DataLab - Module Index
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │  PARA AGREGAR UN NUEVO MÓDULO:                      │
 * │  1. Crear carpeta en src/modules/mi-modulo/         │  
 * │  2. Crear index.js usando el template de            │
 * │     src/modules/_template/index.js                  │
 * │  3. Importar y registrar acá abajo                  │
 * └─────────────────────────────────────────────────────┘
 */
import { registry } from '../core/Registry.js';

// ─── Importar módulos ────────────────────────────────
import estructuraDatos from './estructura-datos/index.js';
import historiaInternet from './historia-internet/index.js';
import redesComputadoras from './redes/index.js';
import algoritmosBusqueda from './algoritmos-busqueda/index.js';

// ─── Registrar módulos ───────────────────────────────
registry.register(estructuraDatos);
registry.register(redesComputadoras);
registry.register(algoritmosBusqueda);
registry.register(historiaInternet);

export { registry };
