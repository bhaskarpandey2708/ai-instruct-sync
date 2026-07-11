/** P28 api-contract-sentinel — offline MVP core (zero deps) */
export function main(input) {
  return diffOpenApi(input.prev || {}, input.next || {});
}
export function diffOpenApi(prev, next) {
  const breaks = [];
  const warns = [];
  const pPaths = prev.paths || {};
  const nPaths = next.paths || {};
  for (const path of Object.keys(pPaths)) {
    if (!nPaths[path]) breaks.push({ type: "path_removed", path });
    else {
      for (const method of Object.keys(pPaths[path] || {})) {
        if (!nPaths[path][method]) breaks.push({ type: "method_removed", path, method });
      }
    }
  }
  for (const path of Object.keys(nPaths)) {
    if (!pPaths[path]) warns.push({ type: "path_added", path });
  }
  // required request props
  for (const path of Object.keys(nPaths)) {
    for (const method of Object.keys(nPaths[path] || {})) {
      const prevReq = (((pPaths[path] || {})[method] || {}).requestBody || {}).requiredProps || [];
      const nextReq = (((nPaths[path] || {})[method] || {}).requestBody || {}).requiredProps || [];
      for (const prop of nextReq) {
        if (!prevReq.includes(prop)) breaks.push({ type: "required_field_added", path, method, prop });
      }
    }
  }
  return { breaks, warns, ok: breaks.length === 0 };
}
