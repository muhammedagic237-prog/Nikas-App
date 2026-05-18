"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GameWindowKind = "bubble" | "drawing" | "roblox" | null;
type BubbleColor = "pink" | "blue" | "green" | "yellow" | "purple";
type FriendColor = "pink" | "blue" | "green" | "yellow" | "purple" | "orange";
type GalleryFriend = { name: string; role: string; sheetIndex?: number; variant?: number; color: FriendColor };
type SoundName = "tap" | "pop" | "match" | "open" | "reset" | "draw" | "cycle";
type PlayerProgress = {
  bubbleBest: number;
  bubbleTotal: number;
  drawingSessions: number;
  friendViews: number;
};
type GameBubble = {
  id: number;
  color: BubbleColor;
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
};
type SplashParticle = {
  id: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
};

const paintColors = ["#ff4f8b", "#31a8ff", "#6dde47", "#ffd336", "#8e5cff", "#202a44"];
const bubbleColors: BubbleColor[] = ["pink", "blue", "green", "yellow", "purple"];
const progressKey = "nika-app-progress-v1";
const defaultProgress: PlayerProgress = {
  bubbleBest: 0,
  bubbleTotal: 0,
  drawingSessions: 0,
  friendViews: 0
};
const galleryFriends: GalleryFriend[] = [
  { name: "Pink Explorer", role: "Crystal cave scout", sheetIndex: 0, color: "pink" },
  { name: "Blue Builder", role: "Tower maker", sheetIndex: 1, color: "blue" },
  { name: "Forest Scout", role: "Treehouse guide", sheetIndex: 2, color: "green" },
  { name: "Purple Cat Friend", role: "Moonlight jumper", sheetIndex: 3, color: "purple" },
  { name: "Orange Inventor", role: "Gadget fixer", sheetIndex: 4, color: "orange" },
  { name: "Sunny Robot", role: "Helpful bot", sheetIndex: 5, color: "yellow" },
  { name: "Silver Knight", role: "Castle guard", sheetIndex: 6, color: "blue" },
  { name: "Red Captain", role: "Treasure finder", sheetIndex: 7, color: "pink" },
  { name: "Rainbow Painter", role: "Color creator", sheetIndex: 8, color: "purple" },
  { name: "Star Skater", role: "Cloud ramp racer", variant: 0, color: "yellow" },
  { name: "Candy Builder", role: "Sweet block designer", variant: 1, color: "pink" },
  { name: "Aqua Diver", role: "Lagoon pearl finder", variant: 2, color: "blue" },
  { name: "Garden Princess", role: "Flower castle keeper", variant: 3, color: "green" },
  { name: "Pixel Princess", role: "Royal obby winner", variant: 4, color: "purple" },
  { name: "Firework DJ", role: "Party stage friend", variant: 5, color: "orange" },
  { name: "Cloud Pilot", role: "Sky island flyer", variant: 6, color: "blue" },
  { name: "Glitter Guard", role: "Princess palace helper", variant: 7, color: "yellow" },
  { name: "Neon Ninja", role: "Obstacle course jumper", variant: 8, color: "purple" },
  { name: "Berry Chef", role: "Cupcake cafe maker", variant: 9, color: "pink" },
  { name: "Ice Builder", role: "Snow castle designer", variant: 10, color: "blue" },
  { name: "Jungle Dancer", role: "Leaf stage star", variant: 11, color: "green" },
  { name: "Rocket Kid", role: "Moon block pilot", variant: 12, color: "orange" },
  { name: "Diamond Diver", role: "Sparkle lagoon swimmer", variant: 13, color: "blue" },
  { name: "Crown Crafter", role: "Royal outfit maker", variant: 14, color: "yellow" }
];

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeWindow, setActiveWindow] = useState<GameWindowKind>(null);
  const [poppedBubbles, setPoppedBubbles] = useState(0);
  const [bubbleResetKey, setBubbleResetKey] = useState(0);
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [soundOn, setSoundOn] = useState(true);
  const [paintColor, setPaintColor] = useState(paintColors[0]);
  const [brushSize, setBrushSize] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  const bubbleLevel = Math.max(1, Math.floor(poppedBubbles / 15) + 1);
  const bestLevel = Math.max(1, Math.floor(progress.bubbleBest / 15) + 1);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveWindow(null);
    }

    if (activeWindow) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", closeOnEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeWindow]);

  function resetBubbles() {
    playSound("reset");
    setPoppedBubbles(0);
    setBubbleResetKey((key) => key + 1);
  }

  function openWindow(windowName: Exclude<GameWindowKind, null>) {
    playSound("open");
    if (windowName === "drawing") {
      setProgress((current) => ({ ...current, drawingSessions: current.drawingSessions + 1 }));
    }
    if (windowName === "roblox") {
      setProgress((current) => ({ ...current, friendViews: current.friendViews + 1 }));
    }
    setActiveWindow(windowName);
  }

  function recordBubblePop() {
    setPoppedBubbles((count) => {
      const next = count + 1;
      setProgress((current) => ({
        ...current,
        bubbleBest: Math.max(current.bubbleBest, next),
        bubbleTotal: current.bubbleTotal + 1
      }));
      return next;
    });
  }

  function recordFriendView() {
    setProgress((current) => ({ ...current, friendViews: current.friendViews + 1 }));
  }

  function getAudioContext() {
    if (audioRef.current) return audioRef.current;

    const AudioCtor =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;

    audioRef.current = new AudioCtor();
    return audioRef.current;
  }

  function playTone(
    frequency: number,
    duration = 0.12,
    delay = 0,
    type: OscillatorType = "sine",
    volume = 0.08,
    force = false
  ) {
    if (!soundOn && !force) return;

    const context = getAudioContext();
    if (!context) return;

    const startAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function playSound(sound: SoundName, force = false) {
    if (!soundOn && !force) return;

    if (sound === "pop") {
      playTone(740, 0.07, 0, "triangle", 0.12, force);
      playTone(1180, 0.11, 0.035, "sine", 0.08, force);
      return;
    }

    if (sound === "match") {
      playTone(523, 0.1, 0, "sine", 0.08, force);
      playTone(659, 0.1, 0.08, "sine", 0.08, force);
      playTone(784, 0.14, 0.16, "sine", 0.08, force);
      return;
    }

    if (sound === "open") {
      playTone(392, 0.08, 0, "triangle", 0.07, force);
      playTone(784, 0.14, 0.08, "triangle", 0.08, force);
      return;
    }

    if (sound === "reset") {
      playTone(440, 0.08, 0, "square", 0.04, force);
      playTone(330, 0.11, 0.07, "square", 0.04, force);
      return;
    }

    if (sound === "cycle") {
      playTone(620, 0.08, 0, "triangle", 0.06, force);
      playTone(820, 0.08, 0.055, "triangle", 0.05, force);
      return;
    }

    if (sound === "draw") {
      playTone(520, 0.045, 0, "sine", 0.035, force);
      return;
    }

    playTone(520, 0.06, 0, "triangle", 0.06, force);
  }

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const point = canvasPoint(event);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const point = canvasPoint(event);
    context.strokeStyle = paintColor;
    context.lineWidth = brushSize;
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    drawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const rewardText = useMemo(() => {
    if (progress.bubbleBest >= 45) return "Bubble champion";
    if (progress.friendViews >= 24) return "Friend expert";
    if (progress.drawingSessions >= 5) return "Art princess";
    return "Ready to play";
  }, [progress]);

  return (
    <main className="nika-app">
      {showSplash && (
        <div className="splash-screen" aria-label="Princess Nika loading screen">
          <div className="splash-cubes" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="splash-character" aria-hidden="true">
            <span className="splash-hi">Hi</span>
            <span className="splash-arm" />
            <span className="splash-face" />
          </div>
          <h1>
            <span>Princess</span>
            <span>Nika</span>
          </h1>
        </div>
      )}
      <header className="app-header">
        <a className="brand" href="#top" aria-label="Nika's App home">
          <span className="brand-avatar" aria-hidden="true" />
          <span>Nika&apos;s App</span>
        </a>
        <div className="score-card" aria-label={`Nika status: ${rewardText}`}>
          <strong>{progress.bubbleBest + progress.drawingSessions + progress.friendViews}</strong>
          <span>{rewardText}</span>
        </div>
        <button
          className={soundOn ? "sound-toggle active" : "sound-toggle"}
          type="button"
          onClick={() => {
            const nextSound = !soundOn;
            setSoundOn(nextSound);
            if (nextSound) playSound("open", true);
          }}
          aria-label={soundOn ? "Turn sounds off" : "Turn sounds on"}
        >
          {soundOn ? "Sound On" : "Sound Off"}
        </button>
      </header>

      <section className="main-menu" id="top" aria-label="Choose an activity">
        <div className="menu-title">
          <span>Princess Nika</span>
          <h1>Choose your play room.</h1>
        </div>

        <div className="menu-card-grid">
          <button className="menu-card bubble-menu" type="button" onClick={() => openWindow("bubble")}>
            <span className="menu-icon" aria-hidden="true">B</span>
            <strong>Bubble Pop</strong>
            <small>Level {bubbleLevel} now | Best {progress.bubbleBest}</small>
            <span className="menu-meter" aria-hidden="true">
              <span style={{ width: `${Math.min((poppedBubbles % 15) * 6.67, 100)}%` }} />
            </span>
          </button>

          <button className="menu-card drawing-menu" type="button" onClick={() => openWindow("drawing")}>
            <span className="menu-icon" aria-hidden="true">D</span>
            <strong>Drawing Pad</strong>
            <small>{progress.drawingSessions} art sessions</small>
            <span className="menu-sparkles" aria-hidden="true" />
          </button>

          <button className="menu-card friends-menu" type="button" onClick={() => openWindow("roblox")}>
            <span
              className="menu-friend-preview"
              style={friendImageStyle(galleryFriends[12])}
              aria-hidden="true"
            />
            <strong>Blocky Friends</strong>
            <small>{galleryFriends.length} friends | {progress.friendViews} views</small>
          </button>
        </div>
      </section>

      {activeWindow === "bubble" && (
        <GameWindow
            title="Bubble Pop"
          detail={`Level ${bubbleLevel} | ${poppedBubbles} popped | best ${progress.bubbleBest}`}
          action="Reset"
          onAction={resetBubbles}
          onClose={() => setActiveWindow(null)}
        >
          <BubblePopGame
            onPop={recordBubblePop}
            onSound={playSound}
            popped={poppedBubbles}
            resetKey={bubbleResetKey}
          />
        </GameWindow>
      )}

      {activeWindow === "drawing" && (
        <GameWindow title="Drawing Pad" detail="Paint a colorful block world." onClose={() => setActiveWindow(null)}>
          <DrawingPanel
            brushSize={brushSize}
            clearCanvas={clearCanvas}
            draw={draw}
            paintColor={paintColor}
            setBrushSize={setBrushSize}
            setPaintColor={setPaintColor}
            onSound={playSound}
            startDrawing={startDrawing}
            stopDrawing={stopDrawing}
            canvasRef={canvasRef}
          />
        </GameWindow>
      )}

      {activeWindow === "roblox" && (
        <GameWindow
          title="Blocky Friends"
          detail={`${galleryFriends.length} original friends to view`}
          onClose={() => setActiveWindow(null)}
        >
          <RobloxGallery windowed onFriendView={recordFriendView} onSound={playSound} />
        </GameWindow>
      )}
    </main>
  );
}

function GameShell({
  action,
  children,
  detail,
  onAction,
  title
}: {
  action: string;
  children: React.ReactNode;
  detail: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <article className="game-card">
      <div className="game-head">
        <div>
          <h2>{title}</h2>
          <p>{detail}</p>
        </div>
        <button type="button" onClick={onAction}>
          {action}
        </button>
      </div>
      {children}
    </article>
  );
}

function GameWindow({
  action,
  children,
  detail,
  onAction,
  onClose,
  title
}: {
  action?: string;
  children: React.ReactNode;
  detail: string;
  onAction?: () => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="game-window-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="game-window">
        <div className="game-window-head">
          <div>
            <span>Play window</span>
            <h2>{title}</h2>
            <p>{detail}</p>
          </div>
          <div className="window-actions">
            {action && onAction && (
              <button className="window-action" type="button" onClick={onAction}>
                {action}
              </button>
            )}
            <button className="window-close" type="button" onClick={onClose} aria-label={`Close ${title}`}>
              Close
            </button>
          </div>
        </div>
        <div className="game-window-body">{children}</div>
      </div>
    </div>
  );
}

function BubblePopGame({
  onPop,
  onSound,
  popped,
  resetKey
}: {
  onPop: () => void;
  onSound?: (sound: SoundName) => void;
  popped: number;
  resetKey: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<GameBubble[]>([]);
  const particlesRef = useRef<SplashParticle[]>([]);
  const runningRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextIdRef = useRef(1);
  const [running, setRunning] = useState(false);
  const [missed, setMissed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [splashText, setSplashText] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * scale);
      canvas.height = Math.floor(rect.height * scale);
      const context = canvas.getContext("2d");
      context?.setTransform(scale, 0, 0, scale, 0, 0);
      drawScene(performance.now());
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    stopGame();
    bubblesRef.current = [];
    particlesRef.current = [];
    setRunning(false);
    setMissed(0);
    setCombo(0);
    setSplashText("");
    drawScene(performance.now());
  }, [resetKey]);

  useEffect(() => {
    return () => stopGame();
  }, []);

  function startGame() {
    onSound?.("open");
    bubblesRef.current = [];
    particlesRef.current = [];
    spawnTimerRef.current = 0;
    lastFrameRef.current = performance.now();
    runningRef.current = true;
    setRunning(true);
    setMissed(0);
    setCombo(0);
    setSplashText("");
    for (let index = 0; index < 4; index += 1) {
      bubblesRef.current.push(createCanvasBubble(canvasSize().width, canvasSize().height, index * 90));
    }
    animationRef.current = requestAnimationFrame(tick);
  }

  function stopGame() {
    runningRef.current = false;
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }

  function tick(now: number) {
    const { width, height } = canvasSize();
    const delta = Math.min((now - lastFrameRef.current) / 1000, 0.04);
    lastFrameRef.current = now;
    spawnTimerRef.current += delta;

    const spawnEvery = Math.max(0.42, 0.95 - popped * 0.012);
    if (spawnTimerRef.current >= spawnEvery) {
      spawnTimerRef.current = 0;
      bubblesRef.current.push(createCanvasBubble(width, height));
    }

    bubblesRef.current = bubblesRef.current
      .map((bubble) => ({
        ...bubble,
        y: bubble.y - bubble.speed * delta,
        x: bubble.x + Math.sin(now / 420 + bubble.wobble) * bubble.wobbleSpeed * delta
      }))
      .filter((bubble) => {
        const visible = bubble.y + bubble.radius > -20;
        if (!visible) {
          setMissed((count) => count + 1);
          setCombo(0);
        }
        return visible;
      });

    particlesRef.current = particlesRef.current
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx * delta,
        y: particle.y + particle.vy * delta,
        vy: particle.vy + 180 * delta,
        radius: particle.radius * 0.985,
        life: particle.life - delta
      }))
      .filter((particle) => particle.life > 0 && particle.radius > 1);

    drawScene(now);
    if (runningRef.current) animationRef.current = requestAnimationFrame(tick);
  }

  function drawScene(now: number) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    context.clearRect(0, 0, width, height);

    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#bff4ff");
    sky.addColorStop(0.58, "#49c8ff");
    sky.addColorStop(1, "#168fe1");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    drawWaterBackground(context, width, height, now);

    for (const bubble of bubblesRef.current) {
      drawBubble(context, bubble, now);
    }

    for (const particle of particlesRef.current) {
      context.save();
      context.globalAlpha = Math.max(particle.life, 0);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.78)";
      context.lineWidth = 2;
      context.stroke();
      context.restore();
    }

    if (!runningRef.current) {
      context.fillStyle = "rgba(16, 33, 74, 0.18)";
      context.fillRect(0, 0, width, height);
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!runningRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let hitIndex = -1;

    for (let index = bubblesRef.current.length - 1; index >= 0; index -= 1) {
      const bubble = bubblesRef.current[index];
      const distance = Math.hypot(bubble.x - x, bubble.y - y);
      if (distance <= bubble.radius + 10) {
        hitIndex = index;
        break;
      }
    }

    if (hitIndex === -1) {
      setCombo(0);
      return;
    }

    const [bubble] = bubblesRef.current.splice(hitIndex, 1);
    particlesRef.current.push(...createSplash(bubble));
    onSound?.("pop");
    onPop();
    setCombo((current) => {
      const next = current + 1;
      setSplashText(next >= 5 ? "Splash streak!" : "Pop!");
      window.setTimeout(() => setSplashText(""), 520);
      return next;
    });
  }

  function canvasSize() {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    return { width: rect?.width ?? 360, height: rect?.height ?? 560 };
  }

  return (
    <div className="bubble-game">
      <div className="bubble-game-hud">
        <div>
          <span>Popped</span>
          <strong>{popped}</strong>
        </div>
        <div>
          <span>Missed</span>
          <strong>{missed}</strong>
        </div>
        <div>
          <span>Combo</span>
          <strong>{combo}</strong>
        </div>
      </div>
      <canvas
        aria-label="Bubble Pop play area"
        className="bubble-canvas"
        onPointerDown={handlePointerDown}
        ref={canvasRef}
      />
      {!running && (
        <button className="start-bubbles" onClick={startGame} type="button">
          Start bubbles
        </button>
      )}
      {splashText && <strong className="canvas-splash">{splashText}</strong>}
    </div>
  );
}

function DrawingPanel({
  brushSize,
  canvasRef,
  clearCanvas,
  draw,
  onSound,
  paintColor,
  setBrushSize,
  setPaintColor,
  startDrawing,
  stopDrawing
}: {
  brushSize: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  clearCanvas: () => void;
  draw: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onSound?: (sound: SoundName) => void;
  paintColor: string;
  setBrushSize: (size: number) => void;
  setPaintColor: (color: string) => void;
  startDrawing: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
  }, [canvasRef]);

  return (
    <article className="drawing-panel">
      <div className="game-head">
        <div>
          <h2>Drawing Pad</h2>
          <p>Draw a castle, a pet, or a colorful block world.</p>
        </div>
        <button type="button" onClick={() => {
          onSound?.("reset");
          clearCanvas();
        }}>
          Clear
        </button>
      </div>
      <div className="draw-workspace">
        <div className="tools">
          <span>Colors</span>
          <div className="swatches">
            {paintColors.map((color) => (
              <button
                aria-label={`Use ${color}`}
                className={paintColor === color ? "swatch active" : "swatch"}
                key={color}
                onClick={() => {
                  onSound?.("tap");
                  setPaintColor(color);
                }}
                style={{ background: color }}
                type="button"
              />
            ))}
          </div>
          <label>
            Brush
            <input
              max="24"
              min="4"
              onChange={(event) => setBrushSize(Number(event.target.value))}
              type="range"
              value={brushSize}
            />
          </label>
        </div>
        <canvas
          className="drawing-canvas"
          height={560}
          onPointerCancel={stopDrawing}
          onPointerDown={(event) => {
            onSound?.("draw");
            startDrawing(event);
          }}
          onPointerLeave={stopDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          ref={canvasRef}
          width={900}
        />
      </div>
    </article>
  );
}

function RobloxGallery({
  onFriendView,
  onSound,
  windowed = false
}: {
  onFriendView?: () => void;
  onSound?: (sound: SoundName) => void;
  windowed?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const activeFriend = galleryFriends[selected];

  function move(direction: -1 | 1) {
    onSound?.("cycle");
    onFriendView?.();
    setSelected((current) => (current + direction + galleryFriends.length) % galleryFriends.length);
  }

  return (
    <article className={windowed ? "roblox-panel windowed-gallery" : "roblox-panel"}>
      {!windowed && (
        <div className="game-head">
          <div>
            <h2>Roblox</h2>
            <p>Swipe or tap through original blocky friends. No official characters or logos.</p>
          </div>
        </div>
      )}

      <div className="character-viewer" aria-live="polite">
        <button className="viewer-arrow" onClick={() => move(-1)} type="button" aria-label="Previous character">
          Prev
        </button>
        <div className={`viewer-card animated ${activeFriend.color}`} key={activeFriend.name}>
          <div
            className={friendAvatarClass("viewer-portrait animated", activeFriend)}
            style={friendImageStyle(activeFriend)}
            aria-hidden="true"
          />
          <div className="viewer-copy">
            <span>{selected + 1} / {galleryFriends.length}</span>
            <h3>{activeFriend.name}</h3>
            <p>{activeFriend.role}</p>
          </div>
        </div>
        <button className="viewer-arrow" onClick={() => move(1)} type="button" aria-label="Next character">
          Next
        </button>
      </div>

      <div className="swipe-rail" aria-label="Swipeable blocky friends">
        {galleryFriends.map((friend, index) => (
          <button
            className={selected === index ? `rail-card active ${friend.color}` : `rail-card ${friend.color}`}
            key={friend.name}
            onClick={() => {
              onSound?.("cycle");
              onFriendView?.();
              setSelected(index);
            }}
            type="button"
            aria-label={`Open ${friend.name}`}
          >
            <span
              className={friendAvatarClass("friend-thumb", friend)}
              style={friendImageStyle(friend)}
              aria-hidden="true"
            />
            <strong>{friend.name}</strong>
          </button>
        ))}
      </div>

      <div className="friend-grid">
        {galleryFriends.map((friend, index) => (
          <button
            className={selected === index ? `friend-tile selected ${friend.color}` : `friend-tile ${friend.color}`}
            key={friend.name}
            onClick={() => {
              onSound?.("cycle");
              onFriendView?.();
              setSelected(index);
            }}
            type="button"
            aria-label={`View ${friend.name}`}
          >
            <span
              className={friendAvatarClass("friend-thumb", friend)}
              style={friendImageStyle(friend)}
              aria-hidden="true"
            />
            <strong>{friend.name}</strong>
            <small>{friend.role}</small>
          </button>
        ))}
      </div>
    </article>
  );
}

function randomBubbleColor(): BubbleColor {
  return bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
}

function createCanvasBubble(width: number, height: number, yOffset = 0): GameBubble {
  const radius = 28 + Math.random() * 22;
  return {
    id: Date.now() + nextRandomId(),
    color: randomBubbleColor(),
    x: radius + Math.random() * Math.max(width - radius * 2, radius),
    y: height + radius + yOffset,
    radius,
    speed: 92 + Math.random() * 92,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 28 + Math.random() * 34
  };
}

function nextRandomId() {
  return Math.floor(Math.random() * 1000000);
}

function drawWaterBackground(context: CanvasRenderingContext2D, width: number, height: number, now: number) {
  context.save();
  context.globalAlpha = 0.24;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 3;
  for (let line = 0; line < 7; line += 1) {
    const y = 70 + line * 78;
    context.beginPath();
    for (let x = -20; x <= width + 20; x += 20) {
      const wave = Math.sin(x / 44 + now / 900 + line) * 8;
      if (x === -20) context.moveTo(x, y + wave);
      else context.lineTo(x, y + wave);
    }
    context.stroke();
  }
  context.globalAlpha = 0.2;
  for (let index = 0; index < 16; index += 1) {
    const x = ((index * 83 + now / 38) % (width + 80)) - 40;
    const y = 30 + ((index * 57) % Math.max(height - 80, 100));
    context.beginPath();
    context.arc(x, y, 5 + (index % 4) * 3, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function drawBubble(context: CanvasRenderingContext2D, bubble: GameBubble, now: number) {
  const colors = bubblePalette(bubble.color);
  const pulse = Math.sin(now / 180 + bubble.wobble) * 1.4;
  const radius = bubble.radius + pulse;
  const gradient = context.createRadialGradient(
    bubble.x - radius * 0.32,
    bubble.y - radius * 0.38,
    radius * 0.08,
    bubble.x,
    bubble.y,
    radius
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.96)");
  gradient.addColorStop(0.22, colors.light);
  gradient.addColorStop(0.72, colors.base);
  gradient.addColorStop(1, colors.dark);

  context.save();
  context.shadowColor = "rgba(16, 33, 74, 0.24)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 8;
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(bubble.x, bubble.y, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowColor = "transparent";
  context.lineWidth = 3;
  context.strokeStyle = "rgba(255,255,255,0.82)";
  context.stroke();

  context.fillStyle = "rgba(255,255,255,0.72)";
  context.beginPath();
  context.ellipse(bubble.x - radius * 0.3, bubble.y - radius * 0.34, radius * 0.22, radius * 0.13, -0.5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function createSplash(bubble: GameBubble) {
  const colors = bubblePalette(bubble.color);
  return Array.from({ length: 28 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 28 + Math.random() * 0.35;
    const speed = 95 + Math.random() * 210;
    return {
      id: Date.now() + index,
      color: index % 3 === 0 ? "rgba(232, 252, 255, 0.9)" : colors.light,
      x: bubble.x,
      y: bubble.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      radius: 4 + Math.random() * 8,
      life: 0.48 + Math.random() * 0.28
    };
  });
}

function bubblePalette(color: BubbleColor) {
  const palettes: Record<BubbleColor, { light: string; base: string; dark: string }> = {
    pink: { light: "#ffc2dc", base: "#ff5aa0", dark: "#d93672" },
    blue: { light: "#bdeeff", base: "#24a8ff", dark: "#0d61c7" },
    green: { light: "#c8ffbf", base: "#5bdd4f", dark: "#229b36" },
    yellow: { light: "#fff2a9", base: "#ffd336", dark: "#df9b10" },
    purple: { light: "#dfc9ff", base: "#9a69ff", dark: "#6233c7" }
  };
  return palettes[color];
}

function friendAvatarClass(baseClass: string, friend: GalleryFriend) {
  const generatedClass = friend.sheetIndex === undefined && friend.variant === undefined ? " generated variant-0" : "";
  return `${baseClass} ${friend.color}${generatedClass}`;
}

function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return defaultProgress;

  try {
    const stored = window.localStorage.getItem(progressKey);
    if (!stored) return defaultProgress;
    const parsed = JSON.parse(stored) as Partial<PlayerProgress>;
    return {
      bubbleBest: Number(parsed.bubbleBest) || 0,
      bubbleTotal: Number(parsed.bubbleTotal) || 0,
      drawingSessions: Number(parsed.drawingSessions) || 0,
      friendViews: Number(parsed.friendViews) || 0
    };
  } catch {
    return defaultProgress;
  }
}

function friendImageStyle(friend: GalleryFriend) {
  if (friend.sheetIndex !== undefined) return friendTileStyle(friend.sheetIndex);
  if (friend.variant !== undefined) return extraFriendTileStyle(friend.variant);
  return undefined;
}

function friendTileStyle(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    backgroundImage: "url('/assets/blocky-friends-gallery.png')",
    backgroundPosition: `${col * 50}% ${row * 50}%`,
    backgroundSize: "300% 300%"
  };
}

function extraFriendTileStyle(index: number) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return {
    backgroundImage: "url('/assets/blocky-friends-extra.png')",
    backgroundPosition: `${col * 25}% ${row * 50}%`,
    backgroundSize: "500% 300%"
  };
}
