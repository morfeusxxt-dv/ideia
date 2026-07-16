/* ==========================================================================
   STATE & CORE CONFIGURATION
   ========================================================================== */
const STATE = {
  currentStage: 0,
  starsCreated: false,
  introStarted: false,
  flowersPlanted: 0,
  maxFlowers: 30,
  traitsClicked: 0,
  totalTraits: 7,
  easterEggActive: false,
  typedKeySequence: [],
  targetName: "Jaci"
};

// Qualities for Stage 4 Constellation
const TRAITS = [
  { label: "Inteligente", x: 30, y: 45 },
  { label: "Gentil", x: 42, y: 30 },
  { label: "Autêntica", x: 58, y: 30 },
  { label: "Engraçada", x: 70, y: 45 },
  { label: "Linda", x: 62, y: 65 },
  { label: "Carinhosa", x: 50, y: 80 },
  { label: "Especial", x: 38, y: 65 }
];

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initCosmicCanvas();
  initIntroSequence();
  initAudioController();
  initStageTransitions();
  initLetterInteraction();
  initGardenStage();
  initConstellationStage();
  initEasterEggs();
});

/* ==========================================================================
   CUSTOM CURSOR
   ========================================================================== */
function initCursor() {
  const cursor = document.getElementById("customCursor");
  const glow = document.getElementById("customCursorGlow");
  if (!cursor || !glow) return;

  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  let glowX = -100, glowY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tick() {
    // Smooth interpolation (lerp)
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;

    requestAnimationFrame(tick);
  }
  tick();

  // Shrink/expand effects on clickable elements
  const clickables = document.querySelectorAll("button, input, a, .star-node, .envelope-wrapper");
  clickables.forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
      cursor.style.backgroundColor = "var(--color-accent-gold)";
      glow.style.transform = "translate(-50%, -50%) scale(1.2)";
      glow.style.borderColor = "var(--color-accent-gold)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursor.style.backgroundColor = "#fff";
      glow.style.transform = "translate(-50%, -50%) scale(1)";
      glow.style.borderColor = "rgba(255, 255, 255, 0.2)";
    });
  });
}

/* ==========================================================================
   COSMIC CANVAS BACKGROUND
   ========================================================================== */
let cosmicCanvas, ctx;
let stars = [];
let shootingStars = [];
let spaceParticles = [];
let moonX, moonY, moonRadius = 60, moonTargetRadius = 60;
let moonGlow = 30, moonTargetGlow = 30;
let parallaxX = 0, parallaxY = 0;
let targetParallaxX = 0, targetParallaxY = 0;
let spaceZoomFactor = 1;
let targetSpaceZoomFactor = 1;
let time = 0;
let auroraAlpha = 0.08;

function initCosmicCanvas() {
  cosmicCanvas = document.getElementById("cosmicCanvas");
  ctx = cosmicCanvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  moonX = cosmicCanvas.width * 0.8;
  moonY = cosmicCanvas.height * 0.25;

  // Initialize stars structure (initially invisible opacity)
  for (let i = 0; i < 500; i++) {
    stars.push({
      x: Math.random() * cosmicCanvas.width,
      y: Math.random() * cosmicCanvas.height,
      size: Math.random() * 2.8 + 1.2,
      opacity: 0,
      targetOpacity: Math.random() * 0.85 + 0.25,
      flickerSpeed: Math.random() * 0.025 + 0.005,
      color: Math.random() > 0.8 ? "var(--color-accent-gold)" : (Math.random() > 0.8 ? "#93c5fd" : "#ffffff")
    });
  }

  // Handle gentle mouse movement parallax
  window.addEventListener("mousemove", (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    targetParallaxX = normX * 40;
    targetParallaxY = normY * 40;
  });

  // Loop
  function animate() {
    time += 0.002;
    
    // Smooth parallax lerp
    parallaxX += (targetParallaxX - parallaxX) * 0.05;
    parallaxY += (targetParallaxY - parallaxY) * 0.05;

    // Smooth zoom factor lerp
    spaceZoomFactor += (targetSpaceZoomFactor - spaceZoomFactor) * 0.05;

    // Smooth moon radius and glow changes
    moonRadius += (moonTargetRadius - moonRadius) * 0.05;
    moonGlow += (moonTargetGlow - moonGlow) * 0.05;

    ctx.fillStyle = STATE.easterEggActive ? "#0d0214" : "#020208";
    ctx.fillRect(0, 0, cosmicCanvas.width, cosmicCanvas.height);

    // Draw cosmic nebulae / aurora effect
    drawNebulae();

    // Draw stars
    stars.forEach(star => {
      // Twinkle opacity calculation
      let osc = Math.sin(time * 500 * star.flickerSpeed) * 0.2;
      let alpha = star.opacity + osc;
      if (alpha < 0) alpha = 0;
      if (alpha > 1) alpha = 1;

      // Apply zoom & parallax logic
      let dx = (star.x - cosmicCanvas.width / 2) * spaceZoomFactor + cosmicCanvas.width / 2 - parallaxX * (star.size * 0.45);
      let dy = (star.y - cosmicCanvas.height / 2) * spaceZoomFactor + cosmicCanvas.height / 2 - parallaxY * (star.size * 0.45);

      // Wrap-around bounds checking
      if (dx < 0) dx += cosmicCanvas.width;
      if (dx > cosmicCanvas.width) dx -= cosmicCanvas.width;
      if (dy < 0) dy += cosmicCanvas.height;
      if (dy > cosmicCanvas.height) dy -= cosmicCanvas.height;

      ctx.save();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(dx, dy, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Additional glow for larger stars
      if (star.size > 2.0) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = star.color;
        ctx.beginPath();
        ctx.arc(dx, dy, star.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Draw moon
    drawMoon();

    // Handle shooting stars
    handleShootingStars();

    // Draw space/typing particles
    handleSpaceParticles();

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  cosmicCanvas.width = window.innerWidth;
  cosmicCanvas.height = window.innerHeight;
  // Recenter moon on resize
  moonX = cosmicCanvas.width * 0.8;
  moonY = cosmicCanvas.height * 0.25;
}

function drawNebulae() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Gradient 1 (Indigo/Blue gas)
  const grad1 = ctx.createRadialGradient(
    cosmicCanvas.width * 0.3 - parallaxX * 0.2, 
    cosmicCanvas.height * 0.4 - parallaxY * 0.2, 
    50, 
    cosmicCanvas.width * 0.3, 
    cosmicCanvas.height * 0.4, 
    cosmicCanvas.width * 0.5
  );
  if (STATE.easterEggActive) {
    grad1.addColorStop(0, "rgba(224, 86, 253, 0.12)");
    grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
  } else {
    grad1.addColorStop(0, "rgba(13, 12, 43, 0.25)");
    grad1.addColorStop(0.5, "rgba(5, 5, 26, 0.15)");
    grad1.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, cosmicCanvas.width, cosmicCanvas.height);

  // Gradient 2 (Aurora glow/nebula)
  const grad2 = ctx.createRadialGradient(
    cosmicCanvas.width * 0.7 - parallaxX * 0.1, 
    cosmicCanvas.height * 0.7 - parallaxY * 0.1, 
    100, 
    cosmicCanvas.width * 0.7, 
    cosmicCanvas.height * 0.7, 
    cosmicCanvas.width * 0.6
  );
  if (STATE.easterEggActive) {
    grad2.addColorStop(0, "rgba(253, 121, 168, 0.08)");
    grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
  } else {
    grad2.addColorStop(0, "rgba(33, 140, 116, 0.04)"); // subtle aurora touch
    grad2.addColorStop(0.5, "rgba(10, 5, 30, 0.1)");
    grad2.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, cosmicCanvas.width, cosmicCanvas.height);

  ctx.restore();
}

function drawMoon() {
  ctx.save();

  // Dynamic positioning with parallax
  const mx = moonX - parallaxX * 0.3;
  const my = moonY - parallaxY * 0.3;

  // Render Moon Aura
  ctx.shadowBlur = moonGlow;
  ctx.shadowColor = STATE.easterEggActive ? "rgba(224, 86, 253, 0.4)" : "rgba(229, 193, 88, 0.35)";
  ctx.globalAlpha = 0.85;

  const grad = ctx.createLinearGradient(mx - moonRadius, my - moonRadius, mx + moonRadius, my + moonRadius);
  if (STATE.easterEggActive) {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.6, "#f8c291");
    grad.addColorStop(1, "#e58e26");
  } else {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.5, "#eae6df");
    grad.addColorStop(1, "#b5ad9e");
  }

  // Draw main moon circular body (crescent clip overlay)
  ctx.beginPath();
  ctx.arc(mx, my, moonRadius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw realistic craters before destination-out composite
  ctx.fillStyle = STATE.easterEggActive ? "rgba(229, 80, 50, 0.1)" : "rgba(0, 0, 0, 0.08)";
  const craterSeeds = [
    { cx: -0.2, cy: -0.3, r: 0.16 },
    { cx: 0.25, cy: 0.25, r: 0.12 },
    { cx: -0.05, cy: 0.35, r: 0.14 },
    { cx: 0.3, cy: -0.15, r: 0.09 },
    { cx: -0.1, cy: 0.05, r: 0.2 }
  ];
  craterSeeds.forEach(c => {
    ctx.beginPath();
    ctx.arc(mx + moonRadius * c.cx, my + moonRadius * c.cy, moonRadius * c.r, 0, Math.PI * 2);
    ctx.fill();
    // Inner shadow details
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Subtracting shadow overlap to make it a crescent moon shape
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(mx - moonRadius * 0.65, my - moonRadius * 0.2, moonRadius * 0.95, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function triggerShootingStar() {
  shootingStars.push({
    x: Math.random() * cosmicCanvas.width,
    y: Math.random() * (cosmicCanvas.height * 0.5),
    dx: Math.random() * 8 + 6,
    dy: Math.random() * 3 + 2,
    length: Math.random() * 80 + 50,
    opacity: 1,
    fadeSpeed: Math.random() * 0.02 + 0.01
  });
}

function handleShootingStars() {
  // Occasionally trigger one
  if (Math.random() < 0.008) {
    triggerShootingStar();
  }

  ctx.save();
  shootingStars.forEach((star, index) => {
    ctx.globalAlpha = star.opacity;
    ctx.strokeStyle = STATE.easterEggActive ? "#fd79a8" : "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.dx * (star.length / 10), star.y - star.dy * (star.length / 10));
    ctx.stroke();

    // Update positions
    star.x += star.dx;
    star.y += star.dy;
    star.opacity -= star.fadeSpeed;

    if (star.opacity <= 0) {
      shootingStars.splice(index, 1);
    }
  });
  ctx.restore();
}

function spawnParticles(x, y, count = 20, color = "#fff") {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1.5;
    spaceParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2 + 1,
      color: color,
      opacity: 1,
      decay: Math.random() * 0.025 + 0.015
    });
  }
}

function handleSpaceParticles() {
  ctx.save();
  spaceParticles.forEach((p, idx) => {
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02; // soft gravity
    p.opacity -= p.decay;

    if (p.opacity <= 0) {
      spaceParticles.splice(idx, 1);
    }
  });
  ctx.restore();
}

/* ==========================================================================
   INTRO SEQUENCE (STAGE 0)
   ========================================================================== */
function initIntroSequence() {
  const introP1 = document.getElementById("intro-p1");
  const introP2 = document.getElementById("intro-p2");
  const startBtn = document.getElementById("btn-start");

  // Sequential birth of stars
  let starCounter = 0;
  function fadeStarsIn() {
    if (starCounter >= stars.length) return;
    // Fade in 3 stars at a time
    for (let k = 0; k < 3; k++) {
      if (starCounter < stars.length) {
        gsap.to(stars[starCounter], {
          opacity: stars[starCounter].targetOpacity,
          duration: Math.random() * 3 + 2
        });
        starCounter++;
      }
    }
    setTimeout(fadeStarsIn, 15);
  }
  
  // Begin sequence
  setTimeout(() => {
    fadeStarsIn();
    
    // Intro paragraphs animations
    const tl = gsap.timeline();
    tl.to(introP1, { opacity: 1, duration: 2, ease: "power2.out" })
      .to(introP1, { opacity: 0, duration: 1.5, ease: "power2.inOut", delay: 2.5 })
      .to(introP2, { opacity: 1, duration: 2, ease: "power2.out" })
      .to(introP2, { opacity: 0, duration: 1.5, ease: "power2.inOut", delay: 2.5 })
      .call(() => {
        // Show start button
        startBtn.classList.remove("hidden");
        gsap.to(startBtn, { opacity: 1, duration: 1.5 });
      });
  }, 1000);
}

/* ==========================================================================
   STAGE TRANSITIONS
   ========================================================================== */
function transitionToStage(stageNum) {
  const currentStageEl = document.querySelector(`.stage.active`);
  const targetStageEl = document.getElementById(`stage-${getStageId(stageNum)}`);

  if (!targetStageEl) return;

  // Deactivate current stage
  if (currentStageEl) {
    currentStageEl.classList.remove("active");
  }

  // Handle stage specific events / animations during transition
  if (stageNum === 1) {
    // Stage 1 Zoom Out / Warp flight effect
    targetSpaceZoomFactor = 3.5;
    setTimeout(() => {
      targetSpaceZoomFactor = 1.0;
    }, 1500);

    setTimeout(() => {
      targetStageEl.classList.add("active");
      triggerRevealSequence();
    }, 1200);
  } else if (stageNum === 2) {
    // Normal transition to letter
    setTimeout(() => {
      targetStageEl.classList.add("active");
    }, 600);
  } else if (stageNum === 3) {
    // Transition to Garden
    setTimeout(() => {
      targetStageEl.classList.add("active");
      resizeGardenCanvas();
      startGardenLoop();
    }, 600);
  } else if (stageNum === 4) {
    // Transition to Constellation
    setTimeout(() => {
      targetStageEl.classList.add("active");
      populateConstellationStars();
    }, 600);
  } else if (stageNum === 5) {
    // Transition to Final stage
    moonTargetRadius = window.innerWidth < 768 ? 120 : 180;
    moonTargetGlow = 60;
    setTimeout(() => {
      targetStageEl.classList.add("active");
      triggerFinalSceneSequence();
    }, 600);
  } else {
    targetStageEl.classList.add("active");
  }

  STATE.currentStage = stageNum;
}

function getStageId(num) {
  switch (num) {
    case 0: return "intro";
    case 1: return "reveal";
    case 2: return "letter";
    case 3: return "garden";
    case 4: return "constellation";
    case 5: return "final";
    default: return "intro";
  }
}

function initStageTransitions() {
  document.getElementById("btn-start").addEventListener("click", () => {
    transitionToStage(1);
  });
  document.getElementById("btn-to-letter").addEventListener("click", () => {
    transitionToStage(2);
  });
  document.getElementById("btn-to-garden").addEventListener("click", () => {
    transitionToStage(3);
  });
  document.getElementById("btn-to-constellation").addEventListener("click", () => {
    transitionToStage(4);
  });
  document.getElementById("btn-to-final").addEventListener("click", () => {
    transitionToStage(5);
  });
}

/* ==========================================================================
   STAGE 1: REVEAL SEQUENCE
   ========================================================================== */
function triggerRevealSequence() {
  const revealNameEl = document.getElementById("reveal-name");
  const revealSubtitle = document.getElementById("reveal-subtitle");
  const toLetterBtn = document.getElementById("btn-to-letter");
  const nameText = STATE.targetName;
  
  let currentLetterIdx = 0;
  revealNameEl.innerHTML = "";

  function typeLetter() {
    if (currentLetterIdx < nameText.length) {
      const span = document.createElement("span");
      span.innerText = nameText[currentLetterIdx];
      span.style.opacity = "0";
      revealNameEl.appendChild(span);

      // Typing animation with GSAP + particle effects
      gsap.to(span, {
        opacity: 1,
        duration: 0.5,
        onStart: () => {
          // Calculate screen position of letter to emit sparks
          const rect = revealNameEl.getBoundingClientRect();
          const charWidth = rect.width / nameText.length;
          const letterX = rect.left + (currentLetterIdx * charWidth) + charWidth / 2;
          const letterY = rect.top + rect.height / 2;
          spawnParticles(letterX, letterY, 15, "var(--color-accent-gold)");
        }
      });

      currentLetterIdx++;
      setTimeout(typeLetter, 450);
    } else {
      // Subtitle & button reveal
      gsap.to(revealSubtitle, {
        opacity: 0.8,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.5
      });
      setTimeout(() => {
        toLetterBtn.classList.remove("hidden");
        gsap.to(toLetterBtn, { opacity: 1, y: 0, duration: 1 });
      }, 1200);
    }
  }

  setTimeout(typeLetter, 800);
}

/* ==========================================================================
   STAGE 2: LETTER INTERACTION
   ========================================================================== */
function initLetterInteraction() {
  const wrapper = document.getElementById("envelopeWrapper");
  const letterTip = document.getElementById("envelope-tip");
  const toGardenBtn = document.getElementById("btn-to-garden");

  wrapper.addEventListener("click", () => {
    if (!wrapper.classList.contains("open")) {
      wrapper.classList.add("open");
      letterTip.style.opacity = "0";
      
      // Reveal garden button after reading time delay
      setTimeout(() => {
        toGardenBtn.classList.remove("hidden");
        gsap.to(toGardenBtn, { opacity: 1, duration: 1 });
      }, 3500);
    }
  });
}

/* ==========================================================================
   STAGE 3: INTERACTIVE GARDEN
   ========================================================================== */
let gardenCanvas, gardenCtx;
let flowers = [];
let isGardenRunning = false;

function initGardenStage() {
  gardenCanvas = document.getElementById("gardenCanvas");
  gardenCtx = gardenCanvas.getContext("2d");

  // Handle clicking canvas to plant a flower
  gardenCanvas.addEventListener("click", (e) => {
    if (STATE.flowersPlanted >= STATE.maxFlowers) return;

    const rect = gardenCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    plantFlower(x, y);
  });
}

function resizeGardenCanvas() {
  if (!gardenCanvas) return;
  gardenCanvas.width = window.innerWidth;
  gardenCanvas.height = window.innerHeight;
}

function plantFlower(x, y) {
  STATE.flowersPlanted++;
  document.getElementById("flower-count").innerText = STATE.flowersPlanted;

  // Particle burst on planting
  spawnParticles(x, y, 12, "var(--color-accent-rose)");

  // Add flower object
  flowers.push({
    x: x,
    targetHeight: gardenCanvas.height * (0.35 + Math.random() * 0.4),
    currentHeight: 0,
    width: Math.random() * 2 + 2,
    headColor: getRandomFlowerColor(),
    bloomProgress: 0,
    bloomSize: Math.random() * 12 + 15,
    phase: Math.random() * Math.PI * 2,
    swayAmplitude: Math.random() * 12 + 6,
    speed: 0.04 + Math.random() * 0.02,
    type: Math.floor(Math.random() * 3) // 3 distinct types
  });

  // Check if target reached
  if (STATE.flowersPlanted === STATE.maxFlowers) {
    const gardenMsg = document.getElementById("garden-msg");
    gardenMsg.classList.remove("hidden");
  }
}

function getRandomFlowerColor() {
  const colors = [
    "rgba(252, 165, 165, 0.95)", // soft pink
    "rgba(253, 164, 186, 0.95)", // rose
    "rgba(253, 203, 110, 0.95)", // soft yellow
    "rgba(129, 236, 236, 0.95)", // cyan
    "rgba(162, 155, 254, 0.95)"  // lavender
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function startGardenLoop() {
  isGardenRunning = true;
  let gardenTime = 0;

  function renderGarden() {
    if (!isGardenRunning) return;
    gardenTime += 0.015;

    gardenCtx.clearRect(0, 0, gardenCanvas.width, gardenCanvas.height);

    flowers.forEach(f => {
      // Growth simulation
      if (f.currentHeight < f.targetHeight) {
        f.currentHeight += (f.targetHeight - f.currentHeight) * f.speed;
      } else if (f.bloomProgress < 1) {
        f.bloomProgress += 0.03;
      }

      // Wind sway calculations (sine wave propagation)
      const sway = Math.sin(gardenTime + f.phase) * f.swayAmplitude * (f.currentHeight / f.targetHeight);
      const topX = f.x + sway;
      const topY = gardenCanvas.height - f.currentHeight;

      // Draw Stem
      gardenCtx.beginPath();
      gardenCtx.moveTo(f.x, gardenCanvas.height);
      // Quadratic curve for elegant bowing
      gardenCtx.quadraticCurveTo(
        f.x + sway * 0.5, 
        gardenCanvas.height - f.currentHeight * 0.5, 
        topX, 
        topY
      );
      gardenCtx.strokeStyle = "rgba(46, 204, 113, 0.4)";
      gardenCtx.lineWidth = f.width;
      gardenCtx.stroke();

      // Draw Leaves
      if (f.currentHeight > f.targetHeight * 0.5) {
        gardenCtx.fillStyle = "rgba(46, 204, 113, 0.35)";
        gardenCtx.beginPath();
        gardenCtx.ellipse(f.x + sway * 0.4 - 8, gardenCanvas.height - f.currentHeight * 0.4, 6, 3, Math.PI / 4, 0, Math.PI * 2);
        gardenCtx.ellipse(f.x + sway * 0.4 + 8, gardenCanvas.height - f.currentHeight * 0.4, 6, 3, -Math.PI / 4, 0, Math.PI * 2);
        gardenCtx.fill();
      }

      // Draw Flower Head
      if (f.bloomProgress > 0) {
        const radius = f.bloomSize * f.bloomProgress;
        gardenCtx.save();
        gardenCtx.translate(topX, topY);

        // Draw petals
        gardenCtx.fillStyle = f.headColor;
        gardenCtx.shadowBlur = 15;
        gardenCtx.shadowColor = f.headColor;
        
        if (f.type === 0) {
          // Type 0: Daisy shape petals
          const petalsCount = 8;
          for (let i = 0; i < petalsCount; i++) {
            gardenCtx.rotate((Math.PI * 2) / petalsCount);
            gardenCtx.beginPath();
            gardenCtx.ellipse(radius * 0.55, 0, radius * 0.55, radius * 0.22, 0, 0, Math.PI * 2);
            gardenCtx.fill();
          }
          // Center gold seed
          gardenCtx.beginPath();
          gardenCtx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
          gardenCtx.fillStyle = "var(--color-accent-gold)";
          gardenCtx.shadowColor = "var(--color-accent-gold)";
          gardenCtx.fill();
        } else if (f.type === 1) {
          // Type 1: Rose/Lotus layered shape
          // Outer circles
          for (let i = 0; i < 6; i++) {
            gardenCtx.beginPath();
            gardenCtx.arc(Math.cos(i * Math.PI / 3) * radius * 0.35, Math.sin(i * Math.PI / 3) * radius * 0.35, radius * 0.45, 0, Math.PI * 2);
            gardenCtx.fill();
          }
          // Inner glow details
          gardenCtx.fillStyle = "#ffffff";
          gardenCtx.globalAlpha = 0.5;
          for (let i = 0; i < 5; i++) {
            gardenCtx.beginPath();
            gardenCtx.arc(Math.cos(i * Math.PI / 2.5) * radius * 0.18, Math.sin(i * Math.PI / 2.5) * radius * 0.18, radius * 0.3, 0, Math.PI * 2);
            gardenCtx.fill();
          }
          gardenCtx.globalAlpha = 1.0;
          gardenCtx.beginPath();
          gardenCtx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
          gardenCtx.fillStyle = "var(--color-accent-gold)";
          gardenCtx.fill();
        } else {
          // Type 2: Star Flower
          const points = 5;
          gardenCtx.beginPath();
          for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const r = i % 2 === 0 ? radius : radius * 0.45;
            gardenCtx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          gardenCtx.closePath();
          gardenCtx.fill();

          // center glow
          gardenCtx.beginPath();
          gardenCtx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
          gardenCtx.fillStyle = "#ffffff";
          gardenCtx.fill();
        }

        gardenCtx.restore();
      }
    });

    requestAnimationFrame(renderGarden);
  }
  renderGarden();
}

/* ==========================================================================
   STAGE 4: TRAITS CONSTELLATION
   ========================================================================== */
let activeLineIndexes = [];

function populateConstellationStars() {
  const container = document.getElementById("starsContainer");
  const svg = document.getElementById("constellationSvg");
  container.innerHTML = "";
  svg.innerHTML = "";

  activeLineIndexes = [];

  TRAITS.forEach((t, index) => {
    const star = document.createElement("div");
    star.className = "star-node";
    star.style.left = `${t.x}%`;
    star.style.top = `${t.y}%`;
    star.dataset.index = index;

    star.innerHTML = `
      <div class="star-point"></div>
      <span class="star-label">${t.label}</span>
    `;

    star.addEventListener("click", () => handleStarClick(star, index));
    container.appendChild(star);
  });
}

function handleStarClick(starEl, index) {
  if (starEl.classList.contains("active")) return;

  starEl.classList.add("active");
  STATE.traitsClicked++;
  document.getElementById("traits-count").innerText = STATE.traitsClicked;

  // Sound/Vibration simulation (sparks)
  const rect = starEl.getBoundingClientRect();
  spawnParticles(rect.left + 16, rect.top + 16, 12, "var(--color-accent-gold)");

  // Connect active stars visually in order
  const activeNodes = document.querySelectorAll(".star-node.active");
  if (activeNodes.length > 1) {
    drawConstellationLine();
  }

  // Check completion
  if (STATE.traitsClicked === STATE.totalTraits) {
    // Form constellation lines to heart layout
    drawFullHeartConstellation();
    
    setTimeout(() => {
      document.getElementById("constellation-msg").classList.remove("hidden");
    }, 800);
  }
}

function drawConstellationLine() {
  const svg = document.getElementById("constellationSvg");
  svg.innerHTML = ""; // Clear and redraw all paths

  const activeNodes = Array.from(document.querySelectorAll(".star-node.active"))
    .sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));

  for (let i = 0; i < activeNodes.length - 1; i++) {
    const nodeA = activeNodes[i];
    const nodeB = activeNodes[i + 1];

    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", rectA.left + rectA.width / 2);
    line.setAttribute("y1", rectA.top + rectA.height / 2);
    line.setAttribute("x2", rectB.left + rectB.width / 2);
    line.setAttribute("y2", rectB.top + rectB.height / 2);
    line.classList.add("active");

    svg.appendChild(line);
  }
}

function drawFullHeartConstellation() {
  const svg = document.getElementById("constellationSvg");
  svg.innerHTML = ""; // reset

  const nodes = Array.from(document.querySelectorAll(".star-node.active"));
  
  // Custom connecting path that encloses a heart outline
  const order = [0, 1, 2, 3, 4, 5, 6, 0];
  
  for (let i = 0; i < order.length - 1; i++) {
    const aIdx = order[i];
    const bIdx = order[i+1];
    
    const nodeA = nodes.find(n => parseInt(n.dataset.index) === aIdx);
    const nodeB = nodes.find(n => parseInt(n.dataset.index) === bIdx);

    if (nodeA && nodeB) {
      const rectA = nodeA.getBoundingClientRect();
      const rectB = nodeB.getBoundingClientRect();

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", rectA.left + rectA.width / 2);
      line.setAttribute("y1", rectA.top + rectA.height / 2);
      line.setAttribute("x2", rectB.left + rectB.width / 2);
      line.setAttribute("y2", rectB.top + rectB.height / 2);
      line.classList.add("active");

      svg.appendChild(line);
    }
  }
}

/* ==========================================================================
   STAGE 5: FINAL SEQUENCE
   ========================================================================== */
function triggerFinalSceneSequence() {
  const finalParas = document.querySelectorAll(".final-p");
  const finalBtn = document.getElementById("btn-final-action");

  // Animate lines sequentially
  const tl = gsap.timeline();
  finalParas.forEach((p, idx) => {
    tl.fromTo(p, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1 }, `+=0.2`);
  });

  tl.fromTo(finalBtn, { opacity: 0 }, { opacity: 1, duration: 1 }, "+=0.5");

  finalBtn.addEventListener("click", () => {
    // Fade out letter card block
    gsap.to(document.querySelector(".final-content"), {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      onComplete: () => {
        document.querySelector(".final-content").style.display = "none";
        
        // Intensify moon glow & size
        moonTargetRadius = Math.max(window.innerWidth, window.innerHeight) * 0.7;
        moonTargetGlow = 150;

        // Trigger discrete canvas fireworks/shooting stars explosion
        for (let i = 0; i < 6; i++) {
          setTimeout(triggerShootingStar, i * 200);
        }

        // Show Epilogue
        const epilogue = document.getElementById("final-epilogue");
        epilogue.classList.remove("hidden");
        
        gsap.fromTo(epilogue, 
          { opacity: 0, scale: 0.9 }, 
          { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
        );
      }
    });
  });
}

/* ==========================================================================
   AMBIENT AUDIO CONTROLLER
   ========================================================================== */
function initAudioController() {
  const audio = document.getElementById("bgMusic");
  const widget = document.getElementById("audioWidget");
  const toggleBtn = document.getElementById("audioToggleBtn");
  const slider = document.getElementById("volumeSlider");
  const btnText = toggleBtn.querySelector(".btn-text");
  const btnIcon = toggleBtn.querySelector("i");

  // Adjust volume init
  audio.volume = slider.value;

  function playAudio() {
    if (audio.paused) {
      audio.play().then(() => {
        btnText.innerText = "Música Ativa";
        btnIcon.className = "fas fa-volume-up";
        // Clean up first interaction listeners
        document.removeEventListener("click", playAudio);
        document.removeEventListener("keydown", playAudio);
      }).catch(err => {
        console.warn("Autoplay blocked by browser. Audio will trigger on first interaction.");
      });
    }
  }

  // Attempt autoplay immediately
  playAudio();

  // Fallback: play on first user interaction anywhere on the document
  document.addEventListener("click", playAudio);
  document.addEventListener("keydown", playAudio);

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent triggering the document interaction listener
    if (audio.paused) {
      audio.play().then(() => {
        btnText.innerText = "Música Ativa";
        btnIcon.className = "fas fa-volume-up";
      }).catch(err => {
        btnText.innerText = "Música Ativa";
        btnIcon.className = "fas fa-volume-up";
      });
    } else {
      audio.pause();
      btnText.innerText = "Ativar música";
      btnIcon.className = "fas fa-music";
    }
  });

  slider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
  });
}

/* ==========================================================================
   EASTER EGGS
   ========================================================================== */
function initEasterEggs() {
  // Console Message
  console.log(
    "%cOi, Jaci.\n%cSe você chegou até aqui...\ndescobriu um pequeno segredo.\n\nAssim como um bom código,\nalgumas pessoas também são difíceis de esquecer. \n❤️",
    "color: #e5c158; font-size: 20px; font-weight: bold;",
    "color: #a1a1a6; font-size: 14px;"
  );

  // Keyboard typing event
  window.addEventListener("keydown", (e) => {
    STATE.typedKeySequence.push(e.key.toLowerCase());
    if (STATE.typedKeySequence.length > 4) {
      STATE.typedKeySequence.shift();
    }

    const keyword = STATE.typedKeySequence.join("");
    if (keyword === "jaci") {
      triggerSecretEasterEgg();
    }
  });
}

function triggerSecretEasterEgg() {
  if (STATE.easterEggActive) return;
  STATE.easterEggActive = true;

  // Custom visual overlay notification
  const notify = document.createElement("div");
  notify.className = "glass";
  notify.style.position = "fixed";
  notify.style.bottom = "24px";
  notify.style.left = "24px";
  notify.style.padding = "12px 20px";
  notify.style.color = "var(--color-accent-gold)";
  notify.style.fontSize = "13px";
  notify.style.zIndex = "999";
  notify.innerText = "Você encontrou o segredo escondido.";
  document.body.appendChild(notify);
  
  gsap.fromTo(notify, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  setTimeout(() => {
    gsap.to(notify, { opacity: 0, y: -20, duration: 0.5, onComplete: () => notify.remove() });
  }, 4000);

  // Explode moon into gold particles
  const mx = moonX - parallaxX * 0.3;
  const my = moonY - parallaxY * 0.3;
  spawnParticles(mx, my, 80, "var(--color-accent-gold)");

  // Change Moon state temporarily
  moonTargetRadius = 15;
  setTimeout(() => {
    moonTargetRadius = 75;
  }, 1000);
}
