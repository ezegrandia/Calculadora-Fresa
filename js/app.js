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
// CONTROL DE LA GUÍA LATERAL
// ============================================================
function toggleAyuda() {
    const panel = document.getElementById("ayudaPanel");
    const backdrop = document.getElementById("ayudaBackdrop");

    // Si por algún motivo no existen en el HTML, no hace nada (protección)
    if (!panel || !backdrop) return;

    if (panel.classList.contains("translate-x-full")) {
        panel.classList.remove("translate-x-full");
        backdrop.classList.remove("hidden");
    } else {
        panel.classList.add("translate-x-full");
        backdrop.classList.add("hidden");
    }

    // Redibujar el canvas después de que termine la animación para evitar bugs visuales
    setTimeout(() => {
        if (typeof actualizarVistaYAlertas === "function") actualizarVistaYAlertas();
    }, 350);
}

// Cerrar con la tecla Escape
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
        // Retardo para asegurar que Tailwind dibuje todo antes de pintar el canvas
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
