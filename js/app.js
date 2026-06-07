/* =====================================================================
   Felicitación de cumpleaños sorpresa — Lógica (app.js)
   Secciones:
     1. CONFIGURACIÓN editable
     2. Aplicar configuración
     3. Confeti
     4. Música (Web Audio, sin archivos)
     5. Abrir la sorpresa (gate)
     6. Pastel: soplar las velitas
     7. Sobre que se abre
     8. Rasca y revela
     9. Reveal al hacer scroll
    10. Decoraciones flotantes
   ===================================================================== */

/* ===================== 1. CONFIGURACIÓN (edita aquí) ===================== */
const CONFIG = {
  nombre: "Rebeca",
  edad: 26,

  // mensaje secreto del "rasca y revela"
  secreto: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor."
};

/* ===================== 2. APLICAR CONFIGURACIÓN ===================== */
document.getElementById('nombreHero').textContent = CONFIG.nombre;
document.getElementById('edadHero').textContent = CONFIG.edad;
document.title = "Para " + CONFIG.nombre + " 🐾";

/* ===================== 3. CONFETI ===================== */
const COLORS = ['#FFC83D','#FFB300','#FF9DBA','#FFE39A','#FFD7E4','#ffffff'];

function boom(opts = {}){
  if(typeof confetti !== 'function') return;
  confetti(Object.assign({particleCount:120,spread:80,origin:{y:.6},colors:COLORS,scalar:1.1}, opts));
}

function celebrar(){
  boom({particleCount:160,spread:100,startVelocity:55});
  setTimeout(()=>boom({particleCount:90,angle:60,spread:70,origin:{x:0}}),200);
  setTimeout(()=>boom({particleCount:90,angle:120,spread:70,origin:{x:1}}),350);
  const end = Date.now() + 1500;
  (function frame(){
    confetti({particleCount:3,startVelocity:0,ticks:200,gravity:.6,origin:{x:Math.random(),y:-.05},colors:COLORS,scalar:1.2,shapes:['circle']});
    if(Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ===================== 4. MÚSICA (Web Audio) ===================== */
let audioCtx = null, musicTimer = null, musicOn = false, activeNodes = [];
const NOTES = {G3:196,A3:220,B3:246.94,C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,F3:174.61};
const MELODY = [
  ['G3',.5],['G3',.5],['A3',1],['G3',1],['C4',1],['B3',2],
  ['G3',.5],['G3',.5],['A3',1],['G3',1],['D4',1],['C4',2],
  ['G3',.5],['G3',.5],['G4',1],['E4',1],['C4',1],['B3',1],['A3',2],
  ['F4',.5],['F4',.5],['E4',1],['C4',1],['D4',1],['C4',2]
];

function playMelody(){
  activeNodes = [];                       // solo las notas de ESTA pasada
  const beat = .42; let t = audioCtx.currentTime + .1;
  MELODY.forEach(([n,d]) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = NOTES[n];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.18, t + .04);
    g.gain.exponentialRampToValueAtTime(.001, t + d*beat*.95);
    o.connect(g).connect(audioCtx.destination);
    o.start(t); o.stop(t + d*beat);
    activeNodes.push({o,g});
    t += d*beat;
  });
  const total = (t - audioCtx.currentTime) * 1000;
  musicTimer = setTimeout(()=>{ if(musicOn) playMelody(); }, total + 400);
}

function startMusic(){
  if(musicOn) return;                     // evita iniciar dos veces (no se superpone)
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  musicOn = true; document.getElementById('music-btn').textContent = '🎵';
  playMelody();
}

function stopMusic(){
  musicOn = false; clearTimeout(musicTimer);
  activeNodes.forEach(({o,g}) => {        // corta de verdad las notas programadas
    try{ g.gain.cancelScheduledValues(audioCtx.currentTime); }catch(e){}
    try{ g.gain.setValueAtTime(0, audioCtx.currentTime); }catch(e){}
    try{ o.stop(); }catch(e){}
    try{ o.disconnect(); }catch(e){}
  });
  activeNodes = [];
  document.getElementById('music-btn').textContent = '🔇';
}

document.getElementById('music-btn').addEventListener('click', ()=> musicOn ? stopMusic() : startMusic());

/* ===================== 5. ABRIR LA SORPRESA (gate) ===================== */
let abierto = false;

function abrirSorpresa(){
  if(abierto) return; abierto = true;
  document.getElementById('gate').classList.add('hidden');
  document.body.style.overflow = '';
  startMusic();
  celebrar();
  setTimeout(()=>boom({particleCount:120,spread:120}), 700);
}

document.getElementById('openBtn').addEventListener('click', abrirSorpresa);
document.body.style.overflow = 'hidden';  // bloquea el scroll hasta abrir

/* ===================== 6. PASTEL: SOPLAR LAS VELITAS ===================== */
const DESEOS = [
  "Lorem ipsum dolor sit amet",
  "Consectetur adipiscing elit",
  "Sed do eiusmod tempor",
  "Ut labore et dolore magna"
];
let soplado = false;

function soplar(){
  if(soplado) return; soplado = true;
  document.getElementById('flame').classList.add('out');
  const w = document.getElementById('wishText');
  w.textContent = DESEOS[Math.floor(Math.random()*DESEOS.length)];
  w.classList.add('show');
  boom({particleCount:140,spread:100,origin:{y:.5}});
  document.getElementById('blowBtn').textContent = '¡Pedido! 🎉';
}

document.getElementById('blowBtn').addEventListener('click', soplar);
document.getElementById('cake').addEventListener('click', soplar);

/* ===================== 7. SOBRE QUE SE ABRE ===================== */
const envelope = document.getElementById('envelope');
const letter   = document.getElementById('letter');
const envHint  = document.getElementById('envHint');

envelope.addEventListener('click', () => {
  if(envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  envHint.style.display = 'none';
  setTimeout(()=> letter.classList.add('open'), 350);
  boom({particleCount:60, spread:70, scalar:.9});
});

/* ===================== 8. RASCA Y REVELA ===================== */
const scratch = document.getElementById('scratch');
const canvas  = document.getElementById('scratchCanvas');
document.getElementById('scratchPrize').textContent = CONFIG.secreto;

let sctx = null, scratching = false, revealed = false, moveCount = 0;

function initScratch(){
  const r = scratch.getBoundingClientRect();
  canvas.width = r.width; canvas.height = r.height;
  sctx = canvas.getContext('2d');
  const g = sctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, '#FFD86B'); g.addColorStop(1, '#FFB300');
  sctx.fillStyle = g; sctx.fillRect(0, 0, canvas.width, canvas.height);
  sctx.fillStyle = 'rgba(122,90,16,.85)';
  sctx.font = '600 20px Poppins, sans-serif';
  sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
  sctx.fillText('✨ Rasca aquí ✨', canvas.width/2, canvas.height/2);
  sctx.globalCompositeOperation = 'destination-out';   // a partir de ahora, borra
}

function posFrom(e){
  const r = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return {
    x: (t.clientX - r.left) * (canvas.width / r.width),
    y: (t.clientY - r.top)  * (canvas.height / r.height)
  };
}

function scratchAt(e){
  if(!scratching || revealed || !sctx) return;
  const p = posFrom(e);
  sctx.beginPath();
  sctx.arc(p.x, p.y, 22, 0, Math.PI*2);
  sctx.fill();
  if(++moveCount % 10 === 0) checkReveal();   // muestreo cada 10 movimientos
}

function checkReveal(){
  const data = sctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let clear = 0, total = 0;
  for(let i = 3; i < data.length; i += 160){   // muestreo de píxeles
    total++; if(data[i] === 0) clear++;
  }
  if(clear / total > 0.45) revealCard();
}

function revealCard(){
  if(revealed) return; revealed = true;
  canvas.style.transition = 'opacity .6s';
  canvas.style.opacity = '0';
  setTimeout(()=> canvas.style.display = 'none', 600);
  celebrar();
}

canvas.addEventListener('mousedown', e => { scratching = true; scratchAt(e); });
window.addEventListener('mouseup', () => scratching = false);
canvas.addEventListener('mousemove', scratchAt);
canvas.addEventListener('touchstart', e => { scratching = true; scratchAt(e); }, {passive:false});
canvas.addEventListener('touchmove',  e => { e.preventDefault(); scratchAt(e); }, {passive:false});
canvas.addEventListener('touchend', () => scratching = false);

// inicializa el canvas cuando la tarjeta entra en pantalla (para medir bien su tamaño)
const scratchObs = new IntersectionObserver((entries) => {
  entries.forEach(x => { if(x.isIntersecting && !sctx){ initScratch(); scratchObs.disconnect(); } });
}, {threshold:.25});
scratchObs.observe(scratch);

/* ===================== 9. REVEAL AL HACER SCROLL ===================== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ===================== 10. DECORACIONES FLOTANTES ===================== */
const EMO = ['🎈','🧡','🐾','🌼','⭐','🎈','💛'];

function lanzarFloaty(){
  const s = document.createElement('div');
  s.className = 'floaty';
  s.textContent = EMO[Math.floor(Math.random()*EMO.length)];
  s.style.left = Math.random()*100 + 'vw';
  const dur = 7 + Math.random()*6;
  s.style.animationDuration = dur + 's';
  s.style.fontSize = (1.2 + Math.random()*1.4) + 'rem';
  document.getElementById('fiesta').appendChild(s);
  setTimeout(()=> s.remove(), dur*1000);
}

setInterval(()=>{ if(abierto) lanzarFloaty(); }, 900);
