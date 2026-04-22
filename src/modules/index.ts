/**
 * DataLab - Module Index
 *
 * To add a new module:
 * 1. Create src/modules/mi-modulo/index.js
 * 2. Export `default new Module(...)`
 * 3. Import it below and add it to `moduleCatalog`
 */
import { registry } from '../core/Registry.ts';

import estructuraDatos from './estructura-datos/index.ts';
import historiaInternet from './historia-internet/index.ts';
import algoritmosBusqueda from './algoritmos-busqueda/index.ts';
import redesComputadoras from './redes/index.ts';
import basesDatos from './bases-datos/index.ts';
import laboratorioTablas from './laboratorio-tablas/index.ts';

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

