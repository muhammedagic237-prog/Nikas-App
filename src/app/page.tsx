"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GameWindowKind = "memory" | "bubble" | "drawing" | "roblox" | "cartoons" | null;
type PlayRoom = Exclude<GameWindowKind, null>;
type Card = { id: number; value: string; matched: boolean; accent: BubbleColor };
type BubbleColor = "pink" | "blue" | "green" | "yellow" | "purple";
type FriendColor = "pink" | "blue" | "green" | "yellow" | "purple" | "orange";
type GalleryFriend = { name: string; role: string; sheetIndex?: number; variant?: number; color: FriendColor };
type SoundName = "tap" | "pop" | "match" | "open" | "reset" | "draw" | "cycle";
type CartoonVideo = {
  addedAt: number;
  description?: string;
  duration?: string;
  embedUrl: string;
  id: string;
  kind: "iframe" | "video";
  local?: boolean;
  source: "Local file" | "YouTube" | "Vimeo" | "Video file";
  sourceUrl: string;
  title: string;
};
type ParsedCartoonLink = Omit<CartoonVideo, "addedAt" | "id" | "title">;
type PlayerProgress = {
  memoryWins: number;
  memoryBestMoves: number;
  bubbleBest: number;
  bubbleTotal: number;
  cartoonViews: number;
  drawingSessions: number;
  friendViews: number;
};
type QuestItem = { detail: string; done: boolean; label: string; room: PlayRoom };
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
const memorySymbols = ["gem", "star", "heart", "cube", "crown", "paint"];
const progressKey = "nika-app-progress-v1";
const cartoonLibraryKey = "nika-app-rumi-cartoons-v1";
const defaultProgress: PlayerProgress = {
  memoryWins: 0,
  memoryBestMoves: 0,
  bubbleBest: 0,
  bubbleTotal: 0,
  cartoonViews: 0,
  drawingSessions: 0,
  friendViews: 0
};
const localRumiCartoons: CartoonVideo[] = [
  {
    addedAt: 0,
    description: "Offline cartoon found on this PC and bundled for smooth playback.",
    duration: "8 min 37 sec",
    embedUrl: "/videos/starlight-ride.mp4",
    id: "local-rumi-starlight-ride",
    kind: "video",
    local: true,
    source: "Local file",
    sourceUrl: "/videos/starlight-ride.mp4",
    title: "RUMI 1"
  },
  {
    addedAt: 0,
    description: "Offline cartoon found on this PC and bundled for smooth playback.",
    duration: "13 min 11 sec",
    embedUrl: "/videos/magic-garden.mp4",
    id: "local-rumi-magic-garden",
    kind: "video",
    local: true,
    source: "Local file",
    sourceUrl: "/videos/magic-garden.mp4",
    title: "RUMI 2"
  }
];
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
  const [progress, setProgress] = useState<PlayerProgress>(defaultProgress);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [cartoons, setCartoons] = useState<CartoonVideo[]>([]);
  const [cartoonsLoaded, setCartoonsLoaded] = useState(false);
  const [selectedCartoonId, setSelectedCartoonId] = useState<string | null>(null);
  const [cartoonTitle, setCartoonTitle] = useState("");
  const [cartoonUrl, setCartoonUrl] = useState("");
  const [cartoonMessage, setCartoonMessage] = useState("Add a video link to build Rumi's watch list.");
  const [soundOn, setSoundOn] = useState(true);
  const [paintColor, setPaintColor] = useState(paintColors[0]);
  const [brushSize, setBrushSize] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  const bubbleLevel = Math.max(1, Math.floor(poppedBubbles / 15) + 1);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setProgress(loadProgress());
    setProgressLoaded(true);
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress, progressLoaded]);

  useEffect(() => {
    const storedCartoons = mergeCartoonLibrary(loadCartoons());
    setCartoons(storedCartoons);
    setSelectedCartoonId(storedCartoons[0]?.id ?? null);
    setCartoonsLoaded(true);
    setCartoonMessage(`${localRumiCartoons.length} offline cartoons ready`);
  }, []);

  useEffect(() => {
    if (!cartoonsLoaded) return;
    window.localStorage.setItem(cartoonLibraryKey, JSON.stringify(cartoons.filter((cartoon) => !cartoon.local)));
  }, [cartoons, cartoonsLoaded]);

  useEffect(() => {
    if (cartoons.length === 0) {
      if (selectedCartoonId) setSelectedCartoonId(null);
      return;
    }

    if (!selectedCartoonId || !cartoons.some((cartoon) => cartoon.id === selectedCartoonId)) {
      setSelectedCartoonId(cartoons[0].id);
    }
  }, [cartoons, selectedCartoonId]);

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

  function recordMemoryWin(moves: number) {
    setProgress((current) => ({
      ...current,
      memoryWins: current.memoryWins + 1,
      memoryBestMoves:
        current.memoryBestMoves === 0 ? moves : Math.min(current.memoryBestMoves, moves)
    }));
  }

  function openWindow(windowName: Exclude<GameWindowKind, null>) {
    playSound("open");
    if (windowName === "drawing") {
      setProgress((current) => ({ ...current, drawingSessions: current.drawingSessions + 1 }));
    }
    if (windowName === "roblox") {
      setProgress((current) => ({ ...current, friendViews: current.friendViews + 1 }));
    }
    if (windowName === "cartoons") {
      setProgress((current) => ({ ...current, cartoonViews: current.cartoonViews + 1 }));
    }
    setActiveWindow(windowName);
  }

  function toggleSound() {
    const nextSound = !soundOn;
    setSoundOn(nextSound);
    if (nextSound) playSound("open", true);
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

  function addCartoon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedLink = parseCartoonLink(cartoonUrl);
    if (!parsedLink) {
      setCartoonMessage("Use a YouTube, Vimeo, MP4, WebM, or OGG link.");
      playSound("reset");
      return;
    }

    const title = cartoonTitle.trim() || `Rumi Cartoon ${cartoons.filter((cartoon) => !cartoon.local).length + 1}`;
    const cartoon: CartoonVideo = {
      ...parsedLink,
      addedAt: Date.now(),
      id: `cartoon-${Date.now()}-${nextRandomId()}`,
      title: title.slice(0, 80)
    };

    setCartoons((current) => [cartoon, ...current].slice(0, 26));
    setSelectedCartoonId(cartoon.id);
    setCartoonTitle("");
    setCartoonUrl("");
    setCartoonMessage("Cartoon added");
    playSound("match");
  }

  function removeCartoon(cartoonId: string) {
    if (cartoons.find((cartoon) => cartoon.id === cartoonId)?.local) {
      setCartoonMessage("Offline Rumi cartoons stay in the app.");
      playSound("tap");
      return;
    }

    playSound("reset");
    setCartoons((current) => current.filter((cartoon) => cartoon.id !== cartoonId));
    setCartoonMessage("Cartoon removed");
  }

  function selectCartoon(cartoonId: string) {
    setSelectedCartoonId(cartoonId);
    playSound("tap");
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
    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

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
    if (progress.cartoonViews >= 4) return "Rumi theater star";
    if (progress.memoryWins >= 3) return "Memory master";
    if (progress.bubbleBest >= 45) return "Bubble champion";
    if (progress.friendViews >= 24) return "Friend expert";
    if (progress.drawingSessions >= 5) return "Art princess";
    return "Ready to play";
  }, [progress]);
  const totalScore =
    progress.memoryWins * 12 +
    progress.bubbleBest +
    progress.drawingSessions +
    progress.friendViews +
    progress.cartoonViews * 4;
  const questItems = useMemo(() => createQuestItems(progress), [progress]);
  const questDoneCount = questItems.filter((item) => item.done).length;
  const questPercent = Math.round((questDoneCount / questItems.length) * 100);
  const nextQuestRoom = questItems.find((item) => !item.done)?.room ?? "memory";
  const selectedCartoon = useMemo(
    () => cartoons.find((cartoon) => cartoon.id === selectedCartoonId) ?? cartoons[0] ?? null,
    [cartoons, selectedCartoonId]
  );
  const activityCards = useMemo(
    () => [
      {
        className: "memory-menu",
        detail: `${progress.memoryWins} wins | ${
          progress.memoryBestMoves > 0 ? `Best ${progress.memoryBestMoves}` : "New game"
        }`,
        icon: "M",
        key: "memory" as const,
        title: "Memory Match"
      },
      {
        className: "bubble-menu",
        detail: `Level ${bubbleLevel} now | Best ${progress.bubbleBest}`,
        icon: "B",
        key: "bubble" as const,
        title: "Bubble Pop"
      },
      {
        className: "drawing-menu",
        detail: `${progress.drawingSessions} art sessions`,
        icon: "D",
        key: "drawing" as const,
        title: "Drawing Pad"
      },
      {
        className: "friends-menu",
        detail: `${galleryFriends.length} friends | ${progress.friendViews} views`,
        icon: "F",
        key: "roblox" as const,
        title: "Roblox Friends"
      },
      {
        className: "cartoons-menu",
        detail: `${localRumiCartoons.length} offline | ${cartoons.length} total`,
        icon: "R",
        key: "cartoons" as const,
        title: "Rumi Cartoon"
      }
    ],
    [bubbleLevel, cartoons.length, progress]
  );

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
        <div className="top-actions">
          <div className="score-card" aria-label={`Nika status: ${rewardText}`}>
            <strong>{totalScore}</strong>
            <span>{rewardText}</span>
          </div>
          <button
            className={soundOn ? "sound-toggle active" : "sound-toggle"}
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Turn sounds off" : "Turn sounds on"}
          >
            {soundOn ? "Sound On" : "Sound Off"}
          </button>
          <button className="cartoon-toggle" type="button" onClick={() => openWindow("cartoons")}>
            Rumi Cartoon
          </button>
        </div>
      </header>

      <section className="main-menu" id="top" aria-label="Choose an activity">
        <div className="home-layout">
          <div className="home-primary">
            <div className="menu-title">
              <span>Today</span>
              <h1>Choose a Play Room</h1>
              <p>Pick a room and collect today&apos;s stars.</p>
              <div className="progress-strip" aria-label="Progress summary">
                <div>
                  <span>Progress</span>
                  <strong>{totalScore}</strong>
                </div>
                <div>
                  <span>Quests</span>
                  <strong>{questDoneCount}/{questItems.length}</strong>
                </div>
                <div>
                  <span>Cartoons</span>
                  <strong>{localRumiCartoons.length}</strong>
                </div>
                <div>
                  <span>Friends</span>
                  <strong>{Math.min(progress.friendViews, galleryFriends.length)}</strong>
                </div>
              </div>
            </div>

            <div className="menu-card-grid">
              {activityCards.map((activity) => (
                <button
                  className={`menu-card ${activity.className}`}
                  key={activity.key}
                  type="button"
                  onClick={() => openWindow(activity.key)}
                >
                  <span className="menu-icon" aria-hidden="true">{activity.icon}</span>
                  <strong>{activity.title}</strong>
                  <small>{activity.detail}</small>
                  {activity.key === "memory" && (
                    <span className="menu-memory-preview" aria-hidden="true">
                      {["G", "S", "H", "C"].map((symbol) => (
                        <span key={symbol}>{symbol}</span>
                      ))}
                    </span>
                  )}
                  {activity.key === "bubble" && (
                    <span className="menu-meter" aria-hidden="true">
                      <span style={{ width: `${Math.min((poppedBubbles % 15) * 6.67, 100)}%` }} />
                    </span>
                  )}
                  {activity.key === "drawing" && <span className="menu-sparkles" aria-hidden="true" />}
                  {activity.key === "roblox" && (
                    <span
                      className="menu-friend-preview"
                      style={friendImageStyle(galleryFriends[12])}
                      aria-hidden="true"
                    />
                  )}
                  {activity.key === "cartoons" && (
                    <span className="menu-cartoon-preview" aria-hidden="true">
                      <span>Play</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="home-side">
            <aside className="quest-panel" aria-label="Today quest">
              <div className="quest-head">
                <span>Today</span>
                <strong>Quest</strong>
              </div>
              <div className="quest-meter" aria-hidden="true">
                <span style={{ width: `${questPercent}%` }} />
              </div>
              <div className="quest-list">
                {questItems.map((item) => (
                  <div className={item.done ? "quest-item done" : "quest-item"} key={item.label}>
                    <span aria-hidden="true">{item.done ? "OK" : "Go"}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </div>
                  </div>
                ))}
              </div>
              <button className="quest-action" type="button" onClick={() => openWindow(nextQuestRoom)}>
                {questDoneCount === questItems.length ? "Play again" : "Start quest"}
              </button>
            </aside>

            <aside className="spotlight-panel cartoon-spotlight" aria-label="Rumi cartoon spotlight">
              <span className="cartoon-spotlight-screen" aria-hidden="true">
                <span />
              </span>
              <span>Rumi Theater</span>
              <strong>{localRumiCartoons.length} offline videos</strong>
              <small>Ready from this PC, with room for more internet links.</small>
              <button type="button" onClick={() => openWindow("cartoons")}>
                Watch cartoons
              </button>
            </aside>
          </div>
        </div>
      </section>

      {activeWindow === "memory" && (
        <GameWindow
          title="Memory Match"
          detail={`${progress.memoryWins} wins | best ${bestMovesLabel(progress.memoryBestMoves)}`}
          onClose={() => setActiveWindow(null)}
        >
          <MemoryMatchGame
            bestMoves={progress.memoryBestMoves}
            onSound={playSound}
            onWin={recordMemoryWin}
          />
        </GameWindow>
      )}

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
          title="Roblox Friends"
          detail={`${galleryFriends.length} original friends to view`}
          onClose={() => setActiveWindow(null)}
        >
          <RobloxGallery windowed onFriendView={recordFriendView} onSound={playSound} />
        </GameWindow>
      )}

      {activeWindow === "cartoons" && (
        <GameWindow
          title="Rumi Cartoon"
          detail={`${localRumiCartoons.length} offline | ${cartoons.length} total cartoons`}
          onClose={() => setActiveWindow(null)}
        >
          <RumiCartoonPanel
            cartoonMessage={cartoonMessage}
            cartoonTitle={cartoonTitle}
            cartoonUrl={cartoonUrl}
            cartoons={cartoons}
            selectedCartoon={selectedCartoon}
            onAddCartoon={addCartoon}
            onRemoveCartoon={removeCartoon}
            onSelectCartoon={selectCartoon}
            setCartoonTitle={setCartoonTitle}
            setCartoonUrl={setCartoonUrl}
          />
        </GameWindow>
      )}
    </main>
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

function RumiCartoonPanel({
  cartoonMessage,
  cartoonTitle,
  cartoonUrl,
  cartoons,
  onAddCartoon,
  onRemoveCartoon,
  onSelectCartoon,
  selectedCartoon,
  setCartoonTitle,
  setCartoonUrl
}: {
  cartoonMessage: string;
  cartoonTitle: string;
  cartoonUrl: string;
  cartoons: CartoonVideo[];
  onAddCartoon: (event: React.FormEvent<HTMLFormElement>) => void;
  onRemoveCartoon: (cartoonId: string) => void;
  onSelectCartoon: (cartoonId: string) => void;
  selectedCartoon: CartoonVideo | null;
  setCartoonTitle: (value: string) => void;
  setCartoonUrl: (value: string) => void;
}) {
  return (
    <article className="cartoon-panel">
      <section className="cartoon-player-card" aria-label="Rumi cartoon player">
        <div className="cartoon-screen">
          {selectedCartoon ? (
            selectedCartoon.kind === "video" ? (
              <video controls playsInline preload="metadata" src={selectedCartoon.embedUrl} />
            ) : (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                src={selectedCartoon.embedUrl}
                title={selectedCartoon.title}
              />
            )
          ) : (
            <div className="cartoon-empty-screen">
              <span aria-hidden="true">R</span>
              <strong>Rumi Cartoon</strong>
              <small>No cartoons saved yet</small>
            </div>
          )}
        </div>

        <div className="cartoon-player-meta">
          <div>
            <span>{selectedCartoon?.source ?? "Watch List"}</span>
            <strong>{selectedCartoon?.title ?? "Rumi's cartoon shelf"}</strong>
            {selectedCartoon && [selectedCartoon.duration, selectedCartoon.description].some(Boolean) && (
              <small>
                {[selectedCartoon.duration, selectedCartoon.description].filter(Boolean).join(" | ")}
              </small>
            )}
          </div>
          {selectedCartoon && (
            <a href={selectedCartoon.sourceUrl} target="_blank" rel="noreferrer">
              {selectedCartoon.local ? "Open file" : "Open source"}
            </a>
          )}
        </div>
      </section>

      <section className="cartoon-library-card" aria-label="Rumi cartoon library">
        <div className="cartoon-library-head">
          <span>Library</span>
          <strong>{cartoons.length}</strong>
        </div>

        <form className="cartoon-form" onSubmit={onAddCartoon}>
          <label>
            <span>Title</span>
            <input
              maxLength={80}
              onChange={(event) => setCartoonTitle(event.target.value)}
              placeholder="Rumi Cartoon"
              type="text"
              value={cartoonTitle}
            />
          </label>
          <label>
            <span>Video URL</span>
            <input
              inputMode="url"
              onChange={(event) => setCartoonUrl(event.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="text"
              value={cartoonUrl}
            />
          </label>
          <button type="submit">Add cartoon</button>
          <p className="cartoon-message" aria-live="polite">{cartoonMessage}</p>
        </form>

        <div className="cartoon-list" aria-label="Saved Rumi cartoons">
          {cartoons.length === 0 ? (
            <div className="cartoon-list-empty">
              <strong>Empty list</strong>
              <span>Add the first Rumi cartoon link.</span>
            </div>
          ) : (
            cartoons.map((cartoon) => (
              <div
                className={selectedCartoon?.id === cartoon.id ? "cartoon-list-item active" : "cartoon-list-item"}
                key={cartoon.id}
              >
                <button type="button" onClick={() => onSelectCartoon(cartoon.id)}>
                  <span>{cartoon.source}</span>
                  <strong>{cartoon.title}</strong>
                  {cartoon.duration && <small>{cartoon.duration}</small>}
                </button>
                {cartoon.local ? (
                  <span className="cartoon-local-pill">Offline</span>
                ) : (
                  <button
                    className="cartoon-remove"
                    type="button"
                    onClick={() => onRemoveCartoon(cartoon.id)}
                    aria-label={`Remove ${cartoon.title}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </article>
  );
}

function MemoryMatchGame({
  bestMoves,
  onSound,
  onWin
}: {
  bestMoves: number;
  onSound?: (sound: SoundName) => void;
  onWin: (moves: number) => void;
}) {
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [openCards, setOpenCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const winRecordedRef = useRef(false);

  const matchedCount = cards.filter((card) => card.matched).length;
  const allMatched = matchedCount === cards.length;

  useEffect(() => {
    if (openCards.length !== 2) return;

    const [firstId, secondId] = openCards;
    const first = cards.find((card) => card.id === firstId);
    const second = cards.find((card) => card.id === secondId);

    if (!first || !second) return;

    const timer = window.setTimeout(() => {
      if (first.value === second.value) {
        onSound?.("match");
        setCards((current) =>
          current.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, matched: true } : card
          )
        );
      }
      setOpenCards([]);
    }, 580);

    return () => window.clearTimeout(timer);
  }, [cards, onSound, openCards]);

  useEffect(() => {
    if (!allMatched || winRecordedRef.current) return;

    winRecordedRef.current = true;
    setCelebrating(true);
    onSound?.("match");
    onWin(moves);
  }, [allMatched, moves, onSound, onWin]);

  function flipCard(id: number) {
    const card = cards.find((item) => item.id === id);
    if (!card || card.matched || openCards.includes(id) || openCards.length === 2) return;

    onSound?.("tap");
    const next = [...openCards, id];
    setOpenCards(next);
    if (next.length === 2) setMoves((current) => current + 1);
  }

  function resetMemory() {
    onSound?.("reset");
    winRecordedRef.current = false;
    setCards(shuffleCards());
    setOpenCards([]);
    setMoves(0);
    setCelebrating(false);
  }

  return (
    <article className="memory-panel">
      <div className="game-head">
        <div>
          <h2>Memory Match</h2>
          <p>{allMatched ? "All matched" : `${matchedCount / 2} of ${cards.length / 2} pairs found`}</p>
        </div>
        <button type="button" onClick={resetMemory}>
          Shuffle
        </button>
      </div>

      <div className="memory-status" aria-label="Memory Match score">
        <div>
          <span>Moves</span>
          <strong>{moves}</strong>
        </div>
        <div>
          <span>Best</span>
          <strong>{bestMoves > 0 ? bestMoves : "-"}</strong>
        </div>
        <div>
          <span>Pairs</span>
          <strong>{matchedCount / 2}</strong>
        </div>
      </div>

      <div className="memory-board">
        {cards.map((card) => {
          const visible = card.matched || openCards.includes(card.id);
          return (
            <button
              className={
                visible
                  ? `memory-card open ${card.matched ? "matched" : ""} ${card.accent}`
                  : "memory-card"
              }
              key={card.id}
              onClick={() => flipCard(card.id)}
              type="button"
              aria-label={visible ? `${cardLabel(card.value)} card` : "Hidden card"}
            >
              <span>{visible ? cardSymbol(card.value) : "?"}</span>
              <small>{visible ? cardLabel(card.value) : "Find me"}</small>
            </button>
          );
        })}
      </div>

      {celebrating && <strong className="memory-celebration">You matched them!</strong>}
    </article>
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

function shuffleCards() {
  return memorySymbols
    .flatMap((value, index) => [
      { id: index * 2, value, matched: false, accent: bubbleColors[index % bubbleColors.length] },
      { id: index * 2 + 1, value, matched: false, accent: bubbleColors[index % bubbleColors.length] }
    ])
    .sort(() => Math.random() - 0.5);
}

function cardSymbol(value: string) {
  const symbols: Record<string, string> = {
    crown: "R",
    cube: "C",
    gem: "G",
    heart: "H",
    paint: "P",
    star: "S"
  };
  return symbols[value] ?? "?";
}

function cardLabel(value: string) {
  const labels: Record<string, string> = {
    crown: "Crown",
    cube: "Cube",
    gem: "Gem",
    heart: "Heart",
    paint: "Paint",
    star: "Star"
  };
  return labels[value] ?? "Card";
}

function bestMovesLabel(moves: number) {
  return moves > 0 ? `${moves} moves` : "none yet";
}

function createQuestItems(progress: PlayerProgress): QuestItem[] {
  return [
    {
      detail: progress.memoryWins > 0 ? `${progress.memoryWins} wins saved` : "Finish one board",
      done: progress.memoryWins > 0,
      label: "Win Memory Match",
      room: "memory"
    },
    {
      detail: `${Math.min(progress.bubbleTotal, 20)} / 20 bubbles`,
      done: progress.bubbleTotal >= 20,
      label: "Pop 20 Bubbles",
      room: "bubble"
    },
    {
      detail: progress.drawingSessions > 0 ? `${progress.drawingSessions} art sessions` : "Open the canvas",
      done: progress.drawingSessions > 0,
      label: "Make Art",
      room: "drawing"
    },
    {
      detail: `${Math.min(progress.friendViews, 5)} / 5 friend views`,
      done: progress.friendViews >= 5,
      label: "Meet 5 Friends",
      room: "roblox"
    },
    {
      detail: progress.cartoonViews > 0 ? `${progress.cartoonViews} cartoon visits` : "Open Rumi Theater",
      done: progress.cartoonViews > 0,
      label: "Watch Rumi",
      room: "cartoons"
    }
  ];
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

function loadCartoons(): CartoonVideo[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(cartoonLibraryKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      const cartoon = normalizeStoredCartoon(item);
      return cartoon ? [cartoon] : [];
    });
  } catch {
    return [];
  }
}

function mergeCartoonLibrary(savedCartoons: CartoonVideo[]) {
  const known = new Set(localRumiCartoons.map((cartoon) => cartoon.id));
  const knownSources = new Set(localRumiCartoons.map((cartoon) => cartoon.sourceUrl));
  const customCartoons = savedCartoons.filter((cartoon) => {
    if (cartoon.local) return false;
    if (known.has(cartoon.id) || knownSources.has(cartoon.sourceUrl)) return false;
    known.add(cartoon.id);
    knownSources.add(cartoon.sourceUrl);
    return true;
  });

  return [...localRumiCartoons, ...customCartoons].slice(0, 26);
}

function normalizeStoredCartoon(item: unknown): CartoonVideo | null {
  if (!item || typeof item !== "object") return null;

  const stored = item as Partial<CartoonVideo>;
  const parsedLink = parseCartoonLink(String(stored.sourceUrl || stored.embedUrl || ""));
  const title = String(stored.title || "").trim();
  if (!parsedLink || !title) return null;

  return {
    ...parsedLink,
    addedAt: Number(stored.addedAt) || Date.now(),
    id: String(stored.id || `cartoon-${Date.now()}-${nextRandomId()}`),
    title: title.slice(0, 80)
  };
}

function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return defaultProgress;

  try {
    const stored = window.localStorage.getItem(progressKey);
    if (!stored) return defaultProgress;
    const parsed = JSON.parse(stored) as Partial<PlayerProgress>;
    return {
      memoryWins: Number(parsed.memoryWins) || 0,
      memoryBestMoves: Number(parsed.memoryBestMoves) || 0,
      bubbleBest: Number(parsed.bubbleBest) || 0,
      bubbleTotal: Number(parsed.bubbleTotal) || 0,
      cartoonViews: Number(parsed.cartoonViews) || 0,
      drawingSessions: Number(parsed.drawingSessions) || 0,
      friendViews: Number(parsed.friendViews) || 0
    };
  } catch {
    return defaultProgress;
  }
}

function parseCartoonLink(value: string): ParsedCartoonLink | null {
  const url = normalizeHttpUrl(value);
  if (!url) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const youtubeId = extractYouTubeId(url, host);
  if (youtubeId) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      kind: "iframe",
      source: "YouTube",
      sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`
    };
  }

  const vimeoId = extractVimeoId(url, host);
  if (vimeoId) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      kind: "iframe",
      source: "Vimeo",
      sourceUrl: `https://vimeo.com/${vimeoId}`
    };
  }

  if (/\.(mp4|webm|ogg)(?:$|[?#])/i.test(url.href)) {
    return {
      embedUrl: url.href,
      kind: "video",
      source: "Video file",
      sourceUrl: url.href
    };
  }

  return null;
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const hasProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed);
    const url = new URL(hasProtocol ? trimmed : `https://${trimmed}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function extractYouTubeId(url: URL, host: string) {
  const isYouTube = host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com";
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return isYouTubeId(id) ? id : null;
  }
  if (!isYouTube) return null;

  const pathParts = url.pathname.split("/").filter(Boolean);
  const watchId = url.searchParams.get("v");
  const pathId =
    pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live"
      ? pathParts[1]
      : undefined;
  const id = watchId || pathId;
  return isYouTubeId(id) ? id : null;
}

function extractVimeoId(url: URL, host: string) {
  const isVimeo = host === "vimeo.com" || host.endsWith(".vimeo.com");
  if (!isVimeo) return null;

  const id = url.pathname.split("/").filter(Boolean).reverse().find((part) => /^\d+$/.test(part));
  return id ?? null;
}

function isYouTubeId(id: string | null | undefined) {
  return Boolean(id && /^[a-zA-Z0-9_-]{11}$/.test(id));
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
