/**
 * DataLab - Module Index
 *
 * To add a new module:
 * 1. Create src/modules/mi-modulo/index.js
 * 2. Export `default new Module(...)`
 * 3. Import it below and add it to `moduleCatalog`
 */
import { registry } from '../core/Registry.js';

import estructuraDatos from './estructura-datos/index.js';
import historiaInternet from './historia-internet/index.js';
import algoritmosBusqueda from './algoritmos-busqueda/index.js';
import redesComputadoras from './redes/index.js';
import basesDatos from './bases-datos/index.js';
import laboratorioTablas from './laboratorio-tablas/index.js';

export const moduleCatalog = [
  estructuraDatos,
  historiaInternet,
  algoritmosBusqueda,
  redesComputadoras,
  basesDatos,
  laboratorioTablas,
];

moduleCatalog.forEach(mod => registry.register(mod));

export { registry };
