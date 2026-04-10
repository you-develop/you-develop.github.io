// 체크 시 폭죽 애니메이션 (캔버스 기반)
let activeCanvas = null;

export function launch(el) {
    activeCanvas?.remove();

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    activeCanvas = canvas;

    const ctx = canvas.getContext('2d');
    const particles = Array.from({ length: 20 }, () => ({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * -10 - 3,
        hue: Math.random() * 360,
        size: Math.random() * 5 + 3,
        alpha: 1,
    }));

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35;
            p.alpha -= 0.022;
            if (p.alpha <= 0) continue;
            alive = true;
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = `hsl(${p.hue},100%,60%)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (alive) requestAnimationFrame(tick);
        else { canvas.remove(); if (activeCanvas === canvas) activeCanvas = null; }
    }

    requestAnimationFrame(tick);
}
