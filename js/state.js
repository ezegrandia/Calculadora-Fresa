// ============================================================
// ESTADO GLOBAL
// ============================================================
let escalones = [],
    ranuras = [],
    perforados = [],
    abocardados = [],
    idCounter = 0;

// ============================================================
// LECTURA DE DATOS DE UI
// ============================================================
function getDims() {
    const Lb = parseFloat(document.getElementById("largoInput").value) || 105;
    const Wb = parseFloat(document.getElementById("anchoInput").value) || 75;
    const Hb = parseFloat(document.getElementById("altoInput").value) || 55;
    const Lf = Math.min(Lb, parseFloat(document.getElementById("largoFinalInput").value) || Lb);
    const Wf = Math.min(Wb, parseFloat(document.getElementById("anchoFinalInput").value) || Wb);
    const Hf = Math.min(Hb, parseFloat(document.getElementById("altoFinalInput").value) || Hb);
    return { Lb, Wb, Hb, Lf, Wf, Hf };
}

function getMaterialActual() {
    const matInput = document.getElementById("matInput");
    const cmcResuelto = matInput ? matInput.dataset.cmc : null;

    if (!cmcResuelto) {
        return {
            cmc: "custom",
            iso: "P",
            nombre: document.getElementById("customNombre").value || "Material personalizado",
            kc: parseFloat(document.getElementById("customKc").value) || 1800,
            mc: parseFloat(document.getElementById("customMc").value) || 0.25,
            hb: 0,
            vc_mucho: parseFloat(document.getElementById("customVc").value) || 250,
            vc_poco: parseFloat(document.getElementById("customVc").value) || 250,
        };
    }
    return DB_MATERIALES[cmcResuelto];
}

function esEntradaInferior(zona) {
    if (!zona) return false;
    if (zona === "cara_inf") return true;
    if (zona.startsWith("escalon_")) {
        const eid = parseInt(zona.split("_")[1]);
        const e = escalones.find((x) => x.id === eid);
        return !!(e && e.ubicacion && e.ubicacion.startsWith("inf_"));
    }
    if (zona.startsWith("ranura_")) {
        const rid = parseInt(zona.split("_")[1]);
        const r = ranuras.find((x) => x.id === rid);
        return !!(r && r.cara && r.cara.startsWith("inf_"));
    }
    return false;
}

function factorEmpane(empane) {
    return empane === "mucho" ? 2 / 3 : 0.1;
}
function vcSegunEmpane(mat, empane) {
    return empane === "mucho" ? mat.vc_mucho : mat.vc_poco;
}

function notificarCambio() {
    if (typeof invalidarCalculos === "function") invalidarCalculos();
    if (typeof actualizarVistaYAlertas === "function") actualizarVistaYAlertas();
}

function catalogoRecomendado(seccion, subseccion) {
    if (seccion === "planeado") return "sandvik";
    return "dormer";
}

function getCodigoHerramienta(op, fase) {
    if (op.catalogo === "dormer") return fase === "Desbaste" ? op.codigoHerramientaDesbaste : op.codigoHerramientaTerminacion;
    return fase === "Desbaste" ? op.codigoHerramientaDesbaste : op.codigoHerramientaTerminacion;
}

function getVcFase(op, fase, mat, empane) {
    const toolCode = fase === "Desbaste" ? op.codigoHerramientaDesbaste : op.codigoHerramientaTerminacion;
    const cat = fase === "Desbaste" ? op.catalogoDesbaste : op.catalogoTerminacion;
    if (cat === "dormer") return getDormerVc(mat, toolCode);
    return empane === "mucho" ? mat.vc_mucho : mat.vc_poco;
}

function getVcTerminacionFase(op, mat) {
    if (op.vcTerminacionOverride) return op.vcTerminacionOverride;
    if (op.catalogoTerminacion === "dormer") return getDormerVc(mat, op.codigoHerramientaTerminacion);
    return mat.vc_poco;
}

// ============================================================
// HELPER DE CAMPOS DE OPERACIÓN (Sincroniza Dormer y Sandvik)
// ============================================================
function setOpField(op, field, val) {
    const mat = getMaterialActual();
    if (field === "terminacionActiva" || field === "esInsertoDesbaste" || field === "esInsertoTerminacion") {
        op[field] = Boolean(val);
        return "rerender";
    }
    if (field === "catalogoDesbaste") {
        op.catalogoDesbaste = val;
        if (val === "dormer") {
            if (!DB_DORMER_HERRAMIENTAS[op.codigoHerramientaDesbaste]) op.codigoHerramientaDesbaste = "C907";
            const tD = DB_DORMER_HERRAMIENTAS[op.codigoHerramientaDesbaste];
            if (tD) {
                op.znDesbaste = tD.zn;
                op.fzDesbaste = getDormerFzFresa(mat, op.codigoHerramientaDesbaste, op.dcDesbaste);
            }
        }
        return "rerender";
    }
    if (field === "catalogoTerminacion") {
        op.catalogoTerminacion = val;
        if (val === "dormer") {
            if (!DB_DORMER_HERRAMIENTAS[op.codigoHerramientaTerminacion])
                op.codigoHerramientaTerminacion = op.codigoHerramientaDesbaste || "C907";
            const tT = DB_DORMER_HERRAMIENTAS[op.codigoHerramientaTerminacion];
            if (tT) {
                op.znTerminacion = tT.zn;
                op.fzTerminacion = getDormerFzFresa(mat, op.codigoHerramientaTerminacion, op.dcTerminacion);
            }
        }
        return "rerender";
    }
    if (field === "codigoHerramientaDesbaste") {
        op.codigoHerramientaDesbaste = val.trim().toUpperCase();
        if (op.catalogoDesbaste === "dormer" && DB_DORMER_HERRAMIENTAS[op.codigoHerramientaDesbaste]) {
            const tD = DB_DORMER_HERRAMIENTAS[op.codigoHerramientaDesbaste];
            op.znDesbaste = tD.zn;
            op.fzDesbaste = getDormerFzFresa(mat, op.codigoHerramientaDesbaste, op.dcDesbaste);
        }
        return "rerender";
    }
    if (field === "codigoHerramientaTerminacion") {
        op.codigoHerramientaTerminacion = val.trim().toUpperCase();
        if (op.catalogoTerminacion === "dormer" && DB_DORMER_HERRAMIENTAS[op.codigoHerramientaTerminacion]) {
            const tT = DB_DORMER_HERRAMIENTAS[op.codigoHerramientaTerminacion];
            op.znTerminacion = tT.zn;
            op.fzTerminacion = getDormerFzFresa(mat, op.codigoHerramientaTerminacion, op.dcTerminacion);
        }
        return "rerender";
    }
    if (
        [
            "empaneDesbaste",
            "empaneTerminacion",
            "codigoInsertoDesbaste",
            "codigoInsertoTerminacion",
            "calidadInsertoDesbaste",
            "calidadInsertoTerminacion",
        ].includes(field)
    ) {
        op[field] = val;
        return "rerender";
    }
    if (
        [
            "vcTerminacionOverride",
            "vcMinTerminacion",
            "vcMedTerminacion",
            "vcMaxTerminacion",
            "vcMinDesbaste",
            "vcMedDesbaste",
            "vcMaxDesbaste",
            "vcDesbasteOverride",
            "fzMinDesbaste",
            "fzMedDesbaste",
            "fzMaxDesbaste",
            "fzMinTerminacion",
            "fzMedTerminacion",
            "fzMaxTerminacion",
            "aeTerminacionOverride",
        ].includes(field)
    ) {
        op[field] = val === "" || val === null || val === undefined ? null : parseFloat(val) || null;
        return "norender";
    }
    op[field] = parseFloat(val) || 0;
    if (op.catalogoDesbaste === "dormer" && field === "dcDesbaste" && DB_DORMER_HERRAMIENTAS[op.codigoHerramientaDesbaste]) {
        op.fzDesbaste = getDormerFzFresa(mat, op.codigoHerramientaDesbaste, op.dcDesbaste);
        return "rerender";
    }
    if (
        op.catalogoTerminacion === "dormer" &&
        field === "dcTerminacion" &&
        DB_DORMER_HERRAMIENTAS[op.codigoHerramientaTerminacion]
    ) {
        op.fzTerminacion = getDormerFzFresa(mat, op.codigoHerramientaTerminacion, op.dcTerminacion);
        return "rerender";
    }
    return "norender";
}
