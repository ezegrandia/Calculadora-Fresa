function toggleEtaUI() {
    const c = document.getElementById("chkEta").checked;
    const i = document.getElementById("etaInput");
    i.disabled = !c;
    i.classList.toggle("opacity-50", !c);
}
function toggleTempleUI() {
    document.getElementById("boxTemple").classList.toggle("hidden", !document.getElementById("chkTemple").checked);
}
function toggleRpmUI() {
    const c = document.getElementById("chkMaxRpm").checked;
    const i = document.getElementById("maxRpmInput");
    i.disabled = !c;
    i.classList.toggle("opacity-50", !c);
}
function toggleInsertoPlaneado(fase) {
    const chk = document.getElementById(`plEsInserto${fase}`);
    const box = document.getElementById(`plCodInserto${fase}Box`);
    if (!chk || !box) return;
    box.style.display = chk.checked ? "" : "none";
}
function togglePlaneadoTerminacionUI() {
    const act = document.getElementById("plTerminacionActiva").checked;
    const box = document.getElementById("boxPlTermParams");
    if (box) box.style.display = act ? "" : "none";
}

function alCambiarMaterial() {
    const input = document.getElementById("matInput").value.trim().toUpperCase();
    const boxCustom = document.getElementById("boxCustomMat");
    const infoBox = document.getElementById("matInfoBox");
    let cmcResuelto = null;
    if (DB_MATERIALES[input]) cmcResuelto = input;
    else if (ALIAS_MATERIALES[input]) cmcResuelto = ALIAS_MATERIALES[input];
    else {
        for (const [alias, cmc] of Object.entries(ALIAS_MATERIALES)) {
            if (alias.toUpperCase().includes(input) || input.includes(alias.toUpperCase())) {
                cmcResuelto = cmc;
                break;
            }
        }
    }
    if (cmcResuelto) {
        boxCustom.classList.add("hidden");
        const mat = DB_MATERIALES[cmcResuelto];
        infoBox.innerHTML = `<div class="flex justify-between items-start mb-1"><div class="font-bold text-slate-800 text-[11px] leading-tight pr-2">${mat.nombre}</div><span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-300 shadow-sm whitespace-nowrap">CMC: ${mat.cmc}</span></div><div class="text-[9px] text-slate-500 mb-1">Mapeado desde: <span class="font-semibold text-slate-700">${input}</span></div><div class="grid grid-cols-2 gap-x-2 gap-y-1 bg-white p-1.5 rounded border border-slate-200 mb-1.5"><div class="flex justify-between"><span class="text-slate-500">ISO:</span> <b class="text-slate-800">${mat.iso}</b></div><div class="flex justify-between"><span class="text-slate-500">HB:</span> <b class="text-slate-800">${mat.hb}</b></div><div class="flex justify-between"><span class="text-slate-500">kc:</span> <b class="text-slate-800">${mat.kc} N/mm²</b></div><div class="flex justify-between"><span class="text-slate-500">mc:</span> <b class="text-slate-800">${mat.mc}</b></div></div><div class="flex justify-between text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200"><div class="text-center"><span class="block text-[8px] text-slate-500 uppercase">Vc (Mucho)</span><b class="text-red-600">${mat.vc_mucho} m/min</b></div><div class="text-center border-l border-slate-300 pl-2"><span class="block text-[8px] text-slate-500 uppercase">Vc (Poco)</span><b class="text-sky-600">${mat.vc_poco} m/min</b></div></div>`;
        document.getElementById("matInput").dataset.cmc = cmcResuelto;
        const sel = document.getElementById("cmcSelect");
        if (sel) sel.value = cmcResuelto;
    } else {
        boxCustom.classList.remove("hidden");
        document.getElementById("customNombre").value = input;
        const kc = parseFloat(document.getElementById("customKc").value) || 1800;
        const mc = parseFloat(document.getElementById("customMc").value) || 0.25;
        const vc = parseFloat(document.getElementById("customVc").value) || 250;
        infoBox.innerHTML = `<div class="flex justify-between items-start mb-1"><div class="font-bold text-amber-800 text-[11px]">${input || "Material personalizado"}</div><span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300">CUSTOM</span></div><div class="text-[9px] text-slate-500 mb-1">Complete los datos manualmente abajo</div><div class="grid grid-cols-2 gap-1 text-[10px] bg-white p-1.5 rounded border border-slate-200"><div>kc: <b>${kc} N/mm²</b></div><div>mc: <b>${mc}</b></div><div class="col-span-2 text-center mt-1 pt-1 border-t border-slate-200">Vc sugerida: <b class="text-red-600">${vc} m/min</b></div></div>`;
        document.getElementById("matInput").dataset.cmc = "";
        const sel = document.getElementById("cmcSelect");
        if (sel) sel.value = "";
    }
    notificarCambio();
}

function alCambiarCMCManual() {
    const cmc = document.getElementById("cmcSelect").value;
    if (!cmc) return;
    document.getElementById("matInput").value = cmc;
    document.getElementById("matInput").dataset.cmc = cmc;
    alCambiarMaterial();
}

function alCambiarDimensiones() {
    const d = getDims();
    const dL = Math.max(0, d.Lb - d.Lf);
    const dW = Math.max(0, d.Wb - d.Wf);
    const dH = Math.max(0, d.Hb - d.Hf);
    document.getElementById("infoSobreespesor").textContent =
        `Sobreespesor: ΔL=${dL.toFixed(1)} | ΔW=${dW.toFixed(1)} | ΔH=${dH.toFixed(1)} mm`;
    renderizarEscalones();
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function igualarPrismaATocho() {
    document.getElementById("largoFinalInput").value = document.getElementById("largoInput").value;
    document.getElementById("anchoFinalInput").value = document.getElementById("anchoInput").value;
    document.getElementById("altoFinalInput").value = document.getElementById("altoInput").value;
    alCambiarDimensiones();
}

function renderFasesDesbasteTerminacion(op, onChangePrefix) {
    const esDormerD = op.catalogoDesbaste === "dormer";
    const esDormerT = op.catalogoTerminacion === "dormer";
    const mat = getMaterialActual();
    const toolDesbaste = DB_DORMER_HERRAMIENTAS[op.codigoHerramientaDesbaste];
    const toolTerm = DB_DORMER_HERRAMIENTAS[op.codigoHerramientaTerminacion];
    const dpD = esDormerD ? getDormerParams(mat, op.codigoHerramientaDesbaste, op.dcDesbaste) : null;
    const dpT = esDormerT ? getDormerParams(mat, op.codigoHerramientaTerminacion, op.dcTerminacion) : null;

    return `
    <div class="col-span-2 p-2 rounded bg-red-50/60 border border-red-200 space-y-1.5">
        <div class="font-bold text-[10px] text-red-950">🔧 Herramienta Desbaste</div>
        <div class="flex items-center justify-between mb-1"><label class="font-bold text-[9px]">Catálogo:</label><select onchange="${onChangePrefix}'catalogoDesbaste', this.value)" class="p-0.5 rounded border border-red-300 bg-white text-[9px] font-semibold"><option value="sandvik" ${op.catalogoDesbaste === "sandvik" ? "selected" : ""}>Sandvik</option><option value="dormer" ${op.catalogoDesbaste === "dormer" ? "selected" : ""}>Dormer</option></select></div>
        <div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">Dc (mm)</label><input type="number" value="${op.dcDesbaste}" step="0.1" onchange="${onChangePrefix}'dcDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div><div><label class="text-[9px] block font-semibold">zn (filos)</label><input type="number" value="${op.znDesbaste}" step="1" onchange="${onChangePrefix}'znDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div></div>
        ${
            esDormerD
                ? `<div><label class="text-[9px] block font-semibold">Código herramienta Dormer</label><input type="text" list="dormerToolsDesb" value="${op.codigoHerramientaDesbaste || ""}" placeholder="Ej: C907, S804HA" onchange="${onChangePrefix}'codigoHerramientaDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"><datalist id="dormerToolsDesb">${Object.keys(
                      DB_DORMER_HERRAMIENTAS,
                  )
                      .map((c) => `<option value="${c}">${c} · ${DB_DORMER_HERRAMIENTAS[c].subtipo}</option>`)
                      .join(
                          "",
                      )}</datalist>${toolDesbaste ? `<div class="text-[9px] text-red-800 mono mt-0.5">${toolDesbaste.subtipo} · AMG ${dpD.amg}: <b>Vc=${dpD.vc} m/min (${dpD.letra})</b></div>` : ""}</div>`
                : `<div class="flex items-center gap-1"><input type="checkbox" ${op.esInsertoDesbaste ? "checked" : ""} onchange="${onChangePrefix}'esInsertoDesbaste', this.checked)" class="rounded text-red-600"><label class="text-[9px] font-semibold">Con inserto</label></div><div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">Cód. herramienta</label><input type="text" value="${op.codigoHerramientaDesbaste || ""}" placeholder="Ej: R390" onchange="${onChangePrefix}'codigoHerramientaDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div>${op.esInsertoDesbaste ? `<div><label class="text-[9px] block font-semibold">Cód. inserto</label><input type="text" value="${op.codigoInsertoDesbaste || ""}" placeholder="Ej: R390-11T308M" onchange="${onChangePrefix}'codigoInsertoDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div>` : ""}</div>`
        }
        <div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">Calidad inserto</label><input type="text" value="${op.calidadInsertoDesbaste || ""}" placeholder="Ej: PM" onchange="${onChangePrefix}'calidadInsertoDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div></div>
        <div class="p-1.5 bg-white rounded border border-red-200 space-y-1 mt-1"><div class="text-[9px] font-bold text-red-900">Vc (m/min) - Adoptar</div><div class="grid grid-cols-1 gap-1 text-[9px]"><div><input type="number" value="${op.vcDesbasteOverride || ""}" onchange="${onChangePrefix}'vcDesbasteOverride', this.value)" placeholder="auto" class="w-full p-0.5 rounded border border-red-300 text-center font-bold text-red-700"></div></div></div>
        <div class="flex items-center justify-between border-t border-red-200 pt-1"><label class="font-bold text-[9px]">Empañe:</label><select onchange="${onChangePrefix}'empaneDesbaste', this.value)" class="p-0.5 rounded border border-red-300 bg-white text-[9px] font-semibold"><option value="mucho" ${op.empaneDesbaste === "mucho" ? "selected" : ""}>Mucho (2/3·Dc)</option><option value="poco" ${op.empaneDesbaste === "poco" ? "selected" : ""}>Poco (0.1·Dc)</option></select></div>
        <div class="p-1.5 bg-white rounded border border-red-200 space-y-1 mt-1"><div class="text-[9px] font-bold text-red-900">fz (mm/z) - Adoptar</div><div class="grid grid-cols-1 gap-1 text-[9px]"><div><input type="number" value="${op.fzDesbaste}" onchange="${onChangePrefix}'fzDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-center font-bold text-red-700"></div></div></div>
        <div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">ap</label><input type="number" value="${op.apDesbaste}" step="0.1" onchange="${onChangePrefix}'apDesbaste', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div><div><label class="text-[9px] block font-semibold">Sobrem.</label><input type="number" value="${op.sobreMaterial}" step="0.1" onchange="${onChangePrefix}'sobreMaterial', this.value)" class="w-full p-0.5 rounded border border-red-300 text-[10px] mono bg-white"></div></div>
    </div>
    <div class="col-span-2 p-2 rounded bg-purple-50/60 border border-purple-200 space-y-1.5">
        <div class="flex items-center gap-1"><input type="checkbox" ${op.terminacionActiva ? "checked" : ""} onchange="${onChangePrefix}'terminacionActiva', this.checked)" class="rounded text-purple-600"><label class="font-bold text-[10px] text-purple-950">✨ Terminación activa</label></div>
        ${
            op.terminacionActiva
                ? `
        <div class="font-bold text-[10px] text-purple-950 border-t border-purple-200 pt-1">✨ Herramienta Terminación</div>
        <div class="flex items-center justify-between mb-1"><label class="font-bold text-[9px]">Catálogo:</label><select onchange="${onChangePrefix}'catalogoTerminacion', this.value)" class="p-0.5 rounded border border-purple-300 bg-white text-[9px] font-semibold"><option value="sandvik" ${op.catalogoTerminacion === "sandvik" ? "selected" : ""}>Sandvik</option><option value="dormer" ${op.catalogoTerminacion === "dormer" ? "selected" : ""}>Dormer</option></select></div>
        <div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">Dc (mm)</label><input type="number" value="${op.dcTerminacion}" step="0.1" onchange="${onChangePrefix}'dcTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div><div><label class="text-[9px] block font-semibold">zn (filos)</label><input type="number" value="${op.znTerminacion}" step="1" onchange="${onChangePrefix}'znTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div></div>
        ${
            esDormerT
                ? `<div><label class="text-[9px] block font-semibold">Código herramienta Dormer</label><input type="text" list="dormerToolsTerm" value="${op.codigoHerramientaTerminacion || ""}" placeholder="Ej: C907, S804HA" onchange="${onChangePrefix}'codigoHerramientaTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"><datalist id="dormerToolsTerm">${Object.keys(
                      DB_DORMER_HERRAMIENTAS,
                  )
                      .map((c) => `<option value="${c}">${c} · ${DB_DORMER_HERRAMIENTAS[c].subtipo}</option>`)
                      .join(
                          "",
                      )}</datalist>${toolTerm ? `<div class="text-[9px] text-purple-800 mono mt-0.5">${toolTerm.subtipo} · AMG ${dpT.amg}: <b>Vc=${dpT.vc} m/min (${dpT.letra})</b></div>` : ""}</div>`
                : `<div class="flex items-center gap-1"><input type="checkbox" ${op.esInsertoTerminacion ? "checked" : ""} onchange="${onChangePrefix}'esInsertoTerminacion', this.checked)" class="rounded text-purple-600"><label class="text-[9px] font-semibold">Con inserto</label></div><div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">Cód. herramienta</label><input type="text" value="${op.codigoHerramientaTerminacion || ""}" placeholder="Ej: R390" onchange="${onChangePrefix}'codigoHerramientaTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div>${op.esInsertoTerminacion ? `<div><label class="text-[9px] block font-semibold">Cód. inserto</label><input type="text" value="${op.codigoInsertoTerminacion || ""}" placeholder="Ej: R390-11T308E" onchange="${onChangePrefix}'codigoInsertoTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div>` : ""}</div>`
        }
        <div class="grid grid-cols-2 gap-1"><div><label class="text-[9px] block font-semibold">Calidad inserto</label><input type="text" value="${op.calidadInsertoTerminacion || ""}" placeholder="Ej: PL" onchange="${onChangePrefix}'calidadInsertoTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div></div>
        <div class="p-1.5 bg-white rounded border border-purple-200 space-y-1 mt-1"><div class="text-[9px] font-bold text-purple-900">Vc (m/min) - Adoptar</div><div class="grid grid-cols-1 gap-1 text-[9px]"><div><input type="number" value="${op.vcTerminacionOverride || ""}" onchange="${onChangePrefix}'vcTerminacionOverride', this.value)" placeholder="auto" class="w-full p-0.5 rounded border border-purple-300 text-center font-bold text-purple-700"></div></div></div>
        <div class="flex items-center justify-between border-t border-purple-200 pt-1"><label class="font-bold text-[9px]">Empañe:</label><select onchange="${onChangePrefix}'empaneTerminacion', this.value)" class="p-0.5 rounded border border-purple-300 bg-white text-[9px] font-semibold"><option value="mucho" ${op.empaneTerminacion === "mucho" ? "selected" : ""}>Mucho (2/3·Dc)</option><option value="poco" ${op.empaneTerminacion === "poco" ? "selected" : ""}>Poco (0.1·Dc)</option></select></div>
        <div class="p-1.5 bg-white rounded border border-purple-200 space-y-1 mt-1"><div class="text-[9px] font-bold text-purple-900">fz (mm/z) - Adoptar</div><div class="grid grid-cols-1 gap-1 text-[9px]"><div><input type="number" value="${op.fzTerminacion}" onchange="${onChangePrefix}'fzTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-center font-bold text-purple-700"></div></div></div>
        <div class="grid grid-cols-3 gap-1 mt-1"><div><label class="text-[9px] block font-semibold">ap (mm)</label><input type="number" value="${op.apTerminacion}" step="0.1" onchange="${onChangePrefix}'apTerminacion', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div><div class="col-span-2"><label class="text-[9px] block font-semibold">Forzar ae (mm)</label><input type="number" value="${op.aeTerminacionOverride || ""}" placeholder="auto" onchange="${onChangePrefix}'aeTerminacionOverride', this.value)" class="w-full p-0.5 rounded border border-purple-300 text-[10px] mono bg-white"></div></div>
        `
                : ""
        }
    </div>`;
}
