// ============================================================
// LISTENER GLOBAL
// ============================================================
function esElementoDeEntrada(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") {
        if (el.readOnly || el.disabled) return false;
        return true;
    }
    return false;
}

document.addEventListener("input", (e) => {
    if (esElementoDeEntrada(e.target)) invalidarCalculos();
});
document.addEventListener("change", (e) => {
    if (esElementoDeEntrada(e.target)) invalidarCalculos();
});

document.addEventListener(
    "wheel",
    (e) => {
        if (e.target.tagName === "INPUT" && e.target.type === "number") {
            e.target.blur();
        }
    },
    { passive: true },
);

// ============================================================
// CONTROL DE LA CAJA DE VELOCIDADES (UI)
// ============================================================
function toggleCajaRpmUI() {
    const chk = document.getElementById("chkCajaRpm");
    const box = document.getElementById("boxCajaRpm");
    if (!chk || !box) return;
    if (chk.checked) {
        box.classList.remove("hidden");
    } else {
        box.classList.add("hidden");
    }
}

// ============================================================
// CONTROL DE LA GUÍA LATERAL
// ============================================================
function toggleAyuda() {
    const panel = document.getElementById("ayudaPanel");
    const backdrop = document.getElementById("ayudaBackdrop");

    if (!panel || !backdrop) return;

    if (panel.classList.contains("translate-x-full")) {
        panel.classList.remove("translate-x-full");
        backdrop.classList.remove("hidden");
    } else {
        panel.classList.add("translate-x-full");
        backdrop.classList.add("hidden");
    }

    setTimeout(() => {
        if (typeof actualizarVistaYAlertas === "function") actualizarVistaYAlertas();
    }, 350);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const panel = document.getElementById("ayudaPanel");
        if (panel && !panel.classList.contains("translate-x-full")) {
            toggleAyuda();
        }
    }
});

// ============================================================
// RESIZE
// ============================================================
window.addEventListener("resize", () => {
    if (typeof actualizarVistaYAlertas === "function") actualizarVistaYAlertas();
});

// ============================================================
// INIT
// ============================================================
window.onload = () => {
    try {
        toggleEtaUI();
        toggleRpmUI();
        toggleCajaRpmUI();
        toggleTempleUI();
        togglePlaneadoTerminacionUI();
        toggleInsertoPlaneado("Desbaste");
        toggleInsertoPlaneado("Terminacion");
        poblarSelectCMC();
        cargarPresetEjercicioGuia();
        invalidarCalculos();
    } catch (error) {
        console.error("Error en la carga inicial:", error);
    } finally {
        setTimeout(() => {
            if (typeof actualizarVistaYAlertas === "function") actualizarVistaYAlertas();
        }, 150);
    }
};

function poblarSelectCMC() {
    const sel = document.getElementById("cmcSelect");
    if (!sel) return;
    sel.innerHTML = Object.keys(DB_MATERIALES)
        .map((cmc) => `<option value="${cmc}">${cmc} · ${DB_MATERIALES[cmc].nombre}</option>`)
        .join("");
}
