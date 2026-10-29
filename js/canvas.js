// ============================================================
// DIBUJO DEL PLANO TÉCNICO
// ============================================================
function dibujarPiezaCanvas(alertasActivas = []) {
    const canvas = document.getElementById("piezaCanvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 820;
    canvas.height = rect.height || 540;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const dims = getDims();
    const { Lb, Wb, Hb, Lf, Wf, Hf } = dims;
    const splitX = canvas.width * 0.54;
    const splitY = canvas.height * 0.50;
    const grilla = construirGrilla3D(Lf, Wf, Hf);
    const { X, Y, Z, nx, ny, nz, isSolid } = grilla;

    // --- ISOMÉTRICO ---
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, splitX, canvas.height); ctx.clip();
    const maxDimIso = Math.max(Lb, Wb, Hb, 10);
    const scaleIso = Math.min(splitX, canvas.height) / (maxDimIso * 2.45);
    const isoX = 0.866, isoY = 0.5;
    const cxIso = splitX * 0.48, cyIso = canvas.height * 0.53;
    function projIso(x, y, z) {
        return {
            x: cxIso + (x + y - (Lf + Wf) / 2) * isoX * scaleIso,
            y: cyIso + (x - y - (Lf - Wf) / 2) * isoY * scaleIso - (z - Hf / 2) * scaleIso
        };
    }
    function drawLineIso(p1, p2, color = "#0f172a", lw = 1.8) {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.stroke();
    }
    function fillQuadIso(p1, p2, p3, p4, fillCol) {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
        ctx.fillStyle = fillCol; ctx.fill(); ctx.strokeStyle = fillCol; ctx.lineWidth = 0.6; ctx.stroke();
    }
    function drawCota(p1, p2, off, text, color = "#0284c7") {
        const p1o = { x: p1.x + off.x, y: p1.y + off.y };
        const p2o = { x: p2.x + off.x, y: p2.y + off.y };
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1o.x, p1o.y); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p2o.x, p2o.y); ctx.moveTo(p1o.x, p1o.y); ctx.lineTo(p2o.x, p2o.y); ctx.stroke();
        const ang = Math.atan2(p2o.y - p1o.y, p2o.x - p1o.x), sz = 4.5;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(p1o.x, p1o.y); ctx.lineTo(p1o.x + sz * Math.cos(ang - Math.PI / 6), p1o.y + sz * Math.sin(ang - Math.PI / 6)); ctx.lineTo(p1o.x + sz * Math.cos(ang + Math.PI / 6), p1o.y + sz * Math.sin(ang + Math.PI / 6)); ctx.fill();
        ctx.beginPath(); ctx.moveTo(p2o.x, p2o.y); ctx.lineTo(p2o.x - sz * Math.cos(ang - Math.PI / 6), p2o.y - sz * Math.sin(ang - Math.PI / 6)); ctx.lineTo(p2o.x - sz * Math.cos(ang + Math.PI / 6), p2o.y - sz * Math.sin(ang + Math.PI / 6)); ctx.fill();
        ctx.font = "bold 10.5px JetBrains Mono";
        const mx = (p1o.x + p2o.x) / 2, my = (p1o.y + p2o.y) / 2;
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fillRect(mx - tw / 2 - 3, my - 6.5, tw + 6, 13);
        ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, mx, my);
        ctx.restore();
    }

    // Bounding box del tocho
    const oL = (Lb - Lf) / 2, oW = (Wb - Wf) / 2, oH = (Hb - Hf) / 2;
    const x0b = -oL, x1b = Lf + oL, y0b = -oW, y1b = Wf + oW, z0b = -oH, z1b = Hf + oH;
    ctx.save(); ctx.setLineDash([4, 4]);
    drawLineIso(projIso(x0b, y1b, z0b), projIso(x0b, y0b, z0b), "#cbd5e1", 1.1);
    drawLineIso(projIso(x0b, y1b, z0b), projIso(x1b, y1b, z0b), "#cbd5e1", 1.1);
    drawLineIso(projIso(x0b, y1b, z0b), projIso(x0b, y1b, z1b), "#cbd5e1", 1.1);
    ctx.restore();

    function esAristaReal(c00, c10, c01, c11) {
        const pA = (c00 === c10) && (c01 === c11);
        const pB = (c00 === c01) && (c10 === c11);
        return !pA && !pB;
    }
    ctx.save(); ctx.setLineDash([4, 3]);
    for (let i = 0; i < nx; i++) for (let j = 0; j <= ny; j++) for (let k = 0; k <= nz; k++)
        if (esAristaReal(isSolid(i, j - 1, k - 1), isSolid(i, j, k - 1), isSolid(i, j - 1, k), isSolid(i, j, k)))
            drawLineIso(projIso(X[i], Y[j], Z[k]), projIso(X[i + 1], Y[j], Z[k]), "#94a3b8", 1.1);
    for (let j = 0; j < ny; j++) for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++)
        if (esAristaReal(isSolid(i - 1, j, k - 1), isSolid(i, j, k - 1), isSolid(i - 1, j, k), isSolid(i, j, k)))
            drawLineIso(projIso(X[i], Y[j], Z[k]), projIso(X[i], Y[j + 1], Z[k]), "#94a3b8", 1.1);
    for (let k = 0; k < nz; k++) for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++)
        if (esAristaReal(isSolid(i - 1, j - 1, k), isSolid(i, j - 1, k), isSolid(i - 1, j, k), isSolid(i, j, k)))
            drawLineIso(projIso(X[i], Y[j], Z[k]), projIso(X[i], Y[j], Z[k + 1]), "#94a3b8", 1.1);
    ctx.restore();

    function hasFaceZ(i, j, k) { return isSolid(i, j, k) && !isSolid(i, j, k + 1); }
    function hasFaceX(i, j, k) { return isSolid(i, j, k) && !isSolid(i + 1, j, k); }
    function hasFaceY(i, j, k) { return isSolid(i, j, k) && !isSolid(i, j - 1, k); }

    // Recolectar agujeros con su zTop
    const holesIso = [];
    perforados.forEach(p => {
        const result = getOperationPositions(p, grilla, dims);
        if (result.error || !result.positions) return;
        result.positions.forEach(pos => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (c.hayMaterial) holesIso.push({ x: pos.x, y: pos.y, diam: p.diam, isAboc: false, diamAboc: 0, desdeAbajo: false, zTop: c.zTop, zBot: c.zBot });
        });
    });
    abocardados.forEach(a => {
        const result = getOperationPositions(a, grilla, dims);
        if (result.error || !result.positions) return;
        result.positions.forEach(pos => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (c.hayMaterial) holesIso.push({ x: pos.x, y: pos.y, diam: a.dBroca, isAboc: true, diamAboc: a.dAboc, desdeAbajo: esEntradaInferior(a.zona), zTop: c.zTop, zBot: c.zBot });
        });
    });

    function drawHoleIso(x, y, diam, isAboc, diamAboc, desdeAbajo = false) {
        if (x < -0.01 || x > Lf + 0.01 || y < -0.01 || y > Wf + 0.01) return;
        const { zTop, zBot, hayMaterial } = obtenerCotasVerticalesEnPunto(grilla, x, y, Hf);
        if (!hayMaterial) return;
        if (isAboc && desdeAbajo) {
            const pTop = projIso(x, y, zTop);
            const rx = (diam / 2) * scaleIso * isoX * Math.SQRT2;
            const ry = (diam / 2) * scaleIso * isoY * Math.SQRT2;
            ctx.beginPath(); ctx.ellipse(pTop.x, pTop.y, rx, ry, 0, 0, 2 * Math.PI); ctx.fillStyle = "#1e293b"; ctx.fill(); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.5; ctx.stroke();
            const pBot = projIso(x, y, zBot);
            const rxA = (diamAboc / 2) * scaleIso * isoX * Math.SQRT2;
            const ryA = (diamAboc / 2) * scaleIso * isoY * Math.SQRT2;
            ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.ellipse(pBot.x, pBot.y, rxA, ryA, 0, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
            return;
        }
        const p = projIso(x, y, zTop);
        const rx = (diam / 2) * scaleIso * isoX * Math.SQRT2;
        const ry = (diam / 2) * scaleIso * isoY * Math.SQRT2;
        if (isAboc) {
            const rxA = (diamAboc / 2) * scaleIso * isoX * Math.SQRT2;
            const ryA = (diamAboc / 2) * scaleIso * isoY * Math.SQRT2;
            ctx.beginPath(); ctx.ellipse(p.x, p.y, rxA, ryA, 0, 0, 2 * Math.PI); ctx.fillStyle = "#cbd5e1"; ctx.fill(); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, ry, 0, 0, 2 * Math.PI); ctx.fillStyle = "#1e293b"; ctx.fill(); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.5; ctx.stroke();
    }

    for (let k = 0; k < nz; k++) {
        for (let i = 0; i < nx; i++) for (let j = ny - 1; j >= 0; j--) {
            if (!isSolid(i, j, k)) continue;
            const x1 = X[i], x2 = X[i + 1], y1 = Y[j], y2 = Y[j + 1], z1 = Z[k], z2 = Z[k + 1];
            if (hasFaceZ(i, j, k)) {
                const p00 = projIso(x1, y1, z2), p10 = projIso(x2, y1, z2), p11 = projIso(x2, y2, z2), p01 = projIso(x1, y2, z2);
                const esTapaMax = Math.abs(z2 - Hf) < 1e-3;
                fillQuadIso(p00, p10, p11, p01, esTapaMax ? "rgba(248, 250, 252, 0.92)" : "rgba(226, 232, 240, 0.92)");
                if (!hasFaceZ(i - 1, j, k)) drawLineIso(p00, p01, "#0f172a", 1.8);
                if (!hasFaceZ(i + 1, j, k)) drawLineIso(p10, p11, "#0f172a", 1.8);
                if (!hasFaceZ(i, j - 1, k)) drawLineIso(p00, p10, "#0f172a", 1.8);
                if (!hasFaceZ(i, j + 1, k)) drawLineIso(p01, p11, "#0f172a", 1.8);
            }
            if (hasFaceY(i, j, k)) {
                const p00 = projIso(x1, y1, z1), p10 = projIso(x2, y1, z1), p11 = projIso(x2, y1, z2), p01 = projIso(x1, y1, z2);
                const esBordeIzq = Math.abs(y1) < 1e-3;
                fillQuadIso(p00, p10, p11, p01, esBordeIzq ? "rgba(226, 232, 240, 0.92)" : "rgba(203, 213, 225, 0.92)");
                if (!hasFaceY(i - 1, j, k)) drawLineIso(p00, p01, "#0f172a", 1.8);
                if (!hasFaceY(i + 1, j, k)) drawLineIso(p10, p11, "#0f172a", 1.8);
                if (!hasFaceY(i, j, k - 1)) drawLineIso(p00, p10, "#0f172a", 1.8);
                if (!hasFaceY(i, j, k + 1)) drawLineIso(p01, p11, "#0f172a", 1.8);
            }
            if (hasFaceX(i, j, k)) {
                const p00 = projIso(x2, y1, z1), p10 = projIso(x2, y2, z1), p11 = projIso(x2, y2, z2), p01 = projIso(x2, y1, z2);
                const esBordeFrente = Math.abs(x2 - Lf) < 1e-3;
                fillQuadIso(p00, p10, p11, p01, esBordeFrente ? "rgba(203, 213, 225, 0.92)" : "rgba(148, 163, 184, 0.92)");
                if (!hasFaceX(i, j - 1, k)) drawLineIso(p00, p01, "#0f172a", 1.8);
                if (!hasFaceX(i, j + 1, k)) drawLineIso(p10, p11, "#0f172a", 1.8);
                if (!hasFaceX(i, j, k - 1)) drawLineIso(p00, p10, "#0f172a", 1.8);
                if (!hasFaceX(i, j, k + 1)) drawLineIso(p01, p11, "#0f172a", 1.8);
            }
        }
        holesIso.forEach(h => { if (Math.abs(h.zTop - Z[k + 1]) < 1e-3) drawHoleIso(h.x, h.y, h.diam, h.isAboc, h.diamAboc, h.desdeAbajo); });
    }

    // Tocho punteado (aristas exteriores)
    if (Lb > Lf || Wb > Wf || Hb > Hf) {
        ctx.save(); ctx.setLineDash([5, 4]);
        drawLineIso(projIso(x0b, y0b, z1b), projIso(x1b, y0b, z1b), "#64748b", 1.1);
        drawLineIso(projIso(x1b, y0b, z1b), projIso(x1b, y1b, z1b), "#64748b", 1.1);
        drawLineIso(projIso(x1b, y1b, z1b), projIso(x0b, y1b, z1b), "#64748b", 1.1);
        drawLineIso(projIso(x0b, y1b, z1b), projIso(x0b, y0b, z1b), "#64748b", 1.1);
        drawLineIso(projIso(x0b, y0b, z0b), projIso(x1b, y0b, z0b), "#64748b", 1.1);
        drawLineIso(projIso(x1b, y0b, z0b), projIso(x1b, y1b, z0b), "#64748b", 1.1);
        drawLineIso(projIso(x0b, y0b, z0b), projIso(x0b, y0b, z1b), "#64748b", 1.1);
        drawLineIso(projIso(x1b, y0b, z0b), projIso(x1b, y0b, z1b), "#64748b", 1.1);
        drawLineIso(projIso(x1b, y1b, z0b), projIso(x1b, y1b, z1b), "#64748b", 1.1);
        ctx.restore();
    }

    drawCota(projIso(0, 0, 0), projIso(Lf, 0, 0), { x: -16, y: 24 }, `Lf: ${Lf}`);
    drawCota(projIso(Lf, 0, 0), projIso(Lf, Wf, 0), { x: 16, y: 24 }, `Wf: ${Wf}`);
    drawCota(projIso(Lf, Wf, 0), projIso(Lf, Wf, Hf), { x: 26, y: 0 }, `Hf: ${Hf}`);
    ctx.fillStyle = "#0f172a"; ctx.font = "bold 13px Inter"; ctx.textAlign = "left"; ctx.fillText("VISTA ISOMÉTRICA 3D", 14, 24);

    if (alertasActivas && alertasActivas.length > 0) {
        const msgCanvas = `⚠️ LÍMITE EXCEDIDO: ${alertasActivas[0].titulo}`;
        ctx.fillStyle = "rgba(254, 226, 226, 0.96)"; ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 1.5;
        ctx.fillRect(12, canvas.height - 42, splitX - 24, 30); ctx.strokeRect(12, canvas.height - 42, splitX - 24, 30);
        ctx.fillStyle = "#991b1b"; ctx.font = "bold 11px Inter"; ctx.fillText(msgCanvas, 20, canvas.height - 23);
    }
    ctx.restore();

    // Divisor
    ctx.save(); ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(splitX, 8); ctx.lineTo(splitX, canvas.height - 8);
    ctx.moveTo(splitX + 8, splitY); ctx.lineTo(canvas.width - 8, splitY);
    ctx.stroke();
    ctx.restore();

    // --- CORTES 2D ---
    function dibujarVistaCorte2D(rectBox, titulo, nU, nV, arrU, arrV, uMax, vMax, ubMax, vbMax, fnFullSolid, fnAnySolid, cotaULabel, cotaVLabel, agujerosProyectados) {
        ctx.save(); ctx.beginPath(); ctx.rect(rectBox.x, rectBox.y, rectBox.w, rectBox.h); ctx.clip();
        const cx = rectBox.x + rectBox.w * 0.53, cy = rectBox.y + rectBox.h * 0.54;
        const scale = Math.min(rectBox.w / (Math.max(ubMax, 10) * 1.65), rectBox.h / (Math.max(vbMax, 10) * 1.75));
        function proj2D(u, v) { return { x: cx + (u - uMax / 2) * scale, y: cy - (v - vMax / 2) * scale }; }
        const offU = (ubMax - uMax) / 2, offV = (vbMax - vMax) / 2;
        if (offU > 0 || offV > 0) {
            const p1 = proj2D(-offU, -offV), p2 = proj2D(uMax + offU, -offV), p3 = proj2D(uMax + offU, vMax + offV), p4 = proj2D(-offU, vMax + offV);
            ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.3; ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
        }
        for (let u = 0; u < nU; u++) for (let v = 0; v < nV; v++) if (fnAnySolid(u, v) && !fnFullSolid(u, v)) {
            const p00 = proj2D(arrU[u], arrV[v]), p11 = proj2D(arrU[u + 1], arrV[v + 1]);
            ctx.fillStyle = "#e2e8f0"; ctx.fillRect(p00.x, p11.y, p11.x - p00.x, p00.y - p11.y);
        }
        ctx.save(); ctx.beginPath();
        for (let u = 0; u < nU; u++) for (let v = 0; v < nV; v++) if (fnFullSolid(u, v)) {
            const p00 = proj2D(arrU[u], arrV[v]), p11 = proj2D(arrU[u + 1], arrV[v + 1]);
            ctx.rect(p00.x, p11.y, p11.x - p00.x, p00.y - p11.y);
        }
        ctx.clip();
        ctx.fillStyle = "#f8fafc"; ctx.fillRect(rectBox.x, rectBox.y, rectBox.w, rectBox.h);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
        for (let d = rectBox.x - rectBox.h; d < rectBox.x + rectBox.w + rectBox.h; d += 8) {
            ctx.beginPath(); ctx.moveTo(d, rectBox.y); ctx.lineTo(d + rectBox.h, rectBox.y + rectBox.h); ctx.stroke();
        }
        ctx.restore();

        const uniqueHoles = [];
        agujerosProyectados.forEach(h => {
            const key = `${h.uPos.toFixed(2)}_${h.zBot.toFixed(2)}_${h.zTop.toFixed(2)}_${h.d}_${h.isAboc ? h.dAboc : 0}`;
            if (!uniqueHoles.some(u => u._key === key)) uniqueHoles.push({ ...h, _key: key });
        });
        uniqueHoles.sort((a, b) => ((b.zTop - b.zBot) - (a.zTop - a.zBot)) || ((b.isAboc ? 1 : 0) - (a.isAboc ? 1 : 0)));
        uniqueHoles.forEach(h => {
            if (h.uPos < 0 || h.uPos > uMax || !h.hayMaterial) return;
            const p1 = proj2D(h.uPos - h.d / 2, h.zBot), p2 = proj2D(h.uPos + h.d / 2, h.zBot), p3 = proj2D(h.uPos + h.d / 2, h.zTop), p4 = proj2D(h.uPos - h.d / 2, h.zTop);
            ctx.save();
            if (h.isAboc) {
                ctx.fillStyle = "#ffffff"; ctx.beginPath();
                if (h.desdeAbajo) {
                    const zAbocTop = Math.min(h.zTop, h.zBot + h.profAboc);
                    const pB1 = proj2D(h.uPos - h.dAboc / 2, h.zBot), pB2 = proj2D(h.uPos + h.dAboc / 2, h.zBot), pB3 = proj2D(h.uPos + h.dAboc / 2, zAbocTop), pB4 = proj2D(h.uPos + h.d / 2, zAbocTop), pB5 = proj2D(h.uPos + h.d / 2, h.zTop), pB6 = proj2D(h.uPos - h.d / 2, h.zTop), pB7 = proj2D(h.uPos - h.d / 2, zAbocTop), pB8 = proj2D(h.uPos - h.dAboc / 2, zAbocTop);
                    ctx.moveTo(pB1.x, pB1.y); ctx.lineTo(pB2.x, pB2.y); ctx.lineTo(pB3.x, pB3.y); ctx.lineTo(pB4.x, pB4.y); ctx.lineTo(pB5.x, pB5.y); ctx.lineTo(pB6.x, pB6.y); ctx.lineTo(pB7.x, pB7.y); ctx.lineTo(pB8.x, pB8.y); ctx.closePath();
                } else {
                    const zBaseAboc = Math.max(h.zBot, h.zTop - h.profAboc);
                    const pA1 = proj2D(h.uPos - h.dAboc / 2, zBaseAboc), pA2 = proj2D(h.uPos + h.dAboc / 2, zBaseAboc), pA3 = proj2D(h.uPos + h.dAboc / 2, h.zTop), pA4 = proj2D(h.uPos - h.dAboc / 2, h.zTop);
                    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p2.x, pA1.y); ctx.lineTo(pA2.x, pA2.y); ctx.lineTo(pA3.x, pA3.y); ctx.lineTo(pA4.x, pA4.y); ctx.lineTo(pA1.x, pA1.y); ctx.lineTo(p1.x, pA1.y); ctx.closePath();
                }
                ctx.fill(); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.4; ctx.stroke();
            } else {
                ctx.fillStyle = "#ffffff"; ctx.beginPath();
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
                ctx.fill(); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.4; ctx.stroke();
            }
            ctx.setLineDash([5, 2, 2, 2]); ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1;
            const pE1 = proj2D(h.uPos, h.zBot - 3), pE2 = proj2D(h.uPos, h.zTop + 4);
            ctx.beginPath(); ctx.moveTo(pE1.x, pE1.y); ctx.lineTo(pE2.x, pE2.y); ctx.stroke();
            ctx.restore();
        });

        function drawSeg2D(u1, v1, u2, v2, col, lw, dashed = false) {
            const p1 = proj2D(u1, v1), p2 = proj2D(u2, v2);
            ctx.save(); if (dashed) ctx.setLineDash([4, 3]);
            ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            ctx.restore();
        }
        for (let u = 0; u <= nU; u++) for (let v = 0; v < nV; v++) {
            const fL = u > 0 ? fnFullSolid(u - 1, v) : false, fR = u < nU ? fnFullSolid(u, v) : false;
            const aL = u > 0 ? fnAnySolid(u - 1, v) : false, aR = u < nU ? fnAnySolid(u, v) : false;
            if (aL !== aR) drawSeg2D(arrU[u], arrV[v], arrU[u], arrV[v + 1], "#0f172a", 2.0);
            else if (fL !== fR) drawSeg2D(arrU[u], arrV[v], arrU[u], arrV[v + 1], "#334155", 1.4);
        }
        for (let v = 0; v <= nV; v++) for (let u = 0; u < nU; u++) {
            const fB = v > 0 ? fnFullSolid(u, v - 1) : false, fT = v < nV ? fnFullSolid(u, v) : false;
            const aB = v > 0 ? fnAnySolid(u, v - 1) : false, aT = v < nV ? fnAnySolid(u, v) : false;
            if (aB !== aT) drawSeg2D(arrU[u], arrV[v], arrU[u + 1], arrV[v], "#0f172a", 2.0);
            else if (fB !== fT) drawSeg2D(arrU[u], arrV[v], arrU[u + 1], arrV[v], "#334155", 1.4);
        }
        drawCota(proj2D(0, 0), proj2D(uMax, 0), { x: 0, y: 22 }, `${cotaULabel}: ${uMax}`);
        drawCota(proj2D(0, 0), proj2D(0, vMax), { x: -24, y: 0 }, `${cotaVLabel}: ${vMax}`);
        ctx.fillStyle = "#0f172a"; ctx.font = "bold 12px Inter"; ctx.textAlign = "left"; ctx.fillText(titulo, rectBox.x + 14, rectBox.y + 20);
        ctx.restore();
    }

    const agujerosCorteAA = [];
    perforados.forEach(p => {
        const result = getOperationPositions(p, grilla, dims);
        if (result.error || !result.positions) return;
        result.positions.forEach(pos => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (c.hayMaterial) agujerosCorteAA.push({ uPos: pos.y, d: p.diam, isAboc: false, zTop: c.zTop, zBot: p.tipo === 'ciego' ? Math.max(c.zBot, c.zTop - p.prof) : c.zBot, hayMaterial: true });
        });
    });
    abocardados.forEach(a => {
        const result = getOperationPositions(a, grilla, dims);
        if (result.error || !result.positions) return;
        result.positions.forEach(pos => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (c.hayMaterial) agujerosCorteAA.push({ uPos: pos.y, d: a.dBroca, isAboc: true, dAboc: a.dAboc, profAboc: a.prof, zTop: c.zTop, zBot: c.zBot, desdeAbajo: esEntradaInferior(a.zona), hayMaterial: true });
        });
    });
    dibujarVistaCorte2D({ x: splitX, y: 0, w: canvas.width - splitX, h: splitY }, "CORTE A-A (W × H)",
        ny, nz, Y, Z, Wf, Hf, Wb, Hb,
        (j, k) => { for (let i = 0; i < nx; i++) if (!isSolid(i, j, k)) return false; return true; },
        (j, k) => { for (let i = 0; i < nx; i++) if (isSolid(i, j, k)) return true; return false; },
        "Wf", "Hf", agujerosCorteAA);

    const agujerosCorteBB = [];
    perforados.forEach(p => {
        const result = getOperationPositions(p, grilla, dims);
        if (result.error || !result.positions) return;
        result.positions.forEach(pos => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (c.hayMaterial) agujerosCorteBB.push({ uPos: pos.x, d: p.diam, isAboc: false, zTop: c.zTop, zBot: p.tipo === 'ciego' ? Math.max(c.zBot, c.zTop - p.prof) : c.zBot, hayMaterial: true });
        });
    });
    abocardados.forEach(a => {
        const result = getOperationPositions(a, grilla, dims);
        if (result.error || !result.positions) return;
        result.positions.forEach(pos => {
            const c = obtenerCotasVerticalesEnPunto(grilla, pos.x, pos.y, Hf);
            if (c.hayMaterial) agujerosCorteBB.push({ uPos: pos.x, d: a.dBroca, isAboc: true, dAboc: a.dAboc, profAboc: a.prof, zTop: c.zTop, zBot: c.zBot, desdeAbajo: esEntradaInferior(a.zona), hayMaterial: true });
        });
    });
    dibujarVistaCorte2D({ x: splitX, y: splitY, w: canvas.width - splitX, h: canvas.height - splitY }, "CORTE B-B (L × H)",
        nx, nz, X, Z, Lf, Hf, Lb, Hb,
        (i, k) => { for (let j = 0; j < ny; j++) if (!isSolid(i, j, k)) return false; return true; },
        (i, k) => { for (let j = 0; j < ny; j++) if (isSolid(i, j, k)) return true; return false; },
        "Lf", "Hf", agujerosCorteBB);
}