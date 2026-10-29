// ============================================================
// ESCALONES
// ============================================================
function agregarEscalon() {
    const dims = getDims();
    idCounter++;
    escalones.push({
        id: idCounter,
        ubicacion: "sup_izq",
        ancho: 20,
        prof: 20,
        largo: dims.Lf,
        pasante: true,
        ...DEFAULTS_OP,
        catalogoDesbaste: "dormer",
        catalogoTerminacion: "dormer",
        dcDesbaste: 12,
        znDesbaste: 4,
        dcTerminacion: 12,
        znTerminacion: 4,
        codigoHerramientaDesbaste: "S904",
        codigoHerramientaTerminacion: "S904",
    });
    renderizarEscalones();
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function eliminarEscalon(id) {
    escalones = escalones.filter((e) => e.id !== id);
    renderizarEscalones();
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function updateEscalon(id, field, val) {
    const e = escalones.find((x) => x.id === id);
    if (!e) return;
    const dims = getDims();
    if (field === "ubicacion") {
        e.ubicacion = val;
        const info = INFO_UBICACION_ESCALON[val] || INFO_UBICACION_ESCALON.sup_izq;
        if (e.pasante) e.largo = info.ejeLargo === "L" ? dims.Lf : dims.Wf;
        renderizarEscalones();
        notificarCambio();
        return;
    }
    if (field === "pasante") {
        e.pasante = Boolean(val);
        const info = INFO_UBICACION_ESCALON[e.ubicacion] || INFO_UBICACION_ESCALON.sup_izq;
        if (e.pasante) e.largo = info.ejeLargo === "L" ? dims.Lf : dims.Wf;
        renderizarEscalones();
        notificarCambio();
        return;
    }
    const result = setOpField(e, field, val);
    if (result === "rerender") renderizarEscalones();
    notificarCambio();
}

function renderizarEscalones() {
    const el = document.getElementById("listaEscalones");
    if (!el) return;
    const dims = getDims();
    el.innerHTML = escalones
        .map((e, idx) => {
            const info = INFO_UBICACION_ESCALON[e.ubicacion] || INFO_UBICACION_ESCALON.sup_izq;
            const dimMaxLargo = info.ejeLargo === "L" ? dims.Lf : dims.Wf;
            const largoMostrar = e.pasante ? dimMaxLargo : e.largo;
            return `<div class="op-card">
            <div class="flex justify-between items-center mb-1 border-b pb-1"><span class="font-bold text-[10px] text-red-900 uppercase">Escalón #${idx + 1}</span><button onclick="eliminarEscalon(${e.id})" class="text-red-500 font-bold px-1">✕</button></div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div class="col-span-2"><label class="block text-slate-600 mb-0.5">Arista:</label><select onchange="updateEscalon(${e.id}, 'ubicacion', this.value)" class="w-full p-1 rounded border bg-white font-semibold text-slate-800">
                    <optgroup label="Cara Superior"><option value="sup_izq" ${e.ubicacion === "sup_izq" ? "selected" : ""}>Sup. — Lat. Izq</option><option value="sup_der" ${e.ubicacion === "sup_der" ? "selected" : ""}>Sup. — Lat. Der</option><option value="sup_frente" ${e.ubicacion === "sup_frente" ? "selected" : ""}>Sup. — Frente</option><option value="sup_atras" ${e.ubicacion === "sup_atras" ? "selected" : ""}>Sup. — Atrás</option></optgroup>
                    <optgroup label="Cara Inferior"><option value="inf_izq" ${e.ubicacion === "inf_izq" ? "selected" : ""}>Inf. — Lat. Izq</option><option value="inf_der" ${e.ubicacion === "inf_der" ? "selected" : ""}>Inf. — Lat. Der</option><option value="inf_frente" ${e.ubicacion === "inf_frente" ? "selected" : ""}>Inf. — Frente</option><option value="inf_atras" ${e.ubicacion === "inf_atras" ? "selected" : ""}>Inf. — Atrás</option></optgroup>
                </select></div>
                <div class="col-span-2"><label class="flex items-center gap-1.5 font-semibold text-red-950 cursor-pointer"><input type="checkbox" ${e.pasante ? "checked" : ""} onchange="updateEscalon(${e.id}, 'pasante', this.checked)" class="rounded text-red-600"><span>De extremo a extremo (${info.ejeLargo} = ${dimMaxLargo} mm)</span></label></div>
                <div><label>Ancho:</label><input type="number" value="${e.ancho}" oninput="updateEscalon(${e.id}, 'ancho', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Prof.:</label><input type="number" value="${e.prof}" oninput="updateEscalon(${e.id}, 'prof', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Largo:</label><input type="number" value="${largoMostrar}" ${e.pasante ? "disabled" : ""} oninput="updateEscalon(${e.id}, 'largo', this.value)" class="w-full p-1 rounded border font-mono ${e.pasante ? "bg-slate-100 text-slate-500" : "bg-white"}"></div>
                ${renderFasesDesbasteTerminacion(e, `updateEscalon(${e.id}, `)}
            </div></div>`;
        })
        .join("");
}

// ============================================================
// RANURAS
// ============================================================
function agregarRanura() {
    const dims = getDims();
    idCounter++;
    ranuras.push({
        id: idCounter,
        cara: "sup_long",
        ancho: 20,
        prof: 15,
        largo: dims.Lf,
        pos: Math.max(0, (dims.Wf - 20) / 2),
        centrada: true,
        ...DEFAULTS_OP,
        catalogoDesbaste: "dormer",
        catalogoTerminacion: "dormer",
        dcDesbaste: 12,
        znDesbaste: 2,
        dcTerminacion: 12,
        znTerminacion: 2,
        codigoHerramientaDesbaste: "S802HA",
        codigoHerramientaTerminacion: "S802HA",
    });
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function eliminarRanura(id) {
    ranuras = ranuras.filter((r) => r.id !== id);
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function updateRanura(id, field, val) {
    const r = ranuras.find((x) => x.id === id);
    if (!r) return;
    const dims = getDims();
    if (field === "cara") {
        r.cara = val;
        const info = INFO_CARA_RANURA[val] || INFO_CARA_RANURA.sup_long;
        r.largo = info.ejeLargo === "L" ? dims.Lf : dims.Wf;
        const dimPos = info.ejePos === "W" ? dims.Wf : info.ejePos === "L" ? dims.Lf : dims.Hf;
        if (r.centrada) r.pos = Math.max(0, (dimPos - r.ancho) / 2);
        renderizarRanuras();
        notificarCambio();
        return;
    }
    if (field === "centrada") {
        r.centrada = Boolean(val);
        renderizarRanuras();
        notificarCambio();
        return;
    }
    const result = setOpField(r, field, val);
    if (result === "rerender") renderizarRanuras();
    notificarCambio();
}

function renderizarRanuras() {
    const el = document.getElementById("listaRanuras");
    if (!el) return;
    const dims = getDims();
    el.innerHTML = ranuras
        .map((r, idx) => {
            const info = INFO_CARA_RANURA[r.cara] || INFO_CARA_RANURA.sup_long;
            const dimPosMax = info.ejePos === "W" ? dims.Wf : info.ejePos === "L" ? dims.Lf : dims.Hf;
            const posCalc = r.centrada ? Math.max(0, (dimPosMax - r.ancho) / 2).toFixed(1) : r.pos;
            return `<div class="op-card">
            <div class="flex justify-between items-center mb-1 border-b pb-1"><span class="font-bold text-[10px] text-amber-900 uppercase">Ranura #${idx + 1}</span><button onclick="eliminarRanura(${r.id})" class="text-red-500 font-bold px-1">✕</button></div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div class="col-span-2"><label class="block text-slate-600 mb-0.5">Ubicación:</label><select onchange="updateRanura(${r.id}, 'cara', this.value)" class="w-full p-1 rounded border bg-white font-semibold text-slate-800">
                    <optgroup label="Arriba"><option value="sup_long" ${r.cara === "sup_long" ? "selected" : ""}>Sup — Longitudinal</option><option value="sup_trans" ${r.cara === "sup_trans" ? "selected" : ""}>Sup — Transversal</option></optgroup>
                    <optgroup label="Abajo"><option value="inf_long" ${r.cara === "inf_long" ? "selected" : ""}>Inf — Longitudinal</option><option value="inf_trans" ${r.cara === "inf_trans" ? "selected" : ""}>Inf — Transversal</option></optgroup>
                    <optgroup label="Costados"><option value="lat_izq" ${r.cara === "lat_izq" ? "selected" : ""}>Lat. Izq</option><option value="lat_der" ${r.cara === "lat_der" ? "selected" : ""}>Lat. Der</option><option value="frente" ${r.cara === "frente" ? "selected" : ""}>Frente</option><option value="atras" ${r.cara === "atras" ? "selected" : ""}>Atrás</option></optgroup>
                </select></div>
                <div class="col-span-2"><label class="flex items-center gap-1.5 font-semibold text-amber-950 cursor-pointer"><input type="checkbox" ${r.centrada ? "checked" : ""} onchange="updateRanura(${r.id}, 'centrada', this.checked)" class="rounded text-amber-600"><span>Centrar (${info.ejePos})</span></label></div>
                <div><label>Ancho:</label><input type="number" value="${r.ancho}" oninput="updateRanura(${r.id}, 'ancho', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Prof.:</label><input type="number" value="${r.prof}" oninput="updateRanura(${r.id}, 'prof', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Pos (${info.ejePos}):</label><input type="number" value="${posCalc}" ${r.centrada ? "disabled" : ""} oninput="updateRanura(${r.id}, 'pos', this.value)" class="w-full p-1 rounded border font-mono ${r.centrada ? "bg-slate-100 text-slate-500" : "bg-white"}"></div>
                ${renderFasesDesbasteTerminacion(r, `updateRanura(${r.id}, `)}
            </div></div>`;
        })
        .join("");
}

// ============================================================
// PERFORADOS
// ============================================================
function agregarPerforado() {
    idCounter++;
    perforados.push({
        id: idCounter,
        diam: 10,
        tipo: "pasante",
        prof: 25,
        cant: 2,
        zona: "cara_sup",
        concentricoId: null,
        modoCruce: "ninguno",
        pretaladradoActivo: true,
        catalogo: "dormer",
        codigoHerramienta: "R510",
    });
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function eliminarPerforado(id) {
    perforados = perforados.filter((p) => p.id !== id);
    perforados.forEach((p) => {
        if (p.concentricoId === id) p.concentricoId = null;
    });
    abocardados.forEach((a) => {
        if (a.concentricoId === id) a.concentricoId = null;
    });
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function updatePerforado(id, field, val) {
    const p = perforados.find((x) => x.id === id);
    if (!p) return;
    if (field === "concentricoId") {
        p.concentricoId = val ? parseInt(val) : null;
        if (p.concentricoId) {
            const { root } = getConcentricGroup(p);
            p.cant = root.cant;
            p.modoCruce = root.modoCruce || "ninguno";
        }
        renderizarPerforados();
        renderizarAbocardados();
        notificarCambio();
        return;
    }
    if (field === "tipo") {
        p.tipo = val;
        renderizarPerforados();
        notificarCambio();
        return;
    }
    if (field === "zona") {
        p.zona = val;
        sincronizarHijosConcentricos(p);
        notificarCambio();
        return;
    }
    if (field === "modoCruce") {
        const { group } = getConcentricGroup(p);
        group.forEach((m) => {
            m.modoCruce = val;
        });
        renderizarPerforados();
        renderizarAbocardados();
        notificarCambio();
        return;
    }
    if (field === "pretaladradoActivo") {
        p.pretaladradoActivo = Boolean(val);
        renderizarPerforados();
        notificarCambio();
        return;
    }
    if (field === "catalogo" || field === "codigoHerramienta") {
        p[field] = val.trim();
        renderizarPerforados();
        notificarCambio();
        return;
    }
    p[field] = parseFloat(val) || 0;
    sincronizarHijosConcentricos(p);
    notificarCambio();
}

function renderizarPerforados() {
    const el = document.getElementById("listaPerforados");
    if (!el) return;
    el.innerHTML = perforados
        .map((p, idx) => {
            const { root } = getConcentricGroup(p);
            if (p.concentricoId && root.id !== p.id) {
                p.cant = root.cant;
                p.modoCruce = root.modoCruce || "ninguno";
            }
            const conc = p.concentricoId ? "disabled" : "";
            const modoActual = root.modoCruce || "ninguno";
            const secuencia = calcularSecuenciaMechas(p.diam);
            const pretaladradoActivo = p.pretaladradoActivo !== false;
            const secuenciaTxt = pretaladradoActivo
                ? secuencia
                      .map((m, i, arr) => `<b>Ø${m.d}</b>${i < arr.length - 1 ? ' <span class="text-slate-400">→</span> ' : ""}`)
                      .join("")
                : `<b>Ø${p.diam}</b> <span class="text-slate-400">(solo mecha final)</span>`;
            return `<div class="op-card">
            <div class="flex justify-between items-center mb-1 border-b pb-1"><span class="font-bold text-[10px] text-teal-900 uppercase">Perforación #${idx + 1}</span><button onclick="eliminarPerforado(${p.id})" class="text-red-500 font-bold px-1">✕</button></div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div><label>Ø Broca:</label><input type="number" value="${p.diam}" oninput="updatePerforado(${p.id}, 'diam', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Cantidad:</label><input id="cant_op_${p.id}" type="number" value="${p.cant}" ${conc} oninput="updatePerforado(${p.id}, 'cant', this.value)" class="w-full p-1 rounded border font-mono ${conc ? "bg-slate-100 text-slate-500" : "bg-white"}"></div>
                <div><label>Tipo:</label><select onchange="updatePerforado(${p.id}, 'tipo', this.value)" class="w-full p-1 rounded border bg-white font-semibold">
                    <option value="pasante" ${p.tipo === "pasante" ? "selected" : ""}>Pasante</option>
                    <option value="ciego" ${p.tipo === "ciego" ? "selected" : ""}>Ciego</option>
                </select></div>
                <div>${p.tipo === "ciego" ? `<label>Prof.:</label><input type="number" value="${p.prof}" oninput="updatePerforado(${p.id}, 'prof', this.value)" class="w-full p-1 rounded border font-mono bg-white">` : '<label class="opacity-0">Prof.</label><input disabled class="w-full p-1 rounded border font-mono bg-slate-100 text-slate-400">'}</div>
                ${p.tipo === "pasante" ? `<div class="col-span-2 p-1.5 rounded bg-teal-50/80 border border-teal-200"><label class="block font-bold text-teal-950 mb-0.5 text-[10px]">Condición de Paso:</label><select onchange="updatePerforado(${p.id}, 'modoCruce', this.value)" class="w-full p-1 rounded border border-teal-300 bg-white font-semibold text-slate-800 text-[11px]"><option value="ninguno" ${modoActual === "ninguno" ? "selected" : ""}>🔒 Solo cara a cara externa</option><option value="ambos" ${modoActual === "ambos" ? "selected" : ""}>🔓 Admitir ranuras y escalones</option><option value="ranuras" ${modoActual === "ranuras" ? "selected" : ""}>🔓 Admitir solo ranuras</option><option value="escalones" ${modoActual === "escalones" ? "selected" : ""}>🔓 Admitir solo escalones</option></select></div>` : ""}
                <div class="col-span-2"><label>Zona de entrada:</label><select onchange="updatePerforado(${p.id}, 'zona', this.value)" class="w-full p-1 rounded border bg-white font-semibold">${getZonaOptions(p.zona)}</select></div>
                <div class="col-span-2 p-2 rounded bg-cyan-50 border border-cyan-200 space-y-1">
                    <label class="flex items-center gap-1.5 font-bold text-[10px] text-cyan-950 cursor-pointer">
                        <input type="checkbox" ${pretaladradoActivo ? "checked" : ""} onchange="updatePerforado(${p.id}, 'pretaladradoActivo', this.checked)" class="rounded text-cyan-600">
                        <span>Pre-taladrado activo (mecha de centro / previa)</span>
                    </label>
                    <div class="text-[10px] mono text-cyan-900">Secuencia: ${secuenciaTxt}</div>
                </div>
                <div class="col-span-2"><label>Concéntrico con:</label><select onchange="updatePerforado(${p.id}, 'concentricoId', this.value)" class="w-full p-1 rounded border bg-white font-semibold">${getConcentricOptions(p, "perforado")}</select></div>
                <div id="status_perf_${p.id}" class="col-span-2 mt-1">${buildOpStatusHTML(p)}</div>
            </div></div>`;
        })
        .join("");
}

// ============================================================
// ABOCARDADOS
// ============================================================
function agregarAbocardado() {
    idCounter++;
    const refPerf = perforados.length > 0 ? perforados[perforados.length - 1] : null;
    const cantInicial = refPerf ? refPerf.cant : 2;
    const dBrocaInicial = refPerf ? refPerf.diam : 10;
    const dAbocInicial = 14;
    abocardados.push({
        id: idCounter,
        dBroca: dBrocaInicial,
        dAboc: dAbocInicial,
        prof: 8.6,
        cant: cantInicial,
        zona: "cara_sup",
        concentricoId: null,
        modoCruce: "ninguno",
        ...DEFAULTS_OP,
        catalogoDesbaste: "dormer",
        catalogoTerminacion: "dormer",
        dcDesbaste: dAbocInicial,
        znDesbaste: 2,
        dcTerminacion: dAbocInicial,
        znTerminacion: 4,
        codigoHerramientaDesbaste: "A100",
        codigoHerramientaTerminacion: "A100",
    });
    renderizarAbocardados();
    renderizarPerforados();
    notificarCambio();
}

function eliminarAbocardado(id) {
    abocardados = abocardados.filter((a) => a.id !== id);
    perforados.forEach((p) => {
        if (p.concentricoId === id) p.concentricoId = null;
    });
    abocardados.forEach((a) => {
        if (a.concentricoId === id) a.concentricoId = null;
    });
    renderizarAbocardados();
    renderizarPerforados();
    notificarCambio();
}

function updateAbocardado(id, field, val) {
    const a = abocardados.find((x) => x.id === id);
    if (!a) return;
    if (field === "concentricoId") {
        a.concentricoId = val ? parseInt(val) : null;
        if (a.concentricoId) {
            const { root } = getConcentricGroup(a);
            a.cant = root.cant;
            a.modoCruce = root.modoCruce || "ninguno";
            if ("diam" in root) a.dBroca = root.diam;
        }
        renderizarAbocardados();
        renderizarPerforados();
        notificarCambio();
        return;
    }
    if (field === "zona") {
        a.zona = val;
        sincronizarHijosConcentricos(a);
        notificarCambio();
        return;
    }
    if (field === "modoCruce") {
        const { group } = getConcentricGroup(a);
        group.forEach((m) => {
            m.modoCruce = val;
        });
        renderizarPerforados();
        renderizarAbocardados();
        notificarCambio();
        return;
    }
    if (field === "dAboc") {
        const oldAboc = a.dAboc;
        const newAboc = parseFloat(val) || 0;
        if (Math.abs(a.dcDesbaste - oldAboc) < 0.01) a.dcDesbaste = newAboc;
        if (Math.abs(a.dcTerminacion - oldAboc) < 0.01) a.dcTerminacion = newAboc;
        a.dAboc = newAboc;
        renderizarAbocardados();
        notificarCambio();
        return;
    }
    const result = setOpField(a, field, val);
    if (result === "rerender") renderizarAbocardados();
    notificarCambio();
}

function renderizarAbocardados() {
    const el = document.getElementById("listaAbocardados");
    if (!el) return;
    el.innerHTML = abocardados
        .map((a, idx) => {
            const { root } = getConcentricGroup(a);
            if (a.concentricoId && root.id !== a.id) {
                a.cant = root.cant;
                a.modoCruce = root.modoCruce || "ninguno";
                if ("diam" in root) a.dBroca = root.diam;
            }
            const conc = a.concentricoId ? "disabled" : "";
            const modoActual = root.modoCruce || "ninguno";
            const avisoTool =
                a.dcDesbaste < a.dAboc * 0.95
                    ? `<div class="col-span-2 p-1 rounded bg-yellow-50 border border-yellow-300 text-yellow-900 text-[9px] font-semibold">⚠️ Dc desbaste (${a.dcDesbaste}) &lt; dAboc (${a.dAboc}). Se requieren pasadas radiales extra.</div>`
                    : "";
            return `<div class="op-card">
            <div class="flex justify-between items-center mb-1 border-b pb-1"><span class="font-bold text-[10px] text-purple-900 uppercase">Abocardado #${idx + 1}</span><button onclick="eliminarAbocardado(${a.id})" class="text-red-500 font-bold px-1">✕</button></div>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div><label>Ø Broca:</label><input id="dbroca_op_${a.id}" type="number" value="${a.dBroca}" ${conc} oninput="updateAbocardado(${a.id}, 'dBroca', this.value)" class="w-full p-1 rounded border font-mono ${conc ? "bg-slate-100 text-slate-500" : "bg-white"}"></div>
                <div><label>Ø Aboc (feature):</label><input type="number" value="${a.dAboc}" oninput="updateAbocardado(${a.id}, 'dAboc', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Prof. Aboc:</label><input type="number" value="${a.prof}" oninput="updateAbocardado(${a.id}, 'prof', this.value)" class="w-full p-1 rounded border font-mono bg-white"></div>
                <div><label>Cantidad:</label><input id="cant_op_${a.id}" type="number" value="${a.cant}" ${conc} oninput="updateAbocardado(${a.id}, 'cant', this.value)" class="w-full p-1 rounded border font-mono ${conc ? "bg-slate-100 text-slate-500" : "bg-white"}"></div>
                <div class="col-span-2 p-1.5 rounded bg-purple-50/80 border border-purple-200"><label class="block font-bold text-purple-950 mb-0.5 text-[10px]">Condición de Paso:</label><select onchange="updateAbocardado(${a.id}, 'modoCruce', this.value)" class="w-full p-1 rounded border border-purple-300 bg-white font-semibold text-slate-800 text-[11px]"><option value="ninguno" ${modoActual === "ninguno" ? "selected" : ""}>🔒 Solo cara a cara externa</option><option value="ambos" ${modoActual === "ambos" ? "selected" : ""}>🔓 Admitir ranuras y escalones</option><option value="ranuras" ${modoActual === "ranuras" ? "selected" : ""}>🔓 Admitir solo ranuras</option><option value="escalones" ${modoActual === "escalones" ? "selected" : ""}>🔓 Admitir solo escalones</option></select></div>
                <div class="col-span-2"><label>Zona de entrada:</label><select onchange="updateAbocardado(${a.id}, 'zona', this.value)" class="w-full p-1 rounded border bg-white font-semibold">${getZonaOptions(a.zona)}</select></div>
                <div class="col-span-2"><label>Concéntrico con:</label><select onchange="updateAbocardado(${a.id}, 'concentricoId', this.value)" class="w-full p-1 rounded border bg-white font-semibold">${getConcentricOptions(a, "abocardado")}</select></div>
                ${avisoTool}
                ${renderFasesDesbasteTerminacion(a, `updateAbocardado(${a.id}, `)}
                <div id="status_aboc_${a.id}" class="col-span-2 mt-1">${buildOpStatusHTML(a)}</div>
            </div></div>`;
        })
        .join("");
}
