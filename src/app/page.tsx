"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Section = "games" | "drawing" | "roblox";
type Card = { id: number; value: string; matched: boolean };
type BubbleColor = "pink" | "blue" | "green" | "yellow" | "purple";
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

const memorySymbols = ["gem", "star", "heart", "cube", "gem", "star", "heart", "cube"];
const paintColors = ["#ff4f8b", "#31a8ff", "#6dde47", "#ffd336", "#8e5cff", "#202a44"];
const bubbleColors: BubbleColor[] = ["pink", "blue", "green", "yellow", "purple"];
const galleryFriends = [
  "Pink Explorer",
  "Blue Builder",
  "Forest Scout",
  "Purple Cat Friend",
  "Orange Inventor",
  "Sunny Robot",
  "Silver Knight",
  "Red Captain",
  "Rainbow Painter"
];

export default function HomePage() {
  const [section, setSection] = useState<Section>("games");
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [openCards, setOpenCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [poppedBubbles, setPoppedBubbles] = useState(0);
  const [bubbleResetKey, setBubbleResetKey] = useState(0);
  const [paintColor, setPaintColor] = useState(paintColors[0]);
  const [brushSize, setBrushSize] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const matchedCount = cards.filter((card) => card.matched).length;
  const allMatched = matchedCount === cards.length;

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
    if (openCards.length !== 2) return;

    const [firstId, secondId] = openCards;
    const first = cards.find((card) => card.id === firstId);
    const second = cards.find((card) => card.id === secondId);

    if (!first || !second) return;

    const timer = window.setTimeout(() => {
      if (first.value === second.value) {
        setCards((current) =>
          current.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, matched: true } : card
          )
        );
      }
      setOpenCards([]);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [cards, openCards]);

  function flipCard(id: number) {
    const card = cards.find((item) => item.id === id);
    if (!card || card.matched || openCards.includes(id) || openCards.length === 2) return;

    const next = [...openCards, id];
    setOpenCards(next);
    if (next.length === 2) setMoves((current) => current + 1);
  }

  function resetMemory() {
    setCards(shuffleCards());
    setOpenCards([]);
    setMoves(0);
  }

  function resetBubbles() {
    setPoppedBubbles(0);
    setBubbleResetKey((key) => key + 1);
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
    if (allMatched && poppedBubbles >= 20) return "Super builder";
    if (allMatched) return "Memory master";
    if (poppedBubbles >= 20) return "Bubble hero";
    return "Ready to play";
  }, [allMatched, poppedBubbles]);

  return (
    <main className="nika-app">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="Nika's App home">
          <span className="brand-avatar" aria-hidden="true" />
          <span>Nika&apos;s App</span>
        </a>
        <nav className="section-tabs" aria-label="App sections">
          {(["games", "drawing", "roblox"] as Section[]).map((item) => (
            <button
              className={section === item ? "tab active" : "tab"}
              key={item}
              onClick={() => setSection(item)}
              type="button"
            >
              {item === "games" ? "Games" : item === "drawing" ? "Drawing" : "Roblox"}
            </button>
          ))}
        </nav>
        <div className="score-card" aria-label={`Nika status: ${rewardText}`}>
          <strong>{matchedCount / 2 + poppedBubbles}</strong>
          <span>{rewardText}</span>
        </div>
      </header>

      <section className="hero-band" id="top">
        <div>
          <h1>Play in Nika&apos;s block world.</h1>
          <p>
            Memory Match, Bubble Pop, a bright drawing pad, and original blocky friends to view.
          </p>
        </div>
        <button className="big-action" type="button" onClick={() => setSection("games")}>
          Start playing
        </button>
      </section>

      <div className="app-grid">
        <section className="main-panel" aria-live="polite">
          {section === "games" && (
            <div className="games-layout">
              <GameShell
                title="Memory Match"
                detail={`${moves} moves${allMatched ? " - all matched" : ""}`}
                action="Shuffle"
                onAction={resetMemory}
              >
                <div className="memory-board">
                  {cards.map((card) => {
                    const visible = card.matched || openCards.includes(card.id);
                    return (
                      <button
                        className={visible ? "memory-card open" : "memory-card"}
                        key={card.id}
                        onClick={() => flipCard(card.id)}
                        type="button"
                        aria-label={visible ? `${card.value} card` : "Hidden card"}
                      >
                        <span>{visible ? cardSymbol(card.value) : "?"}</span>
                      </button>
                    );
                  })}
                </div>
              </GameShell>

              <GameShell
                title="Bubble Pop"
                detail={`${poppedBubbles} bubbles popped`}
                action="Reset"
                onAction={resetBubbles}
              >
                <BubblePopGame
                  onPop={() => setPoppedBubbles((count) => count + 1)}
                  popped={poppedBubbles}
                  resetKey={bubbleResetKey}
                />
              </GameShell>
            </div>
          )}

          {section === "drawing" && (
            <DrawingPanel
              brushSize={brushSize}
              clearCanvas={clearCanvas}
              draw={draw}
              paintColor={paintColor}
              setBrushSize={setBrushSize}
              setPaintColor={setPaintColor}
              startDrawing={startDrawing}
              stopDrawing={stopDrawing}
              canvasRef={canvasRef}
            />
          )}

          {section === "roblox" && <RobloxGallery />}
        </section>

        <aside className="side-panel">
          <div className="side-card gallery-preview">
            <div className="panel-title">
              <span>Roblox</span>
              <h2>Blocky Friends</h2>
            </div>
            <div className="friend-grid small">
              {galleryFriends.slice(0, 6).map((friend, index) => (
                <button
                  className="friend-thumb"
                  key={friend}
                  onClick={() => setSection("roblox")}
                  style={friendTileStyle(index)}
                  type="button"
                  aria-label={`View ${friend}`}
                />
              ))}
            </div>
            <button className="wide-button" type="button" onClick={() => setSection("roblox")}>
              View all friends
            </button>
          </div>

          <div className="side-card safety-card">
            <span className="cube-stack" aria-hidden="true" />
            <h2>Kid safe</h2>
            <p>Offline-style play screen with no chat, ads, purchases, or outside links.</p>
          </div>
        </aside>
      </div>
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

function BubblePopGame({
  onPop,
  popped,
  resetKey
}: {
  onPop: () => void;
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
  paintColor: string;
  setBrushSize: (size: number) => void;
  setPaintColor: (color: string) => void;
  startDrawing: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
}) {
  return (
    <article className="drawing-panel">
      <div className="game-head">
        <div>
          <h2>Drawing Pad</h2>
          <p>Draw a castle, a pet, or a colorful block world.</p>
        </div>
        <button type="button" onClick={clearCanvas}>
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
                onClick={() => setPaintColor(color)}
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
          onPointerDown={startDrawing}
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

function RobloxGallery() {
  return (
    <article className="roblox-panel">
      <div className="game-head">
        <div>
          <h2>Roblox</h2>
          <p>Original blocky friends for Nika to browse. No official characters or logos.</p>
        </div>
      </div>
      <div className="gallery-hero">
        <img src="/assets/blocky-friends-gallery.png" alt="Nine original blocky adventure friends" />
      </div>
      <div className="friend-grid">
        {galleryFriends.map((friend, index) => (
          <div className="friend-tile" key={friend}>
            <span className="friend-thumb" style={friendTileStyle(index)} aria-hidden="true" />
            <strong>{friend}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function shuffleCards() {
  return memorySymbols
    .map((value, id) => ({ id, value, matched: false }))
    .sort(() => Math.random() - 0.5);
}

function cardSymbol(value: string) {
  const symbols: Record<string, string> = {
    cube: "C",
    gem: "G",
    heart: "H",
    star: "S"
  };
  return symbols[value];
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

function friendTileStyle(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    backgroundImage: "url('/assets/blocky-friends-gallery.png')",
    backgroundPosition: `${col * 50}% ${row * 50}%`
  };
}
