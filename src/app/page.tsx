"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Section = "games" | "drawing" | "roblox";
type Card = { id: number; value: string; matched: boolean };
type BubbleColor = "pink" | "blue" | "green" | "yellow" | "purple";
type BoardBubble = { id: number; color: BubbleColor; popping?: boolean };
type FlyingBubble = {
  color: BubbleColor;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

const memorySymbols = ["gem", "star", "heart", "cube", "gem", "star", "heart", "cube"];
const paintColors = ["#ff4f8b", "#31a8ff", "#6dde47", "#ffd336", "#8e5cff", "#202a44"];
const bubbleColors: BubbleColor[] = ["pink", "blue", "green", "yellow", "purple"];
const bubbleCols = 7;
const bubbleRows = 6;
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
  const [bubbleBoard, setBubbleBoard] = useState<(BoardBubble | null)[]>(() => createBubbleBoard());
  const [bubbleScore, setBubbleScore] = useState(0);
  const [currentBubble, setCurrentBubble] = useState<BubbleColor>("pink");
  const [nextBubble, setNextBubble] = useState<BubbleColor>("blue");
  const [aim, setAim] = useState(0);
  const [flyingBubble, setFlyingBubble] = useState<FlyingBubble | null>(null);
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
    setBubbleBoard(createBubbleBoard());
    setBubbleScore(0);
    setCurrentBubble(randomBubbleColor());
    setNextBubble(randomBubbleColor());
    setAim(0);
    setFlyingBubble(null);
  }

  function shootBubble() {
    if (flyingBubble) return;

    const targetCol = Math.max(0, Math.min(bubbleCols - 1, Math.round(3 + aim / 15)));
    const targetIndex = findBubbleLanding(bubbleBoard, targetCol);
    if (targetIndex === -1) return;

    const col = targetIndex % bubbleCols;
    const row = Math.floor(targetIndex / bubbleCols);
    const shotColor = currentBubble;

    setFlyingBubble({
      color: shotColor,
      fromX: 50,
      fromY: 90,
      toX: 7 + col * 14.2,
      toY: 7 + row * 13.5
    });

    window.setTimeout(() => {
      setBubbleBoard((current) => {
        const placed = [...current];
        placed[targetIndex] = { id: Date.now(), color: shotColor };
        const cluster = findBubbleCluster(placed, targetIndex, shotColor);

        if (cluster.length >= 3) {
          window.setTimeout(() => {
            setBubbleBoard((latest) => latest.map((bubble) => (bubble?.popping ? null : bubble)));
            setBubbleScore((score) => score + cluster.length * 10);
          }, 310);

          return placed.map((bubble, index) =>
            bubble && cluster.includes(index) ? { ...bubble, popping: true } : bubble
          );
        }

        return placed;
      });

      setCurrentBubble(nextBubble);
      setNextBubble(randomBubbleColor());
      setFlyingBubble(null);
    }, 430);
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
    if (allMatched && bubbleScore >= 80) return "Super builder";
    if (allMatched) return "Memory master";
    if (bubbleScore >= 80) return "Bubble hero";
    return "Ready to play";
  }, [allMatched, bubbleScore]);

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
          <strong>{matchedCount / 2 + Math.floor(bubbleScore / 20)}</strong>
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
                detail={`${bubbleScore} points`}
                action="Reset"
                onAction={resetBubbles}
              >
                <div className="bubble-stage" aria-label="Bubble shooter game">
                  <div className="bubble-board">
                    {bubbleBoard.map((bubble, index) => (
                      <span
                        className={
                          bubble ? `board-bubble ${bubble.color} ${bubble.popping ? "popping" : ""}` : "board-slot"
                        }
                        key={`${bubble?.id ?? "empty"}-${index}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span
                    className="aim-beam"
                    style={{ transform: `translateX(-50%) rotate(${aim}deg)` }}
                    aria-hidden="true"
                  />
                  {flyingBubble && (
                    <span
                      className={`flying-bubble ${flyingBubble.color}`}
                      style={
                        {
                          "--from-x": `${flyingBubble.fromX}%`,
                          "--from-y": `${flyingBubble.fromY}%`,
                          "--to-x": `${flyingBubble.toX}%`,
                          "--to-y": `${flyingBubble.toY}%`
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                  )}
                  <div className="launcher">
                    <button
                      aria-label="Aim left"
                      onClick={() => setAim((value) => Math.max(value - 15, -45))}
                      type="button"
                    >
                      Left
                    </button>
                    <div className="cannon" aria-label={`Current bubble ${currentBubble}`}>
                      <span className={`next-shot ${currentBubble}`} />
                    </div>
                    <button
                      aria-label="Aim right"
                      onClick={() => setAim((value) => Math.min(value + 15, 45))}
                      type="button"
                    >
                      Right
                    </button>
                    <button className="shoot-button" onClick={shootBubble} type="button">
                      Shoot
                    </button>
                    <span className={`queued-bubble ${nextBubble}`} aria-label={`Next bubble ${nextBubble}`} />
                  </div>
                </div>
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

function createBubbleBoard() {
  return Array.from({ length: bubbleCols * bubbleRows }, (_, index) => {
    const row = Math.floor(index / bubbleCols);
    if (row > 2) return null;
    return {
      id: index,
      color: bubbleColors[(index + row * 2) % bubbleColors.length]
    };
  });
}

function randomBubbleColor(): BubbleColor {
  return bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
}

function findBubbleLanding(board: (BoardBubble | null)[], col: number) {
  for (let row = bubbleRows - 1; row >= 0; row--) {
    const index = row * bubbleCols + col;
    if (!board[index]) return index;
  }
  return -1;
}

function findBubbleCluster(board: (BoardBubble | null)[], startIndex: number, color: BubbleColor) {
  const seen = new Set<number>();
  const stack = [startIndex];

  while (stack.length) {
    const index = stack.pop();
    if (index === undefined || seen.has(index)) continue;
    const bubble = board[index];
    if (!bubble || bubble.color !== color) continue;

    seen.add(index);
    for (const neighbor of bubbleNeighbors(index)) {
      if (!seen.has(neighbor)) stack.push(neighbor);
    }
  }

  return Array.from(seen);
}

function bubbleNeighbors(index: number) {
  const row = Math.floor(index / bubbleCols);
  const col = index % bubbleCols;
  const offsets = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
    [-1, row % 2 === 0 ? -1 : 1],
    [1, row % 2 === 0 ? -1 : 1]
  ];

  return offsets
    .map(([rowOffset, colOffset]) => [row + rowOffset, col + colOffset])
    .filter(([nextRow, nextCol]) => nextRow >= 0 && nextRow < bubbleRows && nextCol >= 0 && nextCol < bubbleCols)
    .map(([nextRow, nextCol]) => nextRow * bubbleCols + nextCol);
}

function friendTileStyle(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    backgroundImage: "url('/assets/blocky-friends-gallery.png')",
    backgroundPosition: `${col * 50}% ${row * 50}%`
  };
}
