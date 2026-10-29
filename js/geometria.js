// ============================================================
// GEOMETRÍA 3D
// ============================================================
function construirGrilla3D(Lf, Wf, Hf) {
    const cajasCorte = [];
    escalones.forEach((e) => {
        const u = e.ubicacion || "sup_izq";
        const info = INFO_UBICACION_ESCALON[u] || INFO_UBICACION_ESCALON.sup_izq;
        const p = Math.max(0, Math.min(Hf, e.prof));
        if (p <= 0 || e.ancho <= 0) return;
        const esSup = u.startsWith("sup_");
        const z1 = esSup ? Math.max(0, Hf - p) : 0;
        const z2 = esSup ? Hf : Math.min(Hf, p);
        if (info.ejeLargo === "L") {
            const w = Math.max(0, Math.min(Wf, e.ancho));
            const len = e.pasante ? Lf : Math.max(0, Math.min(Lf, e.largo || Lf));
            const y1 = u.endsWith("_izq") ? 0 : Math.max(0, Wf - w);
            const y2 = u.endsWith("_izq") ? w : Wf;
            if (len > 0 && y2 > y1 && z2 > z1) cajasCorte.push({ x1: 0, x2: len, y1, y2, z1, z2 });
        } else {
            const w = Math.max(0, Math.min(Lf, e.ancho));
            const len = e.pasante ? Wf : Math.max(0, Math.min(Wf, e.largo || Wf));
            const x1 = u.endsWith("_atras") ? 0 : Math.max(0, Lf - w);
            const x2 = u.endsWith("_atras") ? w : Lf;
            if (x2 > x1 && len > 0 && z2 > z1) cajasCorte.push({ x1, x2, y1: 0, y2: len, z1, z2 });
        }
    });
    ranuras.forEach((r) => {
        const c = r.cara || "sup_long";
        if (r.ancho <= 0 || r.prof <= 0) return;
        if (c === "sup_long" || c === "inf_long") {
            const w = Math.max(0, Math.min(Wf, r.ancho));
            const p = Math.max(0, Math.min(Hf, r.prof));
            const yIni = r.centrada ? (Wf - w) / 2 : r.pos;
            const y1 = Math.max(0, Math.min(Wf, yIni));
            const y2 = Math.max(0, Math.min(Wf, yIni + w));
            const z1 = c === "sup_long" ? Math.max(0, Hf - p) : 0;
            const z2 = c === "sup_long" ? Hf : Math.min(Hf, p);
            if (y2 > y1 && z2 > z1) cajasCorte.push({ x1: 0, x2: Lf, y1, y2, z1, z2 });
        } else if (c === "sup_trans" || c === "inf_trans") {
            const w = Math.max(0, Math.min(Lf, r.ancho));
            const p = Math.max(0, Math.min(Hf, r.prof));
            const xIni = r.centrada ? (Lf - w) / 2 : r.pos;
            const x1 = Math.max(0, Math.min(Lf, xIni));
            const x2 = Math.max(0, Math.min(Lf, xIni + w));
            const z1 = c === "sup_trans" ? Math.max(0, Hf - p) : 0;
            const z2 = c === "sup_trans" ? Hf : Math.min(Hf, p);
            if (x2 > x1 && z2 > z1) cajasCorte.push({ x1, x2, y1: 0, y2: Wf, z1, z2 });
        } else if (c === "lat_izq" || c === "lat_der") {
            const w = Math.max(0, Math.min(Hf, r.ancho));
            const p = Math.max(0, Math.min(Wf, r.prof));
            const zIni = r.centrada ? (Hf - w) / 2 : r.pos;
            const z1 = Math.max(0, Math.min(Hf, zIni));
            const z2 = Math.max(0, Math.min(Hf, zIni + w));
            const y1 = c === "lat_izq" ? 0 : Math.max(0, Wf - p);
            const y2 = c === "lat_izq" ? Math.min(Wf, p) : Wf;
            if (y2 > y1 && z2 > z1) cajasCorte.push({ x1: 0, x2: Lf, y1, y2, z1, z2 });
        } else if (c === "frente" || c === "atras") {
            const w = Math.max(0, Math.min(Hf, r.ancho));
            const p = Math.max(0, Math.min(Lf, r.prof));
            const zIni = r.centrada ? (Hf - w) / 2 : r.pos;
            const z1 = Math.max(0, Math.min(Hf, zIni));
            const z2 = Math.max(0, Math.min(Hf, zIni + w));
            const x1 = c === "atras" ? 0 : Math.max(0, Lf - p);
            const x2 = c === "atras" ? Math.min(Lf, p) : Lf;
            if (x2 > x1 && z2 > z1) cajasCorte.push({ x1, x2, y1: 0, y2: Wf, z1, z2 });
        }
    });
    function uniqueSorted(arr) {
        const s = [...arr].sort((a, b) => a - b);
        const res = [];
        s.forEach((v) => {
            if (res.length === 0 || Math.abs(v - res[res.length - 1]) > 1e-4) res.push(v);
        });
        return res;
    }
    const xs = [0, Lf],
        ys = [0, Wf],
        zs = [0, Hf];
    cajasCorte.forEach((b) => {
        xs.push(b.x1, b.x2);
        ys.push(b.y1, b.y2);
        zs.push(b.z1, b.z2);
    });
    const X = uniqueSorted(xs),
        Y = uniqueSorted(ys),
        Z = uniqueSorted(zs);
    const nx = X.length - 1,
        ny = Y.length - 1,
        nz = Z.length - 1;
    const solid = [];
    for (let i = 0; i < nx; i++) {
        solid[i] = [];
        const xm = (X[i] + X[i + 1]) / 2;
        for (let j = 0; j < ny; j++) {
            solid[i][j] = [];
            const ym = (Y[j] + Y[j + 1]) / 2;
            for (let k = 0; k < nz; k++) {
                const zm = (Z[k] + Z[k + 1]) / 2;
                let cortado = false;
                for (const b of cajasCorte)
                    if (xm >= b.x1 && xm <= b.x2 && ym >= b.y1 && ym <= b.y2 && zm >= b.z1 && zm <= b.z2) {
                        cortado = true;
                        break;
                    }
                solid[i][j][k] = !cortado;
            }
        }
    }
    function isSolid(i, j, k) {
        if (i < 0 || i >= nx || j < 0 || j >= ny || k < 0 || k >= nz) return false;
        return solid[i][j][k];
    }
    return { X, Y, Z, nx, ny, nz, solid, isSolid };
}

function obtenerCotasVerticalesEnPunto(grilla, x, y, Hf) {
    const { X, Y, Z, nx, ny, nz, isSolid } = grilla;
    let iSel = 0,
        jSel = 0;
    for (let i = 0; i < nx; i++)
        if (x >= X[i] - 1e-4 && x <= X[i + 1] + 1e-4) {
            iSel = i;
            break;
        }
    for (let j = 0; j < ny; j++)
        if (y >= Y[j] - 1e-4 && y <= Y[j + 1] + 1e-4) {
            jSel = j;
            break;
        }
    let zTop = Hf,
        zBot = 0,
        found = false;
    for (let k = nz - 1; k >= 0; k--)
        if (isSolid(iSel, jSel, k)) {
            zTop = Z[k + 1];
            found = true;
            break;
        }
    for (let k = 0; k < nz; k++)
        if (isSolid(iSel, jSel, k)) {
            zBot = Z[k];
            break;
        }
    return { zTop: found ? zTop : 0, zBot: found ? zBot : 0, hayMaterial: found };
}

// ============================================================
// ANÁLISIS DE ZONAS
// ============================================================
function getNombreZona(zona) {
    if (zona === "cara_sup") return "Cara Superior";
    if (zona === "cara_inf") return "Cara Inferior";
    if (zona && zona.startsWith("escalon_")) {
        const eid = parseInt(zona.split("_")[1]);
        const idx = escalones.findIndex((x) => x.id === eid);
        return idx >= 0 ? `Escalón #${idx + 1}` : "Escalón";
    }
    if (zona && zona.startsWith("ranura_")) {
        const rid = parseInt(zona.split("_")[1]);
        const idx = ranuras.findIndex((x) => x.id === rid);
        return idx >= 0 ? `Ranura #${idx + 1}` : "Ranura";
    }
    return "Zona seleccionada";
}

function puntoEnEscalonXY(xm, ym, e, dims) {
    const { Lf, Wf } = dims;
    const info = INFO_UBICACION_ESCALON[e.ubicacion] || INFO_UBICACION_ESCALON.sup_izq;
    if (info.ejeLargo === "L") {
        const len = e.pasante ? Lf : Math.max(0, Math.min(Lf, e.largo || Lf));
        const w = Math.max(0, Math.min(Wf, e.ancho));
        const y1 = e.ubicacion.endsWith("_izq") ? 0 : Math.max(0, Wf - w);
        const y2 = e.ubicacion.endsWith("_izq") ? w : Wf;
        return xm >= 0 && xm <= len && ym >= y1 && ym <= y2;
    } else {
        const len = e.pasante ? Wf : Math.max(0, Math.min(Wf, e.largo || Wf));
        const w = Math.max(0, Math.min(Lf, e.ancho));
        const x1 = e.ubicacion.endsWith("_atras") ? 0 : Math.max(0, Lf - w);
        const x2 = e.ubicacion.endsWith("_atras") ? w : Lf;
        return xm >= x1 && xm <= x2 && ym >= 0 && ym <= len;
    }
}

function puntoEnRanuraXY(xm, ym, r, dims) {
    const { Lf, Wf } = dims;
    const c = r.cara || "sup_long";
    if (c === "sup_long" || c === "inf_long") {
        const w = Math.max(0, Math.min(Wf, r.ancho));
        const yIni = r.centrada ? (Wf - w) / 2 : r.pos;
        return xm >= 0 && xm <= Lf && ym >= Math.max(0, Math.min(Wf, yIni)) && ym <= Math.max(0, Math.min(Wf, yIni + w));
    } else if (c === "sup_trans" || c === "inf_trans") {
        const w = Math.max(0, Math.min(Lf, r.ancho));
        const xIni = r.centrada ? (Lf - w) / 2 : r.pos;
        return xm >= Math.max(0, Math.min(Lf, xIni)) && xm <= Math.max(0, Math.min(Lf, xIni + w)) && ym >= 0 && ym <= Wf;
    } else if (c === "lat_izq" || c === "lat_der") {
        const p = Math.max(0, Math.min(Wf, r.prof));
        const y1 = c === "lat_izq" ? 0 : Math.max(0, Wf - p);
        const y2 = c === "lat_izq" ? Math.min(Wf, p) : Wf;
        return xm >= 0 && xm <= Lf && ym >= y1 && ym <= y2;
    } else if (c === "frente" || c === "atras") {
        const p = Math.max(0, Math.min(Lf, r.prof));
        const x1 = c === "atras" ? 0 : Math.max(0, Lf - p);
        const x2 = c === "atras" ? Math.min(Lf, p) : Lf;
        return xm >= x1 && xm <= x2 && ym >= 0 && ym <= Wf;
    }
    return false;
}

function analizarCeldaEnZona(grilla, dims, i, j, zona, modoCruce, reqPasante, minProfCiega) {
    const { X, Y, Z, nx, ny, nz, isSolid } = grilla;
    const { Hf } = dims;
    if (i < 0 || i >= nx || j < 0 || j >= ny) return { valid: false };
    const xm = (X[i] + X[i + 1]) / 2;
    const ym = (Y[j] + Y[j + 1]) / 2;
    let kTop = -1,
        kBot = -1;
    for (let k = nz - 1; k >= 0; k--)
        if (isSolid(i, j, k)) {
            kTop = k;
            break;
        }
    if (kTop === -1) return { valid: false };
    for (let k = 0; k < nz; k++)
        if (isSolid(i, j, k)) {
            kBot = k;
            break;
        }
    let tieneHuecoIntermedio = false;
    for (let k = kBot; k <= kTop; k++)
        if (!isSolid(i, j, k)) {
            tieneHuecoIntermedio = true;
            break;
        }
    const zTop = Z[kTop + 1];
    const zBot = Z[kBot];
    const espesor = zTop - zBot;
    const pasaPorEscalon = escalones.some((e) => puntoEnEscalonXY(xm, ym, e, dims));
    const pasaPorRanura = ranuras.some((r) => puntoEnRanuraXY(xm, ym, r, dims));
    const esMacizo = !tieneHuecoIntermedio && Math.abs(zTop - Hf) < 1e-3 && Math.abs(zBot - 0) < 1e-3;
    const profileKey = `${zBot.toFixed(2)}_${zTop.toFixed(2)}_${tieneHuecoIntermedio ? "H" : "S"}`;
    if (zona.startsWith("escalon_")) {
        const eid = parseInt(zona.split("_")[1]);
        const e = escalones.find((x) => x.id === eid);
        if (!e || !puntoEnEscalonXY(xm, ym, e, dims)) return { valid: false };
        const esSup = e.ubicacion.startsWith("sup_");
        const p = Math.max(0, Math.min(Hf, e.prof));
        const zEsp = esSup ? Hf - p : p;
        if (esSup && Math.abs(zTop - zEsp) > 1e-3) return { valid: false };
        if (!esSup && Math.abs(zBot - zEsp) > 1e-3) return { valid: false };
        if (espesor < minProfCiega) return { valid: false };
        return { valid: true, zTop, zBot, profileKey, tipoZona: "escalon", priority: 1 };
    }
    if (zona.startsWith("ranura_")) {
        const rid = parseInt(zona.split("_")[1]);
        const r = ranuras.find((x) => x.id === rid);
        if (!r || !puntoEnRanuraXY(xm, ym, r, dims)) return { valid: false };
        const esInf = r.cara.startsWith("inf_");
        const p = Math.max(0, Math.min(Hf, r.prof));
        const zEsp = !esInf ? Hf - p : p;
        if (!esInf && Math.abs(zTop - zEsp) > 1e-3) return { valid: false };
        if (esInf && Math.abs(zBot - zEsp) > 1e-3) return { valid: false };
        if (espesor < minProfCiega) return { valid: false };
        return { valid: true, zTop, zBot, profileKey, tipoZona: "ranura", priority: 1 };
    }
    const entradaSup = zona !== "cara_inf";
    if (!reqPasante) {
        if (entradaSup && Math.abs(zTop - Hf) > 1e-3 && modoCruce === "ninguno") return { valid: false };
        if (!entradaSup && Math.abs(zBot - 0) > 1e-3 && modoCruce === "ninguno") return { valid: false };
        if (tieneHuecoIntermedio || espesor < minProfCiega) return { valid: false };
    }
    if (esMacizo) {
        if (espesor < minProfCiega) return { valid: false };
        return { valid: true, zTop, zBot, profileKey, tipoZona: "macizo", priority: 1 };
    }
    if (modoCruce === "ninguno") return { valid: false };
    if (tieneHuecoIntermedio || espesor < minProfCiega || espesor <= 0.5) return { valid: false };
    if (modoCruce === "ranuras") {
        if (pasaPorRanura && !pasaPorEscalon) return { valid: true, zTop, zBot, profileKey, tipoZona: "ranura", priority: 2 };
        return { valid: false };
    }
    if (modoCruce === "escalones") {
        if (pasaPorEscalon && !pasaPorRanura) return { valid: true, zTop, zBot, profileKey, tipoZona: "escalon", priority: 2 };
        return { valid: false };
    }
    if (modoCruce === "ambos") {
        if (pasaPorRanura) return { valid: true, zTop, zBot, profileKey, tipoZona: "ranura", priority: 2 };
        if (pasaPorEscalon) return { valid: true, zTop, zBot, profileKey, tipoZona: "escalon", priority: 3 };
    }
    return { valid: false };
}

function encontrarRectangulosUniformes(grilla, cellMatrix) {
    const { X, Y, nx, ny } = grilla;
    const rects = [];
    for (let i1 = 0; i1 < nx; i1++)
        for (let i2 = i1 + 1; i2 <= nx; i2++)
            for (let j1 = 0; j1 < ny; j1++)
                for (let j2 = j1 + 1; j2 <= ny; j2++) {
                    const refCell = cellMatrix[i1][j1];
                    if (!refCell || !refCell.valid) continue;
                    const targetKey = refCell.profileKey;
                    let allMatch = true;
                    for (let i = i1; i < i2 && allMatch; i++)
                        for (let j = j1; j < j2; j++) {
                            const c = cellMatrix[i][j];
                            if (!c || !c.valid || c.profileKey !== targetKey) {
                                allMatch = false;
                                break;
                            }
                        }
                    if (!allMatch) continue;
                    let canLeft = i1 > 0;
                    if (canLeft)
                        for (let j = j1; j < j2; j++) {
                            const c = cellMatrix[i1 - 1][j];
                            if (!c || !c.valid || c.profileKey !== targetKey) canLeft = false;
                        }
                    let canRight = i2 < nx;
                    if (canRight)
                        for (let j = j1; j < j2; j++) {
                            const c = cellMatrix[i2][j];
                            if (!c || !c.valid || c.profileKey !== targetKey) canRight = false;
                        }
                    let canDown = j1 > 0;
                    if (canDown)
                        for (let i = i1; i < i2; i++) {
                            const c = cellMatrix[i][j1 - 1];
                            if (!c || !c.valid || c.profileKey !== targetKey) canDown = false;
                        }
                    let canUp = j2 < ny;
                    if (canUp)
                        for (let i = i1; i < i2; i++) {
                            const c = cellMatrix[i][j2];
                            if (!c || !c.valid || c.profileKey !== targetKey) canUp = false;
                        }
                    if (!canLeft && !canRight && !canDown && !canUp) {
                        const x = X[i1],
                            w = X[i2] - X[i1];
                        const y = Y[j1],
                            h = Y[j2] - Y[j1];
                        if (w > 1e-3 && h > 1e-3)
                            rects.push({
                                i1,
                                i2,
                                j1,
                                j2,
                                x,
                                y,
                                w,
                                h,
                                area: w * h,
                                profileKey: targetKey,
                                tipoZona: refCell.tipoZona,
                                priority: refCell.priority,
                                zTop: refCell.zTop,
                                zBot: refCell.zBot,
                            });
                    }
                }
    return rects;
}

function distribuirEnRectangulo(area, N, D) {
    const minSpacing = D * 1.35;
    const maxCols = Math.floor(area.w / minSpacing);
    const maxRows = Math.floor(area.h / minSpacing);
    const maxCap = maxCols * maxRows;
    if (maxCap < N || N <= 0) return null;
    let bestR = 1,
        bestC = N,
        bestScore = Infinity;
    const areaAspect = area.w / area.h;
    for (let r = 1; r <= maxRows; r++)
        for (let c = 1; c <= maxCols; c++) {
            if (r * c < N) continue;
            const gridAspect = c / r;
            const aspectPenalty = Math.abs(Math.log(gridAspect / areaAspect));
            const wastePenalty = (r * c - N) * 0.15;
            const score = aspectPenalty + wastePenalty;
            if (score < bestScore) {
                bestScore = score;
                bestR = r;
                bestC = c;
            }
        }
    const basePerRow = Math.floor(N / bestR);
    const extra = N - basePerRow * bestR;
    const midStart = Math.floor((bestR - extra) / 2);
    const holesPerRow = [];
    for (let r = 0; r < bestR; r++) holesPerRow.push(basePerRow + (r >= midStart && r < midStart + extra ? 1 : 0));
    const stepY = area.h / bestR;
    const positions = [];
    for (let r = 0; r < bestR; r++) {
        const nRow = holesPerRow[r];
        if (nRow === 0) continue;
        const stepX = area.w / nRow;
        const y = area.y + (r + 0.5) * stepY;
        for (let c = 0; c < nRow; c++) positions.push({ x: area.x + (c + 0.5) * stepX, y, tipoZona: area.tipoZona });
    }
    return { positions, bestScore, maxCap };
}

function evaluarDistribucionEnModo(op, grilla, dims, maxD, modoCruce, reqPasante, minProfCiega) {
    const N = Math.max(1, Math.round(op.cant || 1));
    const zona = op.zona || "cara_sup";
    const minSpacing = maxD * 1.35;
    const cellMatrix = [];
    for (let i = 0; i < grilla.nx; i++) {
        cellMatrix[i] = [];
        for (let j = 0; j < grilla.ny; j++)
            cellMatrix[i][j] = analizarCeldaEnZona(grilla, dims, i, j, zona, modoCruce, reqPasante, minProfCiega);
    }
    const rects = encontrarRectangulosUniformes(grilla, cellMatrix);
    if (rects.length === 0) return { fits: false, maxPossible: 0, bestRect: null, positions: [], zonasUsadas: [] };
    rects.forEach((r) => {
        r.maxCols = Math.floor(r.w / minSpacing);
        r.maxRows = Math.floor(r.h / minSpacing);
        r.capacity = r.maxCols * r.maxRows;
    });
    rects.sort((a, b) => a.priority - b.priority || b.capacity - a.capacity || b.area - a.area);
    const disjoint = [];
    for (const r of rects) {
        if (r.capacity <= 0) continue;
        const overlaps = disjoint.some((d) => !(r.i2 <= d.i1 || r.i1 >= d.i2 || r.j2 <= d.j1 || r.j1 >= d.j2));
        if (!overlaps) disjoint.push(r);
    }
    const totalDisjointCap = disjoint.reduce((acc, r) => acc + r.capacity, 0);
    const bestRect = disjoint[0] || rects[0];
    if (totalDisjointCap < N)
        return { fits: false, maxPossible: totalDisjointCap, bestRect, positions: [], zonasUsadas: disjoint };
    let K = 1,
        capAcum = 0;
    for (let idx = 0; idx < disjoint.length; idx++) {
        capAcum += disjoint[idx].capacity;
        if (capAcum >= N) {
            K = idx + 1;
            break;
        }
    }
    const activeZones = disjoint.slice(0, K);
    const alloc = new Array(K).fill(0);
    let rem = N;
    while (rem > 0) {
        let bestIdx = -1,
            minVal = Infinity;
        for (let idx = 0; idx < K; idx++)
            if (alloc[idx] < activeZones[idx].capacity && alloc[idx] < minVal) {
                minVal = alloc[idx];
                bestIdx = idx;
            }
        if (bestIdx === -1) break;
        alloc[bestIdx]++;
        rem--;
    }
    const allPositions = [];
    for (let idx = 0; idx < K; idx++)
        if (alloc[idx] > 0) {
            const dist = distribuirEnRectangulo(activeZones[idx], alloc[idx], maxD);
            if (dist) allPositions.push(...dist.positions);
        }
    if (allPositions.length === N)
        return {
            fits: true,
            maxPossible: totalDisjointCap,
            bestRect,
            positions: allPositions,
            zonasUsadas: activeZones.map((z, idx) => ({ ...z, nAsignados: alloc[idx] })),
        };
    return { fits: false, maxPossible: totalDisjointCap, bestRect, positions: [], zonasUsadas: disjoint };
}

function getConcentricGroup(op) {
    let root = op;
    const visited = new Set([op.id]);
    while (root.concentricoId) {
        if (visited.has(root.id)) break;
        visited.add(root.id);
        const next = perforados.find((x) => x.id === root.concentricoId) || abocardados.find((x) => x.id === root.concentricoId);
        if (!next) break;
        root = next;
    }
    const group = [];
    const queue = [root];
    const seen = new Set([root.id]);
    while (queue.length > 0) {
        const curr = queue.shift();
        group.push(curr);
        [...perforados, ...abocardados]
            .filter((x) => x.concentricoId === curr.id)
            .forEach((c) => {
                if (!seen.has(c.id)) {
                    seen.add(c.id);
                    queue.push(c);
                }
            });
    }
    return { root, group };
}

function computeAutoPositions(op, grilla, dims, maxD) {
    const { root, group } = getConcentricGroup(op);
    const N = Math.max(1, Math.round(root.cant || 1));
    const zona = root.zona || "cara_sup";
    const nombreZona = getNombreZona(zona);
    let reqPasante = false;
    let modoCruce = root.modoCruce || "ninguno";
    let minProfCiega = 0.5;
    group.forEach((m) => {
        if ("dAboc" in m) {
            minProfCiega = Math.max(minProfCiega, m.prof || 0);
            if (group.length === 1) reqPasante = true;
        } else {
            if (m.tipo === "pasante") reqPasante = true;
            else minProfCiega = Math.max(minProfCiega, m.prof || 0);
        }
    });
    const evalActual = evaluarDistribucionEnModo(root, grilla, dims, maxD, modoCruce, reqPasante, minProfCiega);
    if (evalActual.fits)
        return {
            positions: evalActual.positions,
            maxPossible: evalActual.maxPossible,
            modoCruce,
            areaLibre: evalActual.bestRect,
            zonasUsadas: evalActual.zonasUsadas,
        };
    const sugerencias = [];
    if (reqPasante && modoCruce !== "ambos") {
        const evalRanuras = evaluarDistribucionEnModo(root, grilla, dims, maxD, "ranuras", reqPasante, minProfCiega);
        const evalEscalones = evaluarDistribucionEnModo(root, grilla, dims, maxD, "escalones", reqPasante, minProfCiega);
        const evalAmbos = evaluarDistribucionEnModo(root, grilla, dims, maxD, "ambos", reqPasante, minProfCiega);
        if (modoCruce !== "ranuras" && evalRanuras.maxPossible > evalActual.maxPossible)
            sugerencias.push({ modo: "ranuras", label: "Cruzar Ranura", max: evalRanuras.maxPossible, rootId: root.id });
        if (modoCruce !== "escalones" && evalEscalones.maxPossible > evalActual.maxPossible)
            sugerencias.push({ modo: "escalones", label: "Cruzar Escalón", max: evalEscalones.maxPossible, rootId: root.id });
        if (evalAmbos.maxPossible > Math.max(evalActual.maxPossible, evalRanuras.maxPossible, evalEscalones.maxPossible))
            sugerencias.push({ modo: "ambos", label: "Cruzar Ranura y Escalón", max: evalAmbos.maxPossible, rootId: root.id });
    }
    const dimAreaTxt = evalActual.bestRect
        ? `${evalActual.bestRect.w.toFixed(1)}×${evalActual.bestRect.h.toFixed(1)} mm`
        : `0×0 mm`;
    const descModo =
        modoCruce === "ninguno"
            ? " sin cruzar ranuras/escalones"
            : modoCruce === "ranuras"
              ? " (solo ranuras)"
              : modoCruce === "escalones"
                ? " (solo escalones)"
                : "";
    let msgError = `Límite excedido en ${nombreZona}: pediste ${N} agujero${N > 1 ? "s" : ""} (Ø máx ${maxD.toFixed(1)} mm)${descModo}, pero entran ${evalActual.maxPossible} sin chocar (zona: ${dimAreaTxt}).`;
    return { error: msgError, positions: [], maxPossible: evalActual.maxPossible, sugerencias, rootId: root.id };
}

function getGroupMaxDiameter(op, visited = new Set()) {
    if (visited.has(op.id)) return 0;
    visited.add(op.id);
    let maxD = "dAboc" in op ? op.dAboc || op.dBroca || 10 : op.diam || 10;
    if (op.concentricoId) {
        const parent = perforados.find((x) => x.id === op.concentricoId) || abocardados.find((x) => x.id === op.concentricoId);
        if (parent) {
            const pD = getGroupMaxDiameter(parent, visited);
            if (pD > maxD) maxD = pD;
        }
    }
    [...perforados, ...abocardados]
        .filter((x) => x.concentricoId === op.id)
        .forEach((c) => {
            const cD = getGroupMaxDiameter(c, visited);
            if (cD > maxD) maxD = cD;
        });
    return maxD;
}

function getOperationPositions(op, grilla, dims) {
    const { root } = getConcentricGroup(op);
    const maxD = getGroupMaxDiameter(root);
    return computeAutoPositions(root, grilla, dims, maxD);
}

function getZonaOptions(currentZona) {
    let opts = `<option value="cara_sup" ${currentZona === "cara_sup" ? "selected" : ""}>Cara Superior (auto)</option>`;
    opts += `<option value="cara_inf" ${currentZona === "cara_inf" ? "selected" : ""}>Cara Inferior (auto)</option>`;
    escalones.forEach((e, idx) => {
        const val = "escalon_" + e.id;
        opts += `<option value="${val}" ${currentZona === val ? "selected" : ""}>Escalón #${idx + 1}</option>`;
    });
    ranuras.forEach((r, idx) => {
        const val = "ranura_" + r.id;
        opts += `<option value="${val}" ${currentZona === val ? "selected" : ""}>Ranura #${idx + 1}</option>`;
    });
    return opts;
}

function getConcentricOptions(currentOp, currentType) {
    let opts = `<option value="">Ninguno</option>`;
    perforados.forEach((p, idx) => {
        if (currentType === "perforado" && p.id === currentOp.id) return;
        opts += `<option value="${p.id}" ${currentOp.concentricoId === p.id ? "selected" : ""}>Perforación #${idx + 1} (Ø${p.diam} — ${p.cant} aguj.)</option>`;
    });
    abocardados.forEach((a, idx) => {
        if (currentType === "abocardado" && a.id === currentOp.id) return;
        opts += `<option value="${a.id}" ${currentOp.concentricoId === a.id ? "selected" : ""}>Abocardado #${idx + 1} (Ø${a.dAboc} — ${a.cant} aguj.)</option>`;
    });
    return opts;
}

function buildOpStatusHTML(op) {
    const dims = getDims();
    const grilla = construirGrilla3D(dims.Lf, dims.Wf, dims.Hf);
    const result = getOperationPositions(op, grilla, dims);
    if (!result.error) {
        const n = result.positions.length;
        let detalleZonas = "";
        if (result.zonasUsadas && result.zonasUsadas.length > 0) {
            const partes = result.zonasUsadas.map((z) => {
                const etiqueta =
                    z.tipoZona === "macizo" ? "Macizo" : z.tipoZona === "ranura" ? "Alineado a Ranura" : "Alineado a Escalón";
                return `${z.nAsignados} en ${etiqueta} (${z.w.toFixed(0)}×${z.h.toFixed(1)}mm)`;
            });
            detalleZonas = ` — ${partes.join(" + ")}`;
        }
        return `<div class="p-1.5 rounded border bg-emerald-50 border-emerald-300 text-emerald-800 text-[10px] font-bold">✓ ${n} agujero${n > 1 ? "s" : ""}${detalleZonas} (máx. ${result.maxPossible})</div>`;
    }
    let btnsHTML = "";
    if (result.sugerencias && result.sugerencias.length > 0) {
        btnsHTML = `<div class="mt-1.5 pt-1.5 border-t border-red-200 text-amber-900 font-semibold space-y-1"><div>💡 Podés ampliar el área:</div><div class="flex flex-wrap gap-1.5">${result.sugerencias.map((s) => `<button onclick="cambiarModoCruceGrupo(${s.rootId}, '${s.modo}')" class="bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm transition">🔓 ${s.label} (hasta ${s.max})</button>`).join("")}</div></div>`;
    }
    return `<div class="p-2 rounded border bg-red-50 border-red-400 text-red-900 text-[10px] font-bold leading-snug"><div>⚠️ ${result.error}</div>${btnsHTML}</div>`;
}

function cambiarModoCruceGrupo(rootId, nuevoModo) {
    const op = perforados.find((x) => x.id === rootId) || abocardados.find((x) => x.id === rootId);
    if (!op) return;
    const { group } = getConcentricGroup(op);
    group.forEach((m) => {
        m.modoCruce = nuevoModo;
    });
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function sincronizarHijosConcentricos(rootOp) {
    const { root, group } = getConcentricGroup(rootOp);
    group.forEach((m) => {
        if (m.id === root.id) return;
        m.cant = root.cant;
        m.modoCruce = root.modoCruce || "ninguno";
        if ("dBroca" in m && "diam" in root) m.dBroca = root.diam;
        const inputCant = document.getElementById(`cant_op_${m.id}`);
        if (inputCant) inputCant.value = m.cant;
        const inputBroca = document.getElementById(`dbroca_op_${m.id}`);
        if (inputBroca && "dBroca" in m) inputBroca.value = m.dBroca;
    });
}

function actualizarVistaYAlertas() {
    const dims = getDims();
    const grilla = construirGrilla3D(dims.Lf, dims.Wf, dims.Hf);
    const alertas = [];
    perforados.forEach((p, idx) => {
        const box = document.getElementById(`status_perf_${p.id}`);
        if (box) box.innerHTML = buildOpStatusHTML(p);
        const res = getOperationPositions(p, grilla, dims);
        if (res.error)
            alertas.push({ titulo: `Perforación #${idx + 1} (Ø${p.diam} mm)`, error: res.error, sugerencias: res.sugerencias });
    });
    abocardados.forEach((a, idx) => {
        const box = document.getElementById(`status_aboc_${a.id}`);
        if (box) box.innerHTML = buildOpStatusHTML(a);
        const res = getOperationPositions(a, grilla, dims);
        if (res.error && !a.concentricoId)
            alertas.push({ titulo: `Abocardado #${idx + 1} (Ø${a.dAboc} mm)`, error: res.error, sugerencias: res.sugerencias });
    });
    const banner = document.getElementById("alertaPlanoBanner");
    if (banner) {
        if (alertas.length === 0) {
            banner.className = "hidden mb-3";
            banner.innerHTML = "";
        } else {
            banner.className = "block mb-3 p-3 rounded-lg bg-red-50 border-2 border-red-400 text-red-900 shadow-sm space-y-2";
            banner.innerHTML = `<div class="flex items-center gap-2 font-extrabold text-xs text-red-800 uppercase tracking-wide"><span>🚨 Límite Geométrico Excedido (${alertas.length})</span></div><div class="space-y-1.5 text-xs">${alertas.map((a) => `<div class="p-2 rounded bg-white/90 border border-red-200 flex flex-wrap items-center justify-between gap-2"><div><strong class="text-red-950">${a.titulo}:</strong> ${a.error}</div><div class="flex flex-wrap gap-1.5">${(a.sugerencias || []).map((s) => `<button onclick="cambiarModoCruceGrupo(${s.rootId}, '${s.modo}')" class="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow-sm transition">🔓 ${s.label} (hasta ${s.max})</button>`).join("")}</div></div>`).join("")}</div>`;
        }
    }
    dibujarPiezaCanvas(alertas);
}
