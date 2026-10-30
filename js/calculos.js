// ============================================================
// ESTADO DE VALIDEZ DE CÁLCULOS
// ============================================================
let calculosValidos = false;

function renderPlaceholderReporte() {
    return `
        <div class="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
            <div>
                <div class="text-[11px] font-bold text-slate-500">UNIVERSIDAD NACIONAL DE CUYO • ITU</div>
                <h2 class="text-lg font-extrabold text-slate-900">INFORME TÉCNICO DE FRESADO</h2>
            </div>
        </div>
        <div class="mt-8 p-8 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-center">
            <div class="text-5xl mb-4">📋</div>
            <div class="font-extrabold text-xl text-amber-900 mb-3">Resultados desactualizados</div>
            <p class="text-sm text-amber-800 max-w-lg mx-auto mb-5">
                Cualquier modificación en los datos, dimensiones u operaciones invalida los cálculos anteriores.
                Presioná <b>Calcular</b> para generar el informe completo con los datos actuales.
            </p>
            <button onclick="ejecutarCalculoCompleto()" class="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg ring-2 ring-emerald-400/50 transition">
                🧮 Calcular ahora
            </button>
        </div>
    `;
}

function invalidarCalculos() {
    calculosValidos = false;
    const el = document.getElementById("reporteAcademico");
    if (el) el.innerHTML = renderPlaceholderReporte();
}

// ============================================================
// ADAPTACIÓN DE RPM SEGÚN CAJA DE VELOCIDADES / LÍMITE HUSILLO
// ============================================================
function getListaCajaRpm() {
    const chk = document.getElementById("chkCajaRpm");
    const inp = document.getElementById("cajaRpmInput");
    if (!chk || !chk.checked || !inp) return [];
    return inp.value
        .split(/[\s,;]+/)
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v) && v > 0)
        .sort((a, b) => a - b);
}

function obtenerRpmMaquina(n_teorica, usaMaxRpm, maxRpm) {
    let n = usaMaxRpm && n_teorica > maxRpm ? maxRpm : n_teorica;
    const escalonesRpm = getListaCajaRpm();
    if (escalonesRpm.length > 0) {
        const inferiores = escalonesRpm.filter((r) => r <= n);
        // Adopta el valor inferior más cercano (si n es menor al mínimo de la caja, usa el primer escalón)
        n = inferiores.length > 0 ? inferiores[inferiores.length - 1] : escalonesRpm[0];
    }
    return n;
}

// ============================================================
// CÁLCULOS DE FASE
// ============================================================
function calcularFaseCorte(
    profFase,
    anchoFase,
    aeFase,
    vcFase,
    fzFase,
    apFase,
    dcFase,
    znFase,
    largoBase,
    kc,
    usaMaxRpm,
    maxRpm,
    eta,
) {
    if (profFase <= 0.001) return null;
    const dcSafe = Math.max(0.01, dcFase);
    const znSafe = Math.max(1, Math.round(znFase));
    const fzSafe = Math.max(0.001, fzFase);
    const apSafe = Math.max(0.01, apFase);

    const apReal = Math.min(apSafe, profFase);
    const Lrec = largoBase + dcSafe;
    const n_teorica = (vcFase * 1000) / (Math.PI * dcSafe);
    const n = obtenerRpmMaquina(n_teorica, usaMaxRpm, maxRpm);
    const vf = n * fzSafe * znSafe;
    const nPasadasProf = Math.ceil(profFase / apReal);
    const nPasadasAncho = Math.ceil(anchoFase / aeFase);
    const t = (Lrec / vf) * nPasadasProf * nPasadasAncho;

    const aeReal = Math.min(anchoFase, aeFase);
    const pcBruta = (aeReal * apReal * vf * kc) / 60e6;
    const pc = pcBruta / eta;

    return {
        n,
        n_teorica,
        vf,
        nPasadasProf,
        nPasadasAncho,
        t,
        pc,
        pcBruta,
        Lrec,
        profFase,
        aeFase: aeReal,
        vcFase,
        dcFase: dcSafe,
        znFase: znSafe,
        fz: fzSafe,
        ap: apReal,
        anchoFase,
        pcFormulaData: { ae: aeReal, ap: apReal, vf: vf, kc: kc },
    };
}

function calcularFaseAbocardado(profFase, vcFase, fzFase, apFase, dcFase, znFase, N, dBroca, dAboc, kc, usaMaxRpm, maxRpm, eta) {
    if (profFase <= 0.001) return null;
    const dcSafe = Math.max(0.01, dcFase);
    const znSafe = Math.max(1, Math.round(znFase));
    const fzSafe = Math.max(0.001, fzFase);
    const apSafe = Math.max(0.01, apFase);
    const n_teorica = (vcFase * 1000) / (Math.PI * dcSafe);
    const n = obtenerRpmMaquina(n_teorica, usaMaxRpm, maxRpm);
    const vf = n * fzSafe * znSafe;
    const radialCoverage = Math.max(0.1, dAboc - dBroca);
    const radialStep = Math.max(0.1, dcSafe - dBroca);
    const nRadialPasses = Math.max(1, Math.ceil(radialCoverage / radialStep));

    // FORZAMOS EL TIEMPO A PROF * N (SIN MARGEN EXTRA DE PUNTA)
    const t = (nRadialPasses * (profFase * N)) / vf;

    const pcRingWidth = Math.max(0, Math.min(dcSafe, dAboc) - dBroca);
    const pcBruta = (pcRingWidth * profFase * vf * kc) / 60e6;
    const pc = pcBruta / eta;

    return {
        n,
        n_teorica,
        vf,
        t,
        pc,
        pcBruta,
        nRadialPasses,
        profFase,
        vcFase,
        dcFase: dcSafe,
        znFase: znSafe,
        fz: fzSafe,
        ap: apSafe,
        N,
        dBroca,
        dAboc,
        radialCoverage,
        radialStep,
        pcRingWidth,
        pcFormulaData: { ae: pcRingWidth, ap: profFase, vf: vf, kc: kc },
    };
}

function calcularFaseMecha(diam, vc, fn, totalDepth, N, usaMaxRpm, maxRpm, kc, eta) {
    const n_teorica = (vc * 1000) / (Math.PI * diam);
    const n = obtenerRpmMaquina(n_teorica, usaMaxRpm, maxRpm);
    const vf = n * fn;

    // Si n se adaptó por caja de velocidades o tope, calculamos Vc real para la potencia de mecha
    const vcReal = Math.abs(n - n_teorica) > 0.5 ? (Math.PI * diam * n) / 1000 : vc;

    // FORZAMOS LA CARRERA A (PROF/N + 5MM) * N
    const t = ((totalDepth / N + 5) * N) / vf;
    const profMostrar = totalDepth / N + 5;

    const pcBruta = (diam * fn * vcReal * kc) / (240 * 1000);
    const pc = pcBruta / eta;

    return {
        diam,
        n,
        n_teorica,
        vcReal,
        vf,
        t,
        pc,
        pcBruta,
        fn,
        totalDepth: profMostrar,
        pcFormulaData: { d: diam, fn: fn, vc: Number(vcReal.toFixed(2)), kc: kc },
    };
}

// ============================================================
// HELPERS DE FÓRMULAS CON FRACCIONES
// ============================================================
function fRow(label, formulaHTML, substHTML, resultHTML, unit = "") {
    return `<div class="formula-line">
        <span class="lbl">${label}</span> =
        <span class="subst">${formulaHTML}</span> =
        <span class="subst">${substHTML}</span> =
        <span class="result">${resultHTML}${unit ? " " + unit : ""}</span>
    </div>`;
}

function htmlFilaRpm(vc, diam, n_teorica, n_final) {
    const adaptada = Math.abs(n_final - n_teorica) > 0.5;
    if (!adaptada) {
        return fRow("n", `${frac("Vc · 1000", "π · Dc")}`, `${frac(vc + " · 1000", "π · " + diam)}`, fmt(n_final, 0), "rpm");
    }
    return fRow(
        "n",
        `${frac("Vc · 1000", "π · Dc")}`,
        `${frac(vc + " · 1000", "π · " + diam)} = ${fmt(n_teorica, 0)} rpm → <b>Adoptado (Caja):</b>`,
        fmt(n_final, 0),
        "rpm",
    );
}

function htmlFormulaFaseCorte(fase, tipo, datos) {
    if (!fase)
        return `<div class="text-[10px] text-slate-500 italic px-2 py-1">Fase no activa (sobrematerial ≥ profundidad)</div>`;
    const colorCls = tipo === "desbaste" ? "red" : "purple";
    const label = tipo === "desbaste" ? "🔧 DESBASTE" : "✨ TERMINACIÓN";
    const calidadTxt = datos.calidad ? ` · Calidad: ${datos.calidad}` : "";
    const fEmpane = datos.empane === "mucho" ? frac("2", "3") : "0.1";

    return `
    <div class="formula-box ${colorCls}">
        <div class="formula-section-title ${colorCls}">${label} · Dc=${datos.dc}mm · zn=${datos.zn} · Vc=${datos.vc} m/min · empañe=${datos.empane}${calidadTxt}</div>
        ${fRow("ae", `${fEmpane} · Dc`, `${fEmpane} · ${datos.dc}`, fmt(fase.aeFase), "mm")}
        ${htmlFilaRpm(datos.vc, datos.dc, fase.n_teorica, fase.n)}
        ${fRow("Vf", `n · fz · zn`, `${fmt(fase.n, 0)} · ${datos.fz} · ${datos.zn}`, fmt(fase.vf, 0), "mm/min")}
        ${fRow("L<sub>rec</sub>", `L + Dc`, `${datos.largoBase} + ${datos.dc}`, fmt(fase.Lrec, 1), "mm")}
        ${fRow("nPasadasProf", `⌈prof/ap⌉`, `⌈${fmt(datos.profFase)} / ${datos.ap}⌉`, fase.nPasadasProf)}
        ${fRow("nPasadasAncho", `⌈ancho/ae⌉`, `⌈${fmt(datos.ancho)} / ${fmt(fase.aeFase)}⌉`, fase.nPasadasAncho)}
        ${fRowMulti("t", `${frac("L<sub>rec</sub> · nPasadasProf · nPasadasAncho", "Vf")}`, `${frac(fmt(fase.Lrec, 1) + " · " + fase.nPasadasProf + " · " + fase.nPasadasAncho, fmt(fase.vf, 0))}`, fmt(fase.t, 3) + " min")}
        ${fRowMulti("Pc bruta", `${frac("ae · ap · Vf · kc", "60·10⁶")}`, `${frac(fmt(fase.aeFase) + " · " + datos.ap + " · " + fmt(fase.vf, 0) + " · " + datos.kc, "60·10⁶")}`, fmt(fase.pcBruta) + " kW")}
        ${fRowMulti("Pc real", `${frac("Pc bruta", "η")}`, `${frac(fmt(fase.pcBruta), datos.eta)}`, fmt(fase.pc) + " kW")}
    </div>`;
}

function htmlFormulaFaseAbocardado(fase, tipo, datos) {
    if (!fase) return `<div class="text-[10px] text-slate-500 italic px-2 py-1">Fase no activa</div>`;
    const colorCls = tipo === "desbaste" ? "red" : "purple";
    const label = tipo === "desbaste" ? "🔧 DESBASTE" : "✨ TERMINACIÓN";
    const calidadTxt = datos.calidad ? ` · Calidad: ${datos.calidad}` : "";
    return `
    <div class="formula-box ${colorCls}">
        <div class="formula-section-title ${colorCls}">${label} · Dc=${datos.dc}mm · zn=${datos.zn} · Vc=${datos.vc} m/min${calidadTxt}</div>
        ${htmlFilaRpm(datos.vc, datos.dc, fase.n_teorica, fase.n)}
        ${fRow("Vf", `n · fz · zn`, `${fmt(fase.n, 0)} · ${datos.fz} · ${datos.zn}`, fmt(fase.vf, 0), "mm/min")}
        ${fRow("Anillo", `dAboc − dBroca`, `${datos.dAboc} − ${datos.dBroca}`, fmt(fase.radialCoverage), "mm")}
        ${fRow("Paso radial", `Dc − dBroca`, `${datos.dc} − ${datos.dBroca}`, fmt(fase.radialStep), "mm")}
        ${fRow("nPasadasRad", `⌈Anillo / Paso⌉`, `⌈${fmt(fase.radialCoverage)} / ${fmt(fase.radialStep)}⌉`, fase.nRadialPasses)}
        ${fRow("Prof. total", `(prof · N)`, `(${datos.profFase} · ${datos.N})`, fmt(datos.profFase * datos.N, 2), "mm")}
        ${fRowMulti("t", `${frac("nPasadasRad · Prof. total", "Vf")}`, `${frac(fase.nRadialPasses + " · " + fmt(datos.profFase * datos.N, 2), fmt(fase.vf, 0))}`, fmt(fase.t, 3) + " min")}
        ${fRowMulti("Pc bruta", `${frac("Anillo_h · ap · Vf · kc", "60·10⁶")}`, `${frac(fmt(fase.pcRingWidth) + " · " + datos.profFase + " · " + fmt(fase.vf, 0) + " · " + datos.kc, "60·10⁶")}`, fmt(fase.pcBruta) + " kW")}
        ${fRowMulti("Pc real", `${frac("Pc bruta", "η")}`, `${frac(fmt(fase.pcBruta), datos.eta)}`, fmt(fase.pc) + " kW")}
    </div>`;
}

function htmlMechaBlock(fase, tipo, num, total, vc, kc, eta, codigoDormer = "", letraDormer = "") {
    const cls = tipo === "previa" ? "previa" : "final";
    const tag = tipo === "previa" ? `MECHA PREVIA ${num}/${total - 1}` : `MECHA FINAL`;
    const infoCat = codigoDormer ? ` · ${codigoDormer}${letraDormer && letraDormer !== "-" ? ` (${vc}${letraDormer})` : ""}` : "";
    const adaptada = Math.abs(fase.n - fase.n_teorica) > 0.5;
    const vcParaPc = adaptada ? fmt(fase.vcReal, 2) : vc;
    return `
    <div class="mecha-block ${cls}">
        <div class="mecha-header text-slate-800">${tipo === "previa" ? "🟡" : "🟢"} ${tag} · Ø${fase.diam} mm${infoCat} · Vc=${vc} m/min · fn=${fase.fn} mm/rev</div>
        ${htmlFilaRpm(vc, fase.diam, fase.n_teorica, fase.n)}
        ${adaptada ? fRow("Vc real", `${frac("π · D · n", "1000")}`, `${frac("π · " + fase.diam + " · " + fmt(fase.n, 0), "1000")}`, fmt(fase.vcReal, 2), "m/min") : ""}
        ${fRow("Vf", `n · fn`, `${fmt(fase.n, 0)} · ${fase.fn}`, fmt(fase.vf, 0), "mm/min")}
        ${fRow("Prof. mec.", `L + 5`, `—`, fmt(fase.totalDepth, 2), "mm")}
        ${fRowMulti("t", `${frac("Prof. mec.", "Vf")}`, `${frac(fmt(fase.totalDepth, 2), fmt(fase.vf, 0))}`, fmt(fase.t, 3) + " min")}
        ${fRowMulti("Pc bruta", `${frac("D · fn · Vc · kc", "240·10³")}`, `${frac(fase.diam + " · " + fase.fn + " · " + vcParaPc + " · " + kc, "240·10³")}`, fmt(fase.pcBruta) + " kW")}
        ${fRowMulti("Pc real", `${frac("Pc bruta", "η")}`, `${frac(fmt(fase.pcBruta), eta)}`, fmt(fase.pc) + " kW")}
    </div>`;
}

// ============================================================
// CÁLCULO GLOBAL / REPORTE
// ============================================================
function ejecutarCalculoCompleto() {
    const safeVal = (id, def = "") => {
        const el = document.getElementById(id);
        return el ? el.value : def;
    };
    const safeChk = (id, def = false) => {
        const el = document.getElementById(id);
        return el ? el.checked : def;
    };
    const safeNum = (id, def = 0) => {
        const val = parseFloat(safeVal(id));
        return isNaN(val) ? def : val;
    };
    const parseNumOrNull = (id) => {
        const val = safeVal(id);
        if (val === "" || val === null) return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    };

    alCambiarMaterial();
    const matDesb = getMaterialActual();
    const usaTemple = safeChk("chkTemple");
    const matTerm = usaTemple ? DB_MATERIALES[safeVal("matTempleSelect", "02.2")] : matDesb;
    const potMotor = safeNum("potInput", 10);
    const usaEta = safeChk("chkEta", true);
    const eta = usaEta ? safeNum("etaInput", 0.9) : 1.0;
    const usaMaxRpm = safeChk("chkMaxRpm");
    const maxRpm = safeNum("maxRpmInput", 4000);
    const escalonesCaja = getListaCajaRpm();
    const dims = getDims();
    const { Lb, Wb, Hb, Lf, Wf, Hf } = dims;
    const grilla = construirGrilla3D(Lf, Wf, Hf);

    let reporteOpsHTML = "",
        tTotal = 0,
        pMaxConsumida = 0,
        reporteTerminacion = "";
    let maxPcData = null;

    // ---------- PLANEADO ----------
    const plDcDesbaste = safeNum("plDcDesbaste", 80);
    const plZnDesbaste = safeNum("plZnDesbaste", 6);
    const plDcTerminacion = safeNum("plDcTerminacion", 80);
    const plZnTerminacion = safeNum("plZnTerminacion", 6);
    const plEmpaneDesbaste = safeVal("plEmpaneDesbaste", "mucho");
    const plEmpaneTerminacion = safeVal("plEmpaneTerminacion", "poco");
    const plFzDesbaste = safeNum("plFzDesbaste", 0.12);
    const plApDesbaste = safeNum("plApDesbaste", 2.5);
    const plSobreMaterial = safeNum("plSobreMaterial", 0.5);
    const plTerminacionActiva = safeChk("plTerminacionActiva", true);
    const plFzTerminacion = safeNum("plFzTerminacion", 0.08);
    const plApTerminacion = safeNum("plApTerminacion", 0.5);
    const plVcTerminacionOverride = parseNumOrNull("plVcTerminacion");
    const plVcDesbasteOverride = parseNumOrNull("plVcDesbaste");
    const plAeTerminacionOverride = parseNumOrNull("plAeTerminacionOverride");
    const plCalidadDesbaste = safeVal("plCalidadDesbaste");
    const plCalidadTerminacion = safeVal("plCalidadTerminacion");

    const plEsInsertoDesbaste = safeChk("plEsInsertoDesbaste", true);
    const plCodHDesbaste = safeVal("plCodigoHerramientaDesbaste");
    const plCodIDesbaste = plEsInsertoDesbaste ? safeVal("plCodigoInsertoDesbaste") : "";
    const plEsInsertoTerminacion = safeChk("plEsInsertoTerminacion", true);
    const plCodHTerminacion = safeVal("plCodigoHerramientaTerminacion");
    const plCodITerminacion = plEsInsertoTerminacion ? safeVal("plCodigoInsertoTerminacion") : "";

    const aeFactorD_pl = plEmpaneDesbaste === "mucho" ? 2 / 3 : 0.1;
    const aeFactorT_pl = plEmpaneTerminacion === "mucho" ? 2 / 3 : 0.1;
    const aeDesbastePl = aeFactorD_pl * plDcDesbaste;
    const vcDesbastePl = plVcDesbasteOverride || vcSegunEmpane(matDesb, plEmpaneDesbaste);
    const vcTerminacionPl = plVcTerminacionOverride || vcSegunEmpane(matTerm, plEmpaneTerminacion);
    const aeTerminacionPl = plAeTerminacionOverride || aeFactorT_pl * plDcTerminacion;

    const carasCheck = [
        { id: "pl_sup", ancho: Wb, L: Lb, esp: 0, nombre: "Cara Superior" },
        { id: "pl_inf", ancho: Wb, L: Lb, esp: 0, nombre: "Cara Inferior" },
        { id: "pl_lat_izq", ancho: Hb, L: Lb, esp: 0, nombre: "Lat. Izq" },
        { id: "pl_lat_der", ancho: Hb, L: Lb, esp: 0, nombre: "Lat. Der" },
        { id: "pl_frente", ancho: Hb, L: Wb, esp: 0, nombre: "Frente" },
        { id: "pl_atras", ancho: Hb, L: Wb, esp: 0, nombre: "Atrás" },
    ];
    const nCarasH = (safeChk("pl_sup") ? 1 : 0) + (safeChk("pl_inf") ? 1 : 0);
    const nCarasW = (safeChk("pl_lat_izq") ? 1 : 0) + (safeChk("pl_lat_der") ? 1 : 0);
    const nCarasL = (safeChk("pl_frente") ? 1 : 0) + (safeChk("pl_atras") ? 1 : 0);
    const espPorCaraH = nCarasH > 0 ? Math.max(0, Hb - Hf) / nCarasH : 0;
    const espPorCaraW = nCarasW > 0 ? Math.max(0, Wb - Wf) / nCarasW : 0;
    const espPorCaraL = nCarasL > 0 ? Math.max(0, Lb - Lf) / nCarasL : 0;
    carasCheck[0].esp = espPorCaraH;
    carasCheck[1].esp = espPorCaraH;
    carasCheck[2].esp = espPorCaraW;
    carasCheck[3].esp = espPorCaraW;
    carasCheck[4].esp = espPorCaraL;
    carasCheck[5].esp = espPorCaraL;

    const carasActivas = carasCheck.filter((c) => safeChk(c.id));
    let detallePlaneado = "",
        tPlaneadoTotal = 0;

    carasActivas.forEach((cara) => {
        const profDesbaste = Math.max(0, cara.esp - plSobreMaterial);
        const faseD = calcularFaseCorte(
            profDesbaste,
            cara.ancho,
            aeDesbastePl,
            vcDesbastePl,
            plFzDesbaste,
            plApDesbaste,
            plDcDesbaste,
            plZnDesbaste,
            cara.L,
            matDesb.kc,
            usaMaxRpm,
            maxRpm,
            eta,
        );
        const faseT =
            plTerminacionActiva && plSobreMaterial > 0.001
                ? calcularFaseCorte(
                      plSobreMaterial,
                      cara.ancho,
                      aeTerminacionPl,
                      vcTerminacionPl,
                      plFzTerminacion,
                      plApTerminacion,
                      plDcTerminacion,
                      plZnTerminacion,
                      cara.L,
                      matTerm.kc,
                      usaMaxRpm,
                      maxRpm,
                      eta,
                  )
                : null;

        if (faseD) {
            tPlaneadoTotal += faseD.t;
            if (faseD.pc > pMaxConsumida) {
                pMaxConsumida = faseD.pc;
                maxPcData = { ...faseD.pcFormulaData, pcBruta: faseD.pcBruta, tipo: "fresa" };
            }
        }
        if (faseT) {
            tPlaneadoTotal += faseT.t;
            if (faseT.pc > pMaxConsumida) {
                pMaxConsumida = faseT.pc;
                maxPcData = { ...faseT.pcFormulaData, pcBruta: faseT.pcBruta, tipo: "fresa" };
            }
        }

        detallePlaneado += `<div class="text-[11px] mono border border-slate-200 rounded p-2 mb-2 bg-white">
            <div class="flex justify-between font-bold text-slate-800 text-xs mb-1"><span>• ${cara.nombre}</span><span>${((faseD?.t || 0) + (faseT?.t || 0)).toFixed(3)} min</span></div>
            <div class="text-slate-600 text-[10px] mb-1">espesor=${cara.esp.toFixed(2)}mm · L=${cara.L}mm · ancho=${cara.ancho}mm</div>
            ${faseD ? htmlFormulaFaseCorte(faseD, "desbaste", { dc: plDcDesbaste, zn: plZnDesbaste, vc: vcDesbastePl, empane: plEmpaneDesbaste, fz: plFzDesbaste, ap: plApDesbaste, kc: matDesb.kc, eta, profFase: profDesbaste, ancho: cara.ancho, largoBase: cara.L, calidad: plCalidadDesbaste }) : ""}
            ${faseT ? htmlFormulaFaseCorte(faseT, "terminación", { dc: plDcTerminacion, zn: plZnTerminacion, vc: vcTerminacionPl, empane: plEmpaneTerminacion, fz: plFzTerminacion, ap: plApTerminacion, kc: matTerm.kc, eta, profFase: plSobreMaterial, ancho: cara.ancho, largoBase: cara.L, calidad: plCalidadTerminacion }) : ""}
        </div>`;
    });

    if (tPlaneadoTotal > 0) {
        tTotal += tPlaneadoTotal;
        const partsToolD = [
            plCodHDesbaste ? `Herr: <b>${plCodHDesbaste}</b>` : "",
            plEsInsertoDesbaste && plCodIDesbaste ? `Inserto: <b>${plCodIDesbaste}</b>` : "",
        ]
            .filter(Boolean)
            .join(" · ");
        const partsToolT = [
            plCodHTerminacion ? `Herr: <b>${plCodHTerminacion}</b>` : "",
            plEsInsertoTerminacion && plCodITerminacion ? `Inserto: <b>${plCodITerminacion}</b>` : "",
        ]
            .filter(Boolean)
            .join(" · ");
        reporteOpsHTML += `<div class="border border-slate-300 rounded-lg p-3 bg-slate-50 mb-3 avoid-break">
            <div class="font-bold text-xs text-blue-900 border-b pb-1 mb-2 flex justify-between"><span>PLANEADO — ${carasActivas.length} caras</span><span class="mono text-slate-700">DcD=${plDcDesbaste}/DcT=${plDcTerminacion}</span></div>
            ${partsToolD ? `<div class="text-[10px] mono text-red-700 mb-1">🔧 Desbaste → ${partsToolD}</div>` : ""}
            ${partsToolT ? `<div class="text-[10px] mono text-purple-700 mb-2">✨ Terminación → ${partsToolT}</div>` : ""}
            ${detallePlaneado}
            <div class="mt-2 pt-2 border-t border-slate-200 font-bold text-emerald-800 text-xs">Total Planeado = ${tPlaneadoTotal.toFixed(3)} min</div>
        </div>`;
    }

    // ---------- ESCALONES ----------
    escalones.forEach((e, i) => {
        const info = INFO_UBICACION_ESCALON[e.ubicacion] || INFO_UBICACION_ESCALON.sup_izq;
        const largoReal = e.pasante ? (info.ejeLargo === "L" ? Lf : Wf) : e.largo;
        const aeDesbaste = (e.empaneDesbaste === "mucho" ? 2 / 3 : 0.1) * e.dcDesbaste;
        const aeTerminacion = e.aeTerminacionOverride || (e.empaneTerminacion === "mucho" ? 2 / 3 : 0.1) * e.dcTerminacion;
        const vcDesbaste =
            e.vcDesbasteOverride ||
            getVcPorCatalogo(matDesb, e.catalogoDesbaste, e.codigoHerramientaDesbaste, e.empaneDesbaste, e.dcDesbaste);
        const vcTerminacion =
            e.vcTerminacionOverride ||
            getVcPorCatalogo(
                matTerm,
                e.catalogoTerminacion,
                e.codigoHerramientaTerminacion,
                e.empaneTerminacion,
                e.dcTerminacion,
            );
        const profDesbaste = Math.max(0, e.prof - e.sobreMaterial);

        const faseD = calcularFaseCorte(
            profDesbaste,
            e.ancho,
            aeDesbaste,
            vcDesbaste,
            e.fzDesbaste,
            e.apDesbaste,
            e.dcDesbaste,
            e.znDesbaste,
            largoReal,
            matDesb.kc,
            usaMaxRpm,
            maxRpm,
            eta,
        );
        const faseT =
            e.terminacionActiva && e.sobreMaterial > 0.001
                ? calcularFaseCorte(
                      e.sobreMaterial,
                      e.ancho,
                      aeTerminacion,
                      vcTerminacion,
                      e.fzTerminacion,
                      e.apTerminacion,
                      e.dcTerminacion,
                      e.znTerminacion,
                      largoReal,
                      matTerm.kc,
                      usaMaxRpm,
                      maxRpm,
                      eta,
                  )
                : null;

        const tOp = (faseD?.t || 0) + (faseT?.t || 0);
        if (faseD && faseD.pc > pMaxConsumida) {
            pMaxConsumida = faseD.pc;
            maxPcData = { ...faseD.pcFormulaData, pcBruta: faseD.pcBruta, tipo: "fresa" };
        }
        if (faseT && faseT.pc > pMaxConsumida) {
            pMaxConsumida = faseT.pc;
            maxPcData = { ...faseT.pcFormulaData, pcBruta: faseT.pcBruta, tipo: "fresa" };
        }
        tTotal += tOp;

        const catTagD = (e.catalogoDesbaste || "sandvik").toUpperCase();
        const catTagT = (e.catalogoTerminacion || "sandvik").toUpperCase();
        const toolD = [e.codigoHerramientaDesbaste, e.esInsertoDesbaste && e.codigoInsertoDesbaste].filter(Boolean).join(" / ");
        const toolT = [e.codigoHerramientaTerminacion, e.esInsertoTerminacion && e.codigoInsertoTerminacion]
            .filter(Boolean)
            .join(" / ");

        reporteOpsHTML += `<div class="border border-slate-300 rounded-lg p-3 bg-slate-50 mb-3 avoid-break">
            <div class="font-bold text-xs text-red-900 border-b pb-1 mb-2 flex justify-between"><span>ESCALÓN #${i + 1} (${info.label})</span><span class="mono">${e.ancho}×${e.prof}×${largoReal} mm</span></div>
            ${toolD ? `<div class="text-[10px] mono text-red-700 mb-1">🔧 Herramienta desbaste (${catTagD}): ${toolD}</div>` : ""}
            ${toolT ? `<div class="text-[10px] mono text-purple-700 mb-1">✨ Herramienta terminación (${catTagT}): ${toolT}</div>` : ""}
            ${htmlFormulaFaseCorte(faseD, "desbaste", { dc: e.dcDesbaste, zn: e.znDesbaste, vc: vcDesbaste, empane: e.empaneDesbaste, fz: e.fzDesbaste, ap: e.apDesbaste, kc: matDesb.kc, eta, profFase: profDesbaste, ancho: e.ancho, largoBase: largoReal, calidad: e.calidadInsertoDesbaste })}
            ${e.terminacionActiva ? htmlFormulaFaseCorte(faseT, "terminación", { dc: e.dcTerminacion, zn: e.znTerminacion, vc: vcTerminacion, empane: e.empaneTerminacion, fz: e.fzTerminacion, ap: e.apTerminacion, kc: matTerm.kc, eta, profFase: e.sobreMaterial, ancho: e.ancho, largoBase: largoReal, calidad: e.calidadInsertoTerminacion }) : ""}
            <div class="mt-2 pt-2 border-t border-slate-200 font-bold text-red-800 text-xs">Total Escalón = ${tOp.toFixed(3)} min</div>
        </div>`;
    });

    // ---------- RANURAS ----------
    ranuras.forEach((r, i) => {
        const info = INFO_CARA_RANURA[r.cara] || INFO_CARA_RANURA.sup_long;
        const largoReal = info.ejeLargo === "L" ? Lf : Wf;
        const aeDesbaste = (r.empaneDesbaste === "mucho" ? 2 / 3 : 0.1) * r.dcDesbaste;
        const aeTerminacion = r.aeTerminacionOverride || (r.empaneTerminacion === "mucho" ? 2 / 3 : 0.1) * r.dcTerminacion;
        const vcDesbaste =
            r.vcDesbasteOverride ||
            getVcPorCatalogo(matDesb, r.catalogoDesbaste, r.codigoHerramientaDesbaste, r.empaneDesbaste, r.dcDesbaste);
        const vcTerminacion =
            r.vcTerminacionOverride ||
            getVcPorCatalogo(
                matTerm,
                r.catalogoTerminacion,
                r.codigoHerramientaTerminacion,
                r.empaneTerminacion,
                r.dcTerminacion,
            );
        const profDesbaste = Math.max(0, r.prof - r.sobreMaterial);

        const faseD = calcularFaseCorte(
            profDesbaste,
            r.ancho,
            aeDesbaste,
            vcDesbaste,
            r.fzDesbaste,
            r.apDesbaste,
            r.dcDesbaste,
            r.znDesbaste,
            largoReal,
            matDesb.kc,
            usaMaxRpm,
            maxRpm,
            eta,
        );
        const faseT =
            r.terminacionActiva && r.sobreMaterial > 0.001
                ? calcularFaseCorte(
                      r.sobreMaterial,
                      r.ancho,
                      aeTerminacion,
                      vcTerminacion,
                      r.fzTerminacion,
                      r.apTerminacion,
                      r.dcTerminacion,
                      r.znTerminacion,
                      largoReal,
                      matTerm.kc,
                      usaMaxRpm,
                      maxRpm,
                      eta,
                  )
                : null;

        const tOp = (faseD?.t || 0) + (faseT?.t || 0);
        if (faseD && faseD.pc > pMaxConsumida) {
            pMaxConsumida = faseD.pc;
            maxPcData = { ...faseD.pcFormulaData, pcBruta: faseD.pcBruta, tipo: "fresa" };
        }
        if (faseT && faseT.pc > pMaxConsumida) {
            pMaxConsumida = faseT.pc;
            maxPcData = { ...faseT.pcFormulaData, pcBruta: faseT.pcBruta, tipo: "fresa" };
        }
        tTotal += tOp;

        const catTagD = (r.catalogoDesbaste || "sandvik").toUpperCase();
        const catTagT = (r.catalogoTerminacion || "sandvik").toUpperCase();
        const toolD = [r.codigoHerramientaDesbaste, r.esInsertoDesbaste && r.codigoInsertoDesbaste].filter(Boolean).join(" / ");
        const toolT = [r.codigoHerramientaTerminacion, r.esInsertoTerminacion && r.codigoInsertoTerminacion]
            .filter(Boolean)
            .join(" / ");

        reporteOpsHTML += `<div class="border border-slate-300 rounded-lg p-3 bg-slate-50 mb-3 avoid-break">
            <div class="font-bold text-xs text-amber-900 border-b pb-1 mb-2 flex justify-between"><span>RANURA #${i + 1} (${info.label})</span><span class="mono">${r.ancho}×${r.prof}×${largoReal} mm</span></div>
            ${toolD ? `<div class="text-[10px] mono text-red-700 mb-1">🔧 Herramienta desbaste (${catTagD}): ${toolD}</div>` : ""}
            ${toolT ? `<div class="text-[10px] mono text-purple-700 mb-1">✨ Herramienta terminación (${catTagT}): ${toolT}</div>` : ""}
            ${htmlFormulaFaseCorte(faseD, "desbaste", { dc: r.dcDesbaste, zn: r.znDesbaste, vc: vcDesbaste, empane: r.empaneDesbaste, fz: r.fzDesbaste, ap: r.apDesbaste, kc: matDesb.kc, eta, profFase: profDesbaste, ancho: r.ancho, largoBase: largoReal, calidad: r.calidadInsertoDesbaste })}
            ${r.terminacionActiva ? htmlFormulaFaseCorte(faseT, "terminación", { dc: r.dcTerminacion, zn: r.znTerminacion, vc: vcTerminacion, empane: r.empaneTerminacion, fz: r.fzTerminacion, ap: r.apTerminacion, kc: matTerm.kc, eta, profFase: r.sobreMaterial, ancho: r.ancho, largoBase: largoReal, calidad: r.calidadInsertoTerminacion }) : ""}
            <div class="mt-2 pt-2 border-t border-slate-200 font-bold text-amber-800 text-xs">Total Ranura = ${tOp.toFixed(3)} min</div>
        </div>`;
    });

    // ---------- PERFORADOS ----------
    perforados.forEach((p, i) => {
        const result = getOperationPositions(p, grilla, dims);
        if (result.error || !result.positions || result.positions.length === 0) {
            reporteOpsHTML += `<div class="border border-red-300 rounded-lg p-3 bg-red-50 mb-3 avoid-break"><div class="font-bold text-xs text-red-900">Perforación #${i + 1} — ERROR</div><div class="text-xs text-red-700 mt-1">${result.error || "Sin posiciones"}</div></div>`;
            return;
        }
        const N = result.positions.length;
        let profTotal = 0;
        result.positions.forEach((pos) => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (p.tipo === "pasante") profTotal += Math.max(0, c.zTop - c.zBot);
            else profTotal += p.prof;
        });
        const pretaladradoActivo = p.pretaladradoActivo !== false;
        const secuencia = pretaladradoActivo ? calcularSecuenciaMechas(p.diam) : [{ d: p.diam, tipo: "final" }];
        const catPerf = p.catalogo || "dormer";
        const codMecha = p.codigoHerramienta || "A100";

        let tOp = 0;
        const mechasHTML = [];
        secuencia.forEach((m, idx) => {
            const profMec = profTotal + N * (m.d / 2) * 0.3;
            let vcMecha = matDesb.vc_poco,
                fnMecha = 0.1,
                letraCat = "";
            if (catPerf === "dormer") {
                const dp = getDormerParams(matDesb, codMecha, m.d);
                vcMecha = dp.vc;
                fnMecha = dp.fn;
                letraCat = dp.letra;
            }
            const faseM = calcularFaseMecha(m.d, vcMecha, fnMecha, profMec, N, usaMaxRpm, maxRpm, matDesb.kc, eta);
            tOp += faseM.t;

            if (faseM.pc > pMaxConsumida) {
                pMaxConsumida = faseM.pc;
                maxPcData = { ...faseM.pcFormulaData, pcBruta: faseM.pcBruta, tipo: "mecha" };
            }

            mechasHTML.push(
                htmlMechaBlock(
                    faseM,
                    m.tipo,
                    idx + 1,
                    secuencia.length,
                    vcMecha,
                    matDesb.kc,
                    eta,
                    catPerf === "dormer" ? codMecha : "",
                    letraCat,
                ),
            );
        });
        tTotal += tOp;
        const modoPasoInfo = p.tipo === "pasante" ? (result.modoCruce !== "ninguno" ? " | Alineado" : " | Cara a cara") : "";
        const seqTxt = secuencia.map((m) => `Ø${m.d}`).join(" → ");
        reporteOpsHTML += `<div class="border border-slate-300 rounded-lg p-3 bg-slate-50 mb-3 avoid-break">
            <div class="font-bold text-xs text-teal-900 border-b pb-1 mb-2 flex justify-between"><span>PERFORACIÓN #${i + 1} (${N} × Ø${p.diam} ${p.tipo}${modoPasoInfo}${p.concentricoId ? " — Conc." : ""})</span><span class="mono">${profTotal.toFixed(1)} mm tot.</span></div>
            <div class="text-[10px] mono text-teal-800 mb-2">Herramienta: <b>${catPerf.toUpperCase()} ${catPerf === "dormer" ? codMecha : ""}</b> · Secuencia: <b>${seqTxt}</b></div>
            ${mechasHTML.join("")}
            <div class="mt-2 pt-2 border-t border-slate-200 font-bold text-teal-800 text-xs">Total Perforación = ${tOp.toFixed(3)} min</div>
        </div>`;
    });

    // ---------- ABOCARDADOS ----------
    abocardados.forEach((a, i) => {
        const result = getOperationPositions(a, grilla, dims);
        if (result.error || !result.positions || result.positions.length === 0) {
            reporteOpsHTML += `<div class="border border-red-300 rounded-lg p-3 bg-red-50 mb-3 avoid-break"><div class="font-bold text-xs text-red-900">Abocardado #${i + 1} — ERROR</div><div class="text-xs text-red-700 mt-1">${result.error || "Sin posiciones"}</div></div>`;
            return;
        }
        const N = result.positions.length;
        const profDesbaste = Math.max(0, a.prof - a.sobreMaterial);
        const vcDesbaste =
            a.vcDesbasteOverride ||
            getVcPorCatalogo(matDesb, a.catalogoDesbaste, a.codigoHerramientaDesbaste, a.empaneDesbaste, a.dcDesbaste);
        const vcTerminacion =
            a.vcTerminacionOverride ||
            getVcPorCatalogo(
                matTerm,
                a.catalogoTerminacion,
                a.codigoHerramientaTerminacion,
                a.empaneTerminacion,
                a.dcTerminacion,
            );

        const faseD = calcularFaseAbocardado(
            profDesbaste,
            vcDesbaste,
            a.fzDesbaste,
            a.apDesbaste,
            a.dcDesbaste,
            a.znDesbaste,
            N,
            a.dBroca,
            a.dAboc,
            matDesb.kc,
            usaMaxRpm,
            maxRpm,
            eta,
        );
        const faseT =
            a.terminacionActiva && a.sobreMaterial > 0.001
                ? calcularFaseAbocardado(
                      a.sobreMaterial,
                      vcTerminacion,
                      a.fzTerminacion,
                      a.apTerminacion,
                      a.dcTerminacion,
                      a.znTerminacion,
                      N,
                      a.dBroca,
                      a.dAboc,
                      matTerm.kc,
                      usaMaxRpm,
                      maxRpm,
                      eta,
                  )
                : null;

        const tOp = (faseD?.t || 0) + (faseT?.t || 0);
        if (faseD && faseD.pc > pMaxConsumida) {
            pMaxConsumida = faseD.pc;
            maxPcData = { ...faseD.pcFormulaData, pcBruta: faseD.pcBruta, tipo: "fresa" };
        }
        if (faseT && faseT.pc > pMaxConsumida) {
            pMaxConsumida = faseT.pc;
            maxPcData = { ...faseT.pcFormulaData, pcBruta: faseT.pcBruta, tipo: "fresa" };
        }
        tTotal += tOp;

        const catTagD = (a.catalogoDesbaste || "sandvik").toUpperCase();
        const catTagT = (a.catalogoTerminacion || "sandvik").toUpperCase();
        const toolD = [a.codigoHerramientaDesbaste, a.esInsertoDesbaste && a.codigoInsertoDesbaste].filter(Boolean).join(" / ");
        const toolT = [a.codigoHerramientaTerminacion, a.esInsertoTerminacion && a.codigoInsertoTerminacion]
            .filter(Boolean)
            .join(" / ");

        reporteOpsHTML += `<div class="border border-slate-300 rounded-lg p-3 bg-slate-50 mb-3 avoid-break">
            <div class="font-bold text-xs text-purple-900 border-b pb-1 mb-2 flex justify-between"><span>ABOCARDADO #${i + 1} (${N} × Ø${a.dAboc} sobre Ø${a.dBroca}${a.concentricoId ? " — Conc." : ""})</span><span class="mono">${a.prof} mm</span></div>
            ${toolD ? `<div class="text-[10px] mono text-red-700 mb-1">🔧 Herramienta desbaste (${catTagD}): ${toolD}</div>` : ""}
            ${toolT ? `<div class="text-[10px] mono text-purple-700 mb-1">✨ Herramienta terminación (${catTagT}): ${toolT}</div>` : ""}
            ${htmlFormulaFaseAbocardado(faseD, "desbaste", { dc: a.dcDesbaste, zn: a.znDesbaste, vc: vcDesbaste, empane: a.empaneDesbaste, fz: a.fzDesbaste, ap: a.apDesbaste, kc: matDesb.kc, eta, profFase: profDesbaste, dBroca: a.dBroca, dAboc: a.dAboc, N, calidad: a.calidadInsertoDesbaste })}
            ${a.terminacionActiva ? htmlFormulaFaseAbocardado(faseT, "terminación", { dc: a.dcTerminacion, zn: a.znTerminacion, vc: vcTerminacion, empane: a.empaneTerminacion, fz: a.fzTerminacion, ap: a.apTerminacion, kc: matTerm.kc, eta, profFase: a.sobreMaterial, dBroca: a.dBroca, dAboc: a.dAboc, N, calidad: a.calidadInsertoTerminacion }) : ""}
            <div class="mt-2 pt-2 border-t border-slate-200 font-bold text-purple-800 text-xs">Total Abocardado = ${tOp.toFixed(3)} min</div>
        </div>`;
    });

    // ---------- TERMINACIÓN TEMPLE ----------
    if (usaTemple) {
        const znPl2 = 6;
        const vcTerm2 = matTerm.vc_poco;
        const n_teorica = (vcTerm2 * 1000) / (Math.PI * plDcTerminacion);
        const n2 = obtenerRpmMaquina(n_teorica, usaMaxRpm, maxRpm);
        const vf2 = n2 * 0.08 * znPl2;
        const aeTerm2 = 1.0,
            apTerm2 = 0.5;
        const tT = (Lf + Wf) / vf2;
        const pcBrutaT = (aeTerm2 * apTerm2 * vf2 * matTerm.kc) / 60e6;
        const pcT = pcBrutaT / eta;
        if (pcT > pMaxConsumida) {
            pMaxConsumida = pcT;
            maxPcData = { ae: aeTerm2, ap: apTerm2, vf: vf2, kc: matTerm.kc, pcBruta: pcBrutaT, tipo: "fresa" };
        }
        tTotal += tT;
        reporteTerminacion = `<div class="border border-amber-300 rounded-lg p-3 bg-amber-50 mb-3 avoid-break">
            <div class="font-bold text-xs text-amber-900 border-b border-amber-200 pb-1 mb-2">ACABADO FINAL (Templado)</div>
            <div class="formula-box">
                ${htmlFilaRpm(vcTerm2, plDcTerminacion, n_teorica, n2)}
                ${fRow("Vf", `n · fz · zn`, `${fmt(n2, 0)} · 0.08 · ${znPl2}`, fmt(vf2, 0), "mm/min")}
                ${fRowMulti("t", `${frac("L + W", "Vf")}`, `${frac(Lf + " + " + Wf, fmt(vf2, 0))}`, fmt(tT, 3) + " min")}
                ${fRowMulti("Pc bruta", `${frac("ae · ap · Vf · kc", "60·10⁶")}`, `${frac(aeTerm2 + " · " + apTerm2 + " · " + fmt(vf2, 0) + " · " + matTerm.kc, "60·10⁶")}`, fmt(pcBrutaT) + " kW")}
                ${fRowMulti("Pc real", `${frac("Pc bruta", "η")}`, `${frac(fmt(pcBrutaT), eta)}`, fmt(pcT) + " kW")}
            </div>
        </div>`;
    }

    const verificaPotencia = pMaxConsumida <= potMotor;
    calculosValidos = true;

    let htmlVerificacionPotencia = "";
    if (maxPcData) {
        if (maxPcData.tipo === "fresa") {
            htmlVerificacionPotencia = `
                <div class="text-[11px] font-bold mb-1 text-slate-800">Cálculo de la potencia máxima:</div>
                <div class="mono text-[10px] mb-2 leading-tight bg-white p-2 rounded border border-slate-200">
                    Kc = ${maxPcData.kc} N/mm²,<br>
                    ae = ${fmt(maxPcData.ae)} mm;<br>
                    ap = ${fmt(maxPcData.ap)} mm,<br>
                    Vf = ${fmt(maxPcData.vf, 0)} mm/min
                </div>
                ${fRowMulti("Pc bruta", `${frac("ae · ap · Vf · kc", "60 · 10⁶")}`, `${frac(fmt(maxPcData.ae) + " · " + fmt(maxPcData.ap) + " · " + fmt(maxPcData.vf, 0) + " · " + maxPcData.kc, "60 · 10⁶")}`, fmt(maxPcData.pcBruta) + " kW")}
                <div class="text-[10px] mt-2 mb-1 text-slate-700">Afectamos esta potencia máxima consumida por el rendimiento de la máquina de ${(eta * 100).toFixed(0)} %</div>
                ${fRowMulti("Pc real", `${frac("Pc bruta", "η")}`, `${frac(fmt(maxPcData.pcBruta) + " kW", eta)}`, fmt(pMaxConsumida) + " kW")}
            `;
        } else {
            htmlVerificacionPotencia = `
                <div class="text-[11px] font-bold mb-1 text-slate-800">Cálculo de la potencia máxima (Taladrado):</div>
                <div class="mono text-[10px] mb-2 leading-tight bg-white p-2 rounded border border-slate-200">
                    Kc = ${maxPcData.kc} N/mm²,<br>
                    D = ${maxPcData.d} mm,<br>
                    fn = ${maxPcData.fn} mm/rev,<br>
                    Vc = ${maxPcData.vc} m/min
                </div>
                ${fRowMulti("Pc bruta", `${frac("D · fn · Vc · kc", "240 · 10³")}`, `${frac(maxPcData.d + " · " + maxPcData.fn + " · " + maxPcData.vc + " · " + maxPcData.kc, "240 · 10³")}`, fmt(maxPcData.pcBruta) + " kW")}
                <div class="text-[10px] mt-2 mb-1 text-slate-700">Afectamos esta potencia máxima consumida por el rendimiento de la máquina de ${(eta * 100).toFixed(0)} %</div>
                ${fRowMulti("Pc real", `${frac("Pc bruta", "η")}`, `${frac(fmt(maxPcData.pcBruta) + " kW", eta)}`, fmt(pMaxConsumida) + " kW")}
            `;
        }
    }

    document.getElementById("reporteAcademico").innerHTML = `
        <div class="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
            <div><div class="text-[11px] font-bold text-slate-500">UNIVERSIDAD NACIONAL DE CUYO • ITU</div><h2 class="text-lg font-extrabold text-slate-900">INFORME TÉCNICO DE FRESADO</h2></div>
            <span class="px-2 py-0.5 rounded font-bold iso-${matDesb.iso}">ISO ${matDesb.iso} · CMC ${matDesb.cmc}</span>
        </div>
        <div class="space-y-3 mt-4 avoid-break">
            <h3 class="text-sm font-extrabold uppercase bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-900">1. Datos Generales</h3>
            <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><strong>• Material:</strong> ${matDesb.nombre} (AMG ${MAP_CMC_TO_DORMER[matDesb.cmc] || "-"})</div>
                <div><strong>• Potencia:</strong> ${potMotor} kW ${usaEta ? `(η=${eta})` : ""}</div>
                <div><strong>• Tocho:</strong> ${Lb} × ${Wb} × ${Hb} mm</div>
                <div><strong>• Prisma:</strong> ${Lf} × ${Wf} × ${Hf} mm</div>
                <div><strong>• kc:</strong> ${matDesb.kc} N/mm² · mc=${matDesb.mc}</div>
                <div><strong>• Estrategia:</strong> Desbaste + Terminación (Catálogos mixtos)</div>
                ${escalonesCaja.length > 0 ? `<div class="col-span-2 text-indigo-900"><strong>• Caja de velocidades activa (RPM):</strong> ${escalonesCaja.join(", ")}</div>` : ""}
            </div>
        </div>
        ${usaTemple ? `<div class="p-3 mt-3 rounded-lg bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-950"><strong>🔥 Temple:</strong> acabado usa ${matTerm.nombre} (kc=${matTerm.kc} N/mm²).</div>` : ""}
        <div class="space-y-2 mt-4">
            <h3 class="text-sm font-extrabold uppercase bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-900">2. Desglose de Operaciones</h3>
            ${reporteOpsHTML || '<p class="text-xs text-slate-500 italic">No hay operaciones configuradas.</p>'}
            ${reporteTerminacion}
        </div>
        <div class="space-y-2 mt-4 avoid-break">
            <h3 class="text-sm font-extrabold uppercase bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-900">3. Verificación de Potencia</h3>
            <div class="formula-box">
                ${htmlVerificacionPotencia}
            </div>
            <div class="p-3.5 rounded-lg border ${verificaPotencia ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"} text-xs text-center font-bold ${verificaPotencia ? "text-emerald-800" : "text-red-800"}">
                ${verificaPotencia ? "✅ Potencia suficiente" : "❌ Excede la potencia de la máquina"}
            </div>
        </div>
        <div class="bg-slate-900 text-white p-4 rounded-xl mt-4 flex justify-between items-center">
            <span class="text-xs font-bold uppercase text-slate-400">Tiempo Total (Real)</span>
            <span class="text-2xl font-black mono text-emerald-400">${tTotal.toFixed(3)} min</span>
        </div>`;
}
