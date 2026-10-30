function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v;
}

function setChk(id, v) {
    const el = document.getElementById(id);
    if (el) el.checked = v;
}

function limpiarOperaciones() {
    escalones = [];
    ranuras = [];
    perforados = [];
    abocardados = [];
    renderizarEscalones();
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    notificarCambio();
}

function resetearTodo() {
    if (!confirm("¿Resetear todo? Se perderán las operaciones y datos actuales.")) return;
    escalones = [];
    ranuras = [];
    perforados = [];
    abocardados = [];

    setVal("largoInput", 100);
    setVal("anchoInput", 80);
    setVal("altoInput", 50);
    setVal("largoFinalInput", 95);
    setVal("anchoFinalInput", 75);
    setVal("altoFinalInput", 45);

    setVal("matInput", "01.2");
    alCambiarMaterial();

    setVal("cmcSelect", "01.2");
    setVal("potInput", 10);
    setChk("chkEta", true);
    setVal("etaInput", 0.9);
    setChk("chkMaxRpm", false);
    setVal("maxRpmInput", 4000);
    setVal("cajaRpmInput", "22, 45, 90, 180, 360, 720, 1440");
    setChk("chkTemple", false);

    toggleEtaUI();
    toggleRpmUI();
    if (typeof toggleCajaRpmUI === "function") toggleCajaRpmUI();
    toggleTempleUI();

    setVal("plDcDesbaste", 80);
    setVal("plZnDesbaste", 6);
    setVal("plDcTerminacion", 80);
    setVal("plZnTerminacion", 6);

    setChk("plEsInsertoDesbaste", true);
    setVal("plCodigoHerramientaDesbaste", "");
    setVal("plCodigoInsertoDesbaste", "");
    setVal("plCalidadDesbaste", "");
    setVal("plVcDesbaste", "");

    setChk("plEsInsertoTerminacion", true);
    setVal("plCodigoHerramientaTerminacion", "");
    setVal("plCodigoInsertoTerminacion", "");
    setVal("plCalidadTerminacion", "");
    setVal("plVcTerminacion", "");
    setVal("plAeTerminacionOverride", "");

    setVal("plEmpaneDesbaste", "mucho");
    setVal("plEmpaneTerminacion", "poco");
    setVal("plFzDesbaste", 0.12);
    setVal("plApDesbaste", 2.5);
    setVal("plSobreMaterial", 0.5);
    setChk("plTerminacionActiva", true);
    setVal("plFzTerminacion", 0.08);
    setVal("plApTerminacion", 0.5);

    ["pl_sup", "pl_inf", "pl_lat_izq", "pl_lat_der", "pl_frente", "pl_atras"].forEach((id) => setChk(id, true));

    togglePlaneadoTerminacionUI();
    toggleInsertoPlaneado("Desbaste");
    toggleInsertoPlaneado("Terminacion");

    renderizarEscalones();
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    alCambiarDimensiones();
}

function cargarPresetEjercicioGuia() {
    setVal("matInput", "4140");
    alCambiarMaterial();
    setVal("cmcSelect", "02.1");
    setVal("potInput", 10);
    setChk("chkEta", true);
    toggleEtaUI();
    setVal("etaInput", 0.9);
    setChk("chkMaxRpm", false);
    toggleRpmUI();
    setChk("chkTemple", false);
    toggleTempleUI();

    setVal("largoInput", 210);
    setVal("anchoInput", 110);
    setVal("altoInput", 90);
    setVal("largoFinalInput", 200);
    setVal("anchoFinalInput", 100);
    setVal("altoFinalInput", 80);

    setVal("plDcDesbaste", 80);
    setVal("plZnDesbaste", 6);
    setVal("plDcTerminacion", 80);
    setVal("plZnTerminacion", 6);
    setVal("plEmpaneDesbaste", "mucho");
    setVal("plEmpaneTerminacion", "poco");
    setVal("plFzDesbaste", 0.12);
    setVal("plApDesbaste", 2.5);
    setVal("plSobreMaterial", 0.5);
    setChk("plTerminacionActiva", false);
    setVal("plFzTerminacion", 0.08);
    setVal("plApTerminacion", 0.5);
    setVal("plVcTerminacion", "");
    setVal("plVcDesbaste", "285");
    setVal("plAeTerminacionOverride", "");
    setVal("plCalidadDesbaste", "GC4240");
    setVal("plCalidadTerminacion", "GC1620");

    ["pl_sup", "pl_inf", "pl_lat_izq", "pl_lat_der", "pl_frente", "pl_atras"].forEach((id) => setChk(id, true));

    escalones = [];
    ranuras = [];
    perforados = [];
    abocardados = [];
    idCounter++;
    escalones.push({
        id: idCounter,
        ubicacion: "sup_izq",
        ancho: 30,
        prof: 20,
        largo: 200,
        pasante: true,
        ...DEFAULTS_OP,
        catalogoDesbaste: "sandvik",
        catalogoTerminacion: "dormer",
        dcDesbaste: 80,
        znDesbaste: 6,
        fzDesbaste: 0.12,
        apDesbaste: 2.5,
        calidadInsertoDesbaste: "GC4240",
        codigoHerramientaDesbaste: "R290-080Q27-12M",
        codigoInsertoDesbaste: "R290.90-12T320M-PM",
        dcTerminacion: 16,
        znTerminacion: 6,
        fzTerminacion: 0.09,
        apTerminacion: 0.5,
        aeTerminacionOverride: 16,
        calidadInsertoTerminacion: "GC1620",
        codigoHerramientaTerminacion: "R215.38-16050-AC32L",
        terminacionActiva: true,
    });

    renderizarEscalones();
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    alCambiarDimensiones();
}

function cargarPresetEjercicio4() {
    setVal("matInput", "05.21");
    alCambiarMaterial();
    setVal("cmcSelect", "05.21");
    setVal("potInput", 3);
    setChk("chkEta", true);
    toggleEtaUI();
    setVal("etaInput", 0.98);
    setChk("chkMaxRpm", false);
    toggleRpmUI();
    setChk("chkTemple", false);
    toggleTempleUI();

    setVal("largoInput", 105);
    setVal("anchoInput", 75);
    setVal("altoInput", 55);
    setVal("largoFinalInput", 90);
    setVal("anchoFinalInput", 70);
    setVal("altoFinalInput", 50);

    setVal("plDcDesbaste", 80);
    setVal("plZnDesbaste", 6);
    setVal("plFzDesbaste", 0.12);
    setVal("plVcDesbaste", 225);
    setVal("plApDesbaste", 2.33);
    setVal("plSobreMaterial", 0.5);
    setChk("plTerminacionActiva", true);
    setVal("plFzTerminacion", 0.12);
    setVal("plVcTerminacion", 225);
    setVal("plApTerminacion", 0.5);
    setVal("plAeTerminacionOverride", 37.5);
    setVal("plCalidadDesbaste", "GC 2040");
    setVal("plCalidadTerminacion", "GC 2040");
    setVal("plCodigoHerramientaDesbaste", "R290-080Q27-12M");
    setVal("plCodigoInsertoDesbaste", "R290-12T308M-PM");

    ["pl_sup", "pl_inf", "pl_lat_izq", "pl_lat_der", "pl_frente", "pl_atras"].forEach((id) => setChk(id, true));

    escalones = [];
    ranuras = [];
    perforados = [];
    abocardados = [];

    idCounter++;
    escalones.push({
        id: idCounter,
        ubicacion: "sup_izq",
        ancho: 20,
        prof: 18,
        largo: 90,
        pasante: true,
        ...DEFAULTS_OP,
        catalogoDesbaste: "sandvik",
        catalogoTerminacion: "dormer",
        dcDesbaste: 80,
        znDesbaste: 6,
        fzDesbaste: 0.12,
        vcDesbasteOverride: 225,
        apDesbaste: 6.19,
        sobreMaterial: 0.5,
        esInsertoDesbaste: true,
        codigoHerramientaDesbaste: "R290-080Q27-12M",
        codigoInsertoDesbaste: "R290-12T308M-PM",
        calidadInsertoDesbaste: "GC 2040",
        terminacionActiva: true,
        dcTerminacion: 20,
        znTerminacion: 4,
        fzTerminacion: 0.271,
        vcTerminacionOverride: 70,
        apTerminacion: 30,
        aeTerminacionOverride: 20,
        esInsertoTerminacion: false,
        codigoHerramientaTerminacion: "S76320.0XR3.0",
    });

    idCounter++;
    escalones.push({
        id: idCounter,
        ubicacion: "sup_der",
        ancho: 20,
        prof: 32,
        largo: 90,
        pasante: true,
        ...DEFAULTS_OP,
        catalogoDesbaste: "sandvik",
        catalogoTerminacion: "dormer",
        dcDesbaste: 80,
        znDesbaste: 6,
        fzDesbaste: 0.12,
        vcDesbasteOverride: 225,
        apDesbaste: 6.19,
        sobreMaterial: 0.5,
        esInsertoDesbaste: true,
        codigoHerramientaDesbaste: "R290-080Q27-12M",
        codigoInsertoDesbaste: "R290-12T308M-PM",
        calidadInsertoDesbaste: "GC 2040",
        terminacionActiva: true,
        dcTerminacion: 20,
        znTerminacion: 4,
        fzTerminacion: 0.271,
        vcTerminacionOverride: 70,
        apTerminacion: 16,
        aeTerminacionOverride: 20,
        esInsertoTerminacion: false,
        codigoHerramientaTerminacion: "S76320.0XR3.0",
    });

    idCounter++;
    const perfId = idCounter;
    perforados.push({
        id: perfId,
        diam: 10,
        tipo: "pasante",
        prof: 50,
        cant: 3,
        zona: "cara_sup",
        concentricoId: null,
        modoCruce: "ninguno",
        pretaladradoActivo: true,
        catalogo: "dormer",
        codigoHerramienta: "A553",
    });

    idCounter++;
    abocardados.push({
        id: idCounter,
        dBroca: 10,
        dAboc: 14,
        prof: 8.8,
        cant: 3,
        zona: "cara_sup",
        concentricoId: perfId,
        modoCruce: "ninguno",
        ...DEFAULTS_OP,
        catalogoDesbaste: "dormer",
        catalogoTerminacion: "dormer",
        esInsertoDesbaste: false,
        esInsertoTerminacion: false,
        dcDesbaste: 14,
        znDesbaste: 2,
        fzDesbaste: 0.025,
        vcDesbasteOverride: 55,
        apDesbaste: 8.8,
        codigoHerramientaDesbaste: "S802HA",
        codigoHerramientaTerminacion: "S802HA",
    });

    renderizarEscalones();
    renderizarRanuras();
    renderizarPerforados();
    renderizarAbocardados();
    alCambiarDimensiones();
}
