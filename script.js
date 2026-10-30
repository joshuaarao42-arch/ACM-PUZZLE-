// Puzzle settings
// Add a URL to open a page after the final puzzle.
const FINAL_PAGE_URL = ""; // Demo mode: stay on this page.

// Edit the puzzles here; cipher text is generated from the answer and shift.
const PUZZLES = [
  { name: "Launch window",   level: "Unclassified",     shift: 3,  plain: "JOIN THE MISSION",
    hint: "Julius Caesar liked small shifts. Try a shift of 3." },
  { name: "Orbital relay",   level: "Navigator", shift: 7,  plain: "CODE BEYOND THE STARS",
    hint: "The shift is the number of days in a week." },
  { name: "Deep signal",     level: "Pilot",     shift: 13, plain: "ORBIT THE UNKNOWN",
    hint: "This shift is exactly halfway around the 26-letter alphabet. Applying it twice returns the original." },
  { name: "Dark nebula",     level: "Commander", shift: 11, plain: "THE SIGNAL IS HIDDEN IN PLAIN SIGHT",
    hint: "No shift given. Spot the two-letter word: IS was encrypted as TD. How far did I move?" },
  { name: "Mission control", level: "Admiral",   shift: 9,  plain: "WELCOME TO THE ACM USTP CDO MISSION CONTROL",
    hint: "Count the letters in ACM, then multiply by 3." }
];

// Helpers
const $ = id => document.getElementById(id);
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Positive shifts encode; negative shifts decode.
function caesar(text, k) {
  return text.replace(/[A-Z]/g, c => A[(A.indexOf(c) + k % 26 + 26) % 26]);
}
// Ignore case, spaces, and punctuation.
const clean = s => s.toUpperCase().replace(/[^A-Z]/g, "");

// Text effects
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*<>/";

// Reveal the text from left to right.
function scramble(el, finalText, duration = 900) {
  cancelAnimationFrame(el._raf);
  if (reduceMotion) { el.textContent = finalText; return; }
  const start = performance.now();
  let last = 0;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    if (now - last > 45 || t === 1) {            
      last = now;
      let out = "";
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        out += (ch === " " || i / finalText.length < t) ? ch : NOISE[Math.floor(Math.random() * NOISE.length)];
      }
      el.textContent = out;
    }
    if (t < 1) el._raf = requestAnimationFrame(step);
  }
  el._raf = requestAnimationFrame(step);
}

// Play a brief glitch.
function glitch(el, ms = 480) {
  el.classList.remove("glitching");
  void el.offsetWidth;                            
  el.classList.add("glitching");
  setTimeout(() => el.classList.remove("glitching"), ms);
}

// Current puzzle state
let current = 0;
let solved = false;
let cleared = 0;
let wheelShift = 0;

// Terminal
const term = $("term");
const queue = [];
let typing = false;

function log(text, type = "") {
  queue.push({ text, type });
  if (!typing) runQueue();
}
async function runQueue() {
  typing = true;
  while (queue.length) {
    const { text, type } = queue.shift();
    const p = document.createElement("p");
    if (type) p.className = type;
    term.appendChild(p);
    for (const ch of text) {            
      p.textContent += ch;
      await new Promise(r => setTimeout(r, 14));
    }
    term.scrollTop = term.scrollHeight;
  }
  typing = false;
}

// Cipher wheel
const wheel = $("wheel");
function buildWheel() {
  const ns = "http://www.w3.org/2000/svg";
  let svg = `<defs>
               <linearGradient id="ufoHull" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#253e70"/><stop offset=".48" stop-color="#101c3a"/><stop offset="1" stop-color="#4cc3ff"/></linearGradient>
               <radialGradient id="ufoDome"><stop stop-color="#315e91" stop-opacity=".95"/><stop offset="1" stop-color="#10172f" stop-opacity=".98"/></radialGradient>
               <filter id="ufoGlow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
             </defs>
             <circle cx="120" cy="120" r="116" fill="#050a19" stroke="#4cc3ff" stroke-opacity=".5" stroke-width="2"/>
             <circle cx="120" cy="120" r="109" fill="url(#ufoHull)" stroke="#a6ddff" stroke-opacity=".45" stroke-width="1.5"/>
             <circle cx="120" cy="120" r="99" fill="none" stroke="#7da7e5" stroke-opacity=".42" stroke-width="2"/>
             <circle cx="120" cy="120" r="86" fill="rgba(3,8,28,.6)" stroke="#8b5cf6" stroke-opacity=".65" stroke-width="2"/>
             <circle cx="120" cy="120" r="58" fill="url(#ufoDome)" stroke="#a6ddff" stroke-opacity=".65" stroke-width="2"/>
             <g fill="#8cf5ff" filter="url(#ufoGlow)"><circle cx="120" cy="8" r="3"/><circle cx="199" cy="41" r="3"/><circle cx="232" cy="120" r="3"/><circle cx="199" cy="199" r="3"/><circle cx="120" cy="232" r="3"/><circle cx="41" cy="199" r="3"/><circle cx="8" cy="120" r="3"/><circle cx="41" cy="41" r="3"/></g>
             <text x="120" y="114" fill="#d8edff" style="font-size:7px">ENCRYPTED</text>
             <text x="120" y="127" fill="#8cf5ff" style="font-size:7px">DECODED</text>`;  let outer = "", inner = "";
  for (let i = 0; i < 26; i++) {
    const rot = i * (360 / 26);
    outer += `<text class="o-letter" x="120" y="20" transform="rotate(${rot} 120 120)">${A[i]}</text>`;
    inner += `<text class="i-letter" x="120" y="46" transform="rotate(${rot} 120 120)">${A[i]}</text>`;
  }
  wheel.innerHTML = svg + outer + `<g class="inner" id="innerRing">${inner}</g>`;
}
function setWheel(k) {
  wheelShift = (k + 26) % 26;
  $("innerRing").style.transform = `rotate(${wheelShift * (360 / 26)}deg)`;
  $("shiftOut").textContent = "Shift " + wheelShift;
  $("preview").textContent = caesar($("cipherText").dataset.text, -wheelShift);
}

// Progress and status
function buildTrack() {
  const track = $("track");
  track.querySelectorAll(".node").forEach(n => n.remove());
  PUZZLES.forEach((p, i) => {
    const n = document.createElement("div");
    n.className = "node";
    n.id = "node" + i;
    n.innerHTML = `<i>${i + 1}</i><span>${p.level}</span>`;
    track.appendChild(n);
  });
}
function updateProgress() {
  PUZZLES.forEach((_, i) => {
    const n = $("node" + i);
    n.classList.toggle("done", i < cleared);
    n.classList.toggle("active", i === current && !solved);
  });
  const f = Math.min(cleared / (PUZZLES.length - 1), 1); 
  $("fill").style.width = `calc(${f * 100}% - ${f * 36}px)`;
}
function setStatus(text, ok) {
  $("statusText").textContent = text;
  $("status").classList.toggle("cleared", !!ok);
}

// Load a puzzle
function loadPuzzle(i) {
  current = i;
  solved = false;
  const p = PUZZLES[i];
  const encrypted = caesar(p.plain, p.shift);

  $("sectorTitle").textContent = `Sector ${i + 1} of ${PUZZLES.length}`;
  $("sectorName").textContent = p.name;
  $("difficulty").textContent = p.level;
  $("cipherText").dataset.text = encrypted;
  $("cipherText").classList.remove("decoded");
  scramble($("cipherText"), encrypted, 1000);
  $("hint").textContent = "Hint: " + p.hint;
  $("hint").classList.remove("show");
  $("hintBtn").textContent = "Show hint";
  $("result").className = "result";
  $("proceed").classList.remove("show");
  $("answer").value = "";
  $("answer").disabled = false;
  $("decryptBtn").disabled = false;
  $("proceed").textContent = i === PUZZLES.length - 1 ? "RUN UNLOCK SEQUENCE" : "PROCEED TO NEXT PAGE";
  $("mission").style.display = "";
  $("finish").classList.remove("show");

  setWheel(0);
  setStatus("Awaiting decryption");
  updateProgress();
  log(`Sector ${i + 1} online. Incoming transmission: ${p.name}.`, "sys");
  $("answer").focus({ preventScroll: true });
}

// Check the answer
function decrypt() {
  if (solved) return;
  const guess = clean($("answer").value);
  if (!guess) return;
  const result = $("result");
  result.className = "result show";
  void result.offsetWidth; 

  if (guess === clean(PUZZLES[current].plain)) {
    solved = true;
    cleared = Math.max(cleared, current + 1);
    result.className = "result show ok";
    scramble(result, "ACCESS GRANTED", 500);
    
    $("cipherText").classList.add("decoded");
    scramble($("cipherText"), PUZZLES[current].plain, 800);
    glitch($("cipherText"));
    $("answer").disabled = true;
    $("decryptBtn").disabled = true;
    $("proceed").classList.add("show");
    setStatus("Sector cleared", true);
    log("Cipher broken. Access granted.", "ok");
    updateProgress();
  } else {
    result.className = "result show bad";
    scramble(result, "ACCESS DENIED", 400);
    glitch($("cipherText"));
    glitch(document.querySelector("#mission .card"), 420);
    log("Decryption failed. Check your shift and try again.", "bad");
  }
}

// Finish and unlock
function proceed() {
  const overlay = $("overlay");
  const last = current === PUZZLES.length - 1;
  $("overlayText").textContent = last ? "Unlocking ACM website sample..." : `Unlocking sector ${current + 2}...`;
  overlay.classList.add("show");
  glitch(overlay.querySelector(".box"), 700);

  setTimeout(() => {
    overlay.classList.remove("show");
    if (!last) {
      const mission = $("mission");
      mission.classList.add("stage-out");
      setTimeout(() => {
        loadPuzzle(current + 1);
        mission.classList.remove("stage-out");
        mission.classList.remove("stage-in");
        void mission.offsetWidth;
        mission.classList.add("stage-in");
      }, 180);
      return;
    }
    if (FINAL_PAGE_URL) { window.location.href = FINAL_PAGE_URL; return; }
    $("mission").style.display = "none";
    $("finish").classList.add("show");
    setStatus("Mission complete", true);
    log("All sectors cleared. Mission page unlocked (demo).", "ok");
  }, 1500);
}

// Event listeners
$("decryptBtn").addEventListener("click", decrypt);
$("answer").addEventListener("keydown", e => { if (e.key === "Enter") decrypt(); });
$("hintBtn").addEventListener("click", () => {
  const show = $("hint").classList.toggle("show");
  $("hintBtn").textContent = show ? "Hide hint" : "Show hint";
});
$("minus").addEventListener("click", () => setWheel(wheelShift - 1));
$("plus").addEventListener("click", () => setWheel(wheelShift + 1));
$("proceed").addEventListener("click", proceed);

// Starfield
(function stars() {
  const c = $("stars"), ctx = c.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let list = [], galaxy = [], previousFrame = 0;
  function resize() {
    c.width = innerWidth; c.height = innerHeight;
    list = Array.from({ length: Math.round(innerWidth * innerHeight / 7000) }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.25 + .25, p: Math.random() * 6.28, s: Math.random() * .02 + .005,
      dx: (Math.random() - .5) * 3.2, dy: (Math.random() - .5) * 3.2,
      hue: Math.random() < .25 ? "180,150,255" : "190,220,255"
    }));
    // Scatter stars along a tilted band.
    galaxy = Array.from({ length: Math.min(2800, Math.round(innerWidth * innerHeight / 620)) }, () => {
      const x = (Math.random() * 2 - 1) * (Math.random() < .18 ? 1.2 : 1);
      const gaussian = (Math.random() + Math.random() + Math.random() - 1.5) * .105;
      const y = gaussian + .11 * x * x;
      const dustLane = Math.abs(gaussian) < .027 && Math.random() < .62;
      return {
        x, y,
        r: Math.random() * 1.25 + .16,
        a: Math.random() * .5 + .18,
        dust: dustLane,
        tint: Math.random() < .2 ? "220,232,255" : "255,255,255"
      };
    });
  }
  function draw(t) {
    ctx.clearRect(0, 0, c.width, c.height);
    const seconds = t / 1000;
    const delta = previousFrame ? Math.min((t - previousFrame) / 1000, .05) : 0;
    previousFrame = t;
    const gx = c.width * (.65 + Math.sin(seconds * .035) * .018);
    const gy = c.height * (.42 + Math.cos(seconds * .028) * .018);
    const radius = Math.min(c.width * .72, c.height * 1.05);

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(-.38 + seconds * .002);
    ctx.scale(radius, radius * .72);
    ctx.globalCompositeOperation = "screen";
    const core = ctx.createRadialGradient(0, 0, .008, 0, 0, .95);
    core.addColorStop(0, "rgba(255,255,255,.28)");
    core.addColorStop(.12, "rgba(238,244,255,.18)");
    core.addColorStop(.38, "rgba(220,232,255,.09)");
    core.addColorStop(.8, "rgba(190,210,255,.025)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(0, 0, .82, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(5,8,22,.3)";
    ctx.beginPath();
    ctx.moveTo(-1.08, -.055);
    ctx.quadraticCurveTo(0, .012, 1.08, .085);
    ctx.lineTo(1.08, .115);
    ctx.quadraticCurveTo(0, .045, -1.08, -.025);
    ctx.closePath();
    ctx.fill();
    for (const p of galaxy) {
      const shimmer = .74 + .26 * Math.sin(seconds * .7 + p.x * 13 + p.y * 9);
      if (p.dust) {
        ctx.fillStyle = `rgba(5,8,22,${p.a * .58})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r / radius * 2.2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = `rgba(${p.tint},${p.a * shimmer})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r / radius, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();

    for (const s of list) {
      if (!reduce) {
        s.x += s.dx * delta;
        s.y += s.dy * delta;
        if (s.x < 0) s.x = c.width; else if (s.x > c.width) s.x = 0;
        if (s.y < 0) s.y = c.height; else if (s.y > c.height) s.y = 0;
      }
      const a = .35 + .65 * Math.abs(Math.sin(s.p + t * s.s * .06));
      ctx.fillStyle = `rgba(${s.hue},${a})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener("resize", resize);
  resize(); draw(0);
})();

// Start the interface
buildWheel();
buildTrack();
loadPuzzle(0);
log("Cipher Breach v0.1 initialised. Link to ACM relay established.", "sys");
