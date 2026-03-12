const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");

const starsInput = document.getElementById("stars");
const speedInput = document.getElementById("speed");
const armsInput = document.getElementById("arms");
const starsVal = document.getElementById("starsVal");
const speedVal = document.getElementById("speedVal");
const armsVal = document.getElementById("armsVal");
const regenerateBtn = document.getElementById("regenerate");
const toggleBtn = document.getElementById("toggle");

let stars = [];
let width = 0;
let height = 0;
let running = true;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let baseOffsetX = 0;
let baseOffsetY = 0;

const state = {
  count: +starsInput.value,
  speed: +speedInput.value,
  arms: +armsInput.value,
  spread: 1.6,
  coreRadius: 28,
};

function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomGaussian() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateGalaxy() {
  stars = [];
  const maxR = Math.min(width, height) * 0.45;

  for (let i = 0; i < state.count; i++) {
    const arm = i % state.arms;
    const armOffset = (arm / state.arms) * Math.PI * 2;

    const radius = Math.pow(Math.random(), 0.55) * maxR;
    const spin = radius * 0.045;
    const angle = armOffset + spin + randomGaussian() * state.spread;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const depth = Math.random() * 0.9 + 0.1;
    const brightness = Math.random() * 0.75 + 0.25;
    const size = Math.random() * 1.8 * depth + 0.4;

    let color;
    const c = Math.random();
    if (c < 0.12) color = `rgba(130,160,255,${brightness})`;
    else if (c < 0.22) color = `rgba(255,190,150,${brightness})`;
    else color = `rgba(235,240,255,${brightness})`;

    stars.push({
      x,
      y,
      radius,
      angle,
      depth,
      size,
      color,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

function drawBackground() {
  ctx.fillStyle = "rgba(3,5,14,0.22)";
  ctx.fillRect(0, 0, width, height);

  // faint nebula clouds
  const g1 = ctx.createRadialGradient(
    width * 0.2,
    height * 0.3,
    20,
    width * 0.2,
    height * 0.3,
    width * 0.45
  );
  g1.addColorStop(0, "rgba(112,130,255,0.12)");
  g1.addColorStop(1, "rgba(112,130,255,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, width, height);

  const g2 = ctx.createRadialGradient(
    width * 0.8,
    height * 0.75,
    20,
    width * 0.8,
    height * 0.75,
    width * 0.35
  );
  g2.addColorStop(0, "rgba(255,120,190,0.08)");
  g2.addColorStop(1, "rgba(255,120,190,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, width, height);
}

function animate() {
  drawBackground();

  const cx = width / 2 + offsetX;
  const cy = height / 2 + offsetY;

  for (const s of stars) {
    if (running) {
      const speedFactor = (1.4 - Math.min(1.2, s.depth)) * 1.3;
      s.angle += state.speed * speedFactor;
      s.twinkle += 0.03 + Math.random() * 0.01;
    }

    const x = cx + Math.cos(s.angle) * s.radius * zoom;
    const y = cy + Math.sin(s.angle) * s.radius * zoom;

    const tw = 0.75 + Math.sin(s.twinkle) * 0.25;
    ctx.beginPath();
    ctx.fillStyle = s.color;
    ctx.globalAlpha = tw;
    ctx.arc(x, y, Math.max(0.3, s.size * zoom * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }

  // luminous core
  ctx.globalAlpha = 1;
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, state.coreRadius * zoom * 3.5);
  core.addColorStop(0, "rgba(255,248,210,0.95)");
  core.addColorStop(0.35, "rgba(245,220,150,0.4)");
  core.addColorStop(1, "rgba(245,220,150,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, state.coreRadius * zoom * 3.5, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(animate);
}

function syncLabels() {
  starsVal.textContent = state.count.toString();
  speedVal.textContent = state.speed.toFixed(4);
  armsVal.textContent = state.arms.toString();
}

function bindControls() {
  starsInput.addEventListener("input", (e) => {
    state.count = +e.target.value;
    syncLabels();
  });

  speedInput.addEventListener("input", (e) => {
    state.speed = +e.target.value;
    syncLabels();
  });

  armsInput.addEventListener("input", (e) => {
    state.arms = +e.target.value;
    syncLabels();
  });

  regenerateBtn.addEventListener("click", () => {
    generateGalaxy();
  });

  toggleBtn.addEventListener("click", () => {
    running = !running;
    toggleBtn.textContent = running ? "Pause" : "Resume";
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const direction = Math.sign(e.deltaY);
    zoom *= direction > 0 ? 0.92 : 1.08;
    zoom = Math.max(0.45, Math.min(2.7, zoom));
  });

  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    baseOffsetX = offsetX;
    baseOffsetY = offsetY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    offsetX = baseOffsetX + (e.clientX - dragStartX);
    offsetY = baseOffsetY + (e.clientY - dragStartY);
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });

  window.addEventListener("resize", () => {
    resize();
    generateGalaxy();
  });
}

resize();
bindControls();
syncLabels();
generateGalaxy();
animate();
