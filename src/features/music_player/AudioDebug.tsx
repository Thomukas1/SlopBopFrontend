import { useEffect, useRef, useState } from 'react';

/**
 * TEMPORARY on-screen audio debug overlay (iOS start-offset investigation).
 *
 * Self-contained and easy to remove: delete this file and the single
 * <AudioDebug /> line in src/main.tsx. It patches HTMLMediaElement.prototype so
 * it also sees the detached `new Audio()` element the player uses, logging every
 * play()/pause()/load() call, src/currentTime write, and media event with the
 * element's currentTime — so the "starts at ~2s" behaviour is visible live on
 * the phone. Tap a song, then hit COPY and paste the log back.
 */
// Same song, two forms of its URL. REDIRECT is what the DB/app hands <audio>
// today (a 302 → text/plain → sandbox). FINAL is that redirect pre-resolved.
// Tapping each plays a BARE new Audio() — no context/queue/effects — so whatever
// happens is purely WebKit's native media pipeline, not our code.
const REDIRECT_URL = 'https://turbo-gateway.com/HoEHJTs-r3kw5h2XkINfiSUDx-kLFJys_ae3rW8aQzs';
const FINAL_URL = 'https://d2aqojj3h2xxsmhgdwlzba27resqhr7jbmkjzlh5u63223y2im5q.turbo-gateway.com/HoEHJTs-r3kw5h2XkINfiSUDx-kLFJys_ae3rW8aQzs';

export default function AudioDebug() {
  const [lines, setLines] = useState<string[]>([]);
  const t0 = useRef<number | null>(null);
  const testRef = useRef<HTMLAudioElement | null>(null);

  const playBare = (url: string, label: string) => {
    testRef.current?.pause();
    const a = new Audio(url);
    testRef.current = a;
    a.addEventListener('playing', () =>
      // eslint-disable-next-line no-console
      console.log(`[TEST ${label}] playing ct=${a.currentTime.toFixed(2)}`));
    a.play().catch(() => {});
  };

  useEffect(() => {
    const proto = HTMLMediaElement.prototype as any;

    const log = (msg: string) => {
      if (t0.current == null) t0.current = performance.now();
      const t = ((performance.now() - t0.current) / 1000).toFixed(2);
      setLines((prev) => [...prev.slice(-80), `+${t}s  ${msg}`]);
    };

    const origPlay = proto.play;
    const origPause = proto.pause;
    const origLoad = proto.load;
    const ctDesc = Object.getOwnPropertyDescriptor(proto, 'currentTime')!;
    const srcDesc = Object.getOwnPropertyDescriptor(proto, 'src')!;

    const hookEvents = (a: HTMLMediaElement) => {
      if ((a as any).__dbg) return;
      (a as any).__dbg = true;
      const evs = [
        'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'playing',
        'seeking', 'seeked', 'waiting', 'stalled', 'pause', 'ended', 'emptied',
      ];
      evs.forEach((ev) =>
        a.addEventListener(ev, () =>
          log(`• ${ev}  ct=${a.currentTime.toFixed(2)} dur=${(a.duration || 0).toFixed(2)}`),
        ),
      );
      let n = 0;
      a.addEventListener('timeupdate', () => {
        if (n++ < 6) log(`• timeupdate  ct=${a.currentTime.toFixed(2)}`);
      });
    };

    proto.play = function (this: HTMLMediaElement) {
      hookEvents(this);
      log(`▶ play()  ct=${this.currentTime.toFixed(2)}`);
      return origPlay.call(this);
    };
    proto.pause = function (this: HTMLMediaElement) {
      log(`⏸ pause()  ct=${this.currentTime.toFixed(2)}`);
      return origPause.call(this);
    };
    proto.load = function (this: HTMLMediaElement) {
      log('↻ load()');
      return origLoad.call(this);
    };
    Object.defineProperty(proto, 'currentTime', {
      configurable: true,
      get: ctDesc.get,
      set(this: HTMLMediaElement, v: number) {
        log(`✎ set currentTime = ${Number(v).toFixed(2)}`);
        return ctDesc.set!.call(this, v);
      },
    });
    Object.defineProperty(proto, 'src', {
      configurable: true,
      get: srcDesc.get,
      set(this: HTMLMediaElement, v: string) {
        log(`✎ set src = …${String(v).slice(-14)}`);
        return srcDesc.set!.call(this, v);
      },
    });

    return () => {
      proto.play = origPlay;
      proto.pause = origPause;
      proto.load = origLoad;
      Object.defineProperty(proto, 'currentTime', ctDesc);
      Object.defineProperty(proto, 'src', srcDesc);
    };
  }, []);

  const copy = () => {
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999,
        maxHeight: '42vh', overflowY: 'auto',
        background: 'rgba(0,0,0,0.88)', color: '#39ff14',
        font: '10px/1.4 monospace', padding: '6px 8px', whiteSpace: 'pre-wrap',
      }}
    >
      <div style={{ position: 'sticky', top: 0, display: 'flex', gap: 8, marginBottom: 4 }}>
        <button
          onClick={copy}
          style={{ background: '#39ff14', color: '#000', border: 0, padding: '3px 10px', fontWeight: 700, borderRadius: 4 }}
        >
          COPY
        </button>
        <button
          onClick={() => { setLines([]); t0.current = null; }}
          style={{ background: '#333', color: '#fff', border: 0, padding: '3px 10px', borderRadius: 4 }}
        >
          CLEAR
        </button>
        <span style={{ color: '#888', alignSelf: 'center' }}>audio debug</span>
      </div>
      <div style={{ position: 'sticky', top: 30, display: 'flex', gap: 8, marginBottom: 4 }}>
        <button
          onClick={() => playBare(REDIRECT_URL, 'REDIRECT')}
          style={{ background: '#ff5533', color: '#000', border: 0, padding: '3px 8px', fontWeight: 700, borderRadius: 4 }}
        >
          ▶ REDIRECT url
        </button>
        <button
          onClick={() => playBare(FINAL_URL, 'FINAL')}
          style={{ background: '#33aaff', color: '#000', border: 0, padding: '3px 8px', fontWeight: 700, borderRadius: 4 }}
        >
          ▶ FINAL url
        </button>
        <button
          onClick={() => testRef.current?.pause()}
          style={{ background: '#333', color: '#fff', border: 0, padding: '3px 8px', borderRadius: 4 }}
        >
          ■ stop
        </button>
      </div>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}
