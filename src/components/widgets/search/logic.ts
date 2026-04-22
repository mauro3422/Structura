function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runLinearSearch(
  animId: string,
  values: Array<number | string>,
  target: number | string,
  status: HTMLElement | null,
) {
  if (!status) return;

  for (let i = 0; i < values.length; i++) {
    const cell = document.getElementById(`${animId}-cell-${i}`);
    if (!cell) continue;

    cell.className = 'search-cell search-cell--checking';
    status.textContent = `Paso ${i + 1}: Comparando ${values[i]} con ${target}...`;
    await sleep(600);

    if (values[i] === target) {
      cell.className = 'search-cell search-cell--found';
      status.textContent = `✅ ¡Encontrado en la posición ${i}! (${i + 1} comparaciones)`;
      return;
    }

    cell.className = 'search-cell search-cell--eliminated';
  }

  status.textContent = `❌ No encontrado después de ${values.length} comparaciones`;
}

export async function runBinarySearch(
  animId: string,
  values: Array<number | string>,
  target: number | string,
  status: HTMLElement | null,
) {
  if (!status) return;

  let left = 0;
  let right = values.length - 1;
  let step = 0;

  for (let i = left; i <= right; i++) {
    const cell = document.getElementById(`${animId}-cell-${i}`);
    if (cell) cell.className = 'search-cell search-cell--range';
  }
  await sleep(400);

  while (left <= right) {
    step++;
    const mid = Math.floor((left + right) / 2);
    const cell = document.getElementById(`${animId}-cell-${mid}`);

    if (cell) cell.className = 'search-cell search-cell--checking';
    status.textContent = `Paso ${step}: Mirando la mitad → posición ${mid} (valor: ${values[mid]})`;
    await sleep(800);

    if (values[mid] === target) {
      if (cell) cell.className = 'search-cell search-cell--found';
      status.textContent = `✅ ¡Encontrado en la posición ${mid}! (solo ${step} pasos)`;
      return;
    }

    if (values[mid] < target) {
      for (let i = left; i <= mid; i++) {
        const current = document.getElementById(`${animId}-cell-${i}`);
        if (current) current.className = 'search-cell search-cell--eliminated';
      }
      status.textContent = `Paso ${step}: ${values[mid]} < ${target}, buscamos en la mitad derecha →`;
      left = mid + 1;
    } else {
      for (let i = mid; i <= right; i++) {
        const current = document.getElementById(`${animId}-cell-${i}`);
        if (current) current.className = 'search-cell search-cell--eliminated';
      }
      status.textContent = `Paso ${step}: ${values[mid]} > ${target}, buscamos en la mitad izquierda ←`;
      right = mid - 1;
    }

    await sleep(600);

    for (let i = left; i <= right; i++) {
      const current = document.getElementById(`${animId}-cell-${i}`);
      if (current) current.className = 'search-cell search-cell--range';
    }

    await sleep(400);
  }

  status.textContent = `❌ No encontrado después de ${step} pasos`;
}
