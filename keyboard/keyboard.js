/**
 * keyboard/keyboard.js — B3~E5 11건반 (흰건반 11 + 검은건반 7) 모듈
 * 첨부 이미지 규격: 순백색 건반, '도'(C4,C5) 오렌지 포인트, Stage 3 라벨 자동 숨김
 */

const KEYBOARD = (() => {
  /**
   * 흰건반 정의: [음명, MIDI 번호, 기준 '도' 여부]
   * B3(59) ~ E5(76) 11개
   */
  const WHITE_KEYS = [
    { name: '시',  midi: 59, note: 'B3', isDo: false },
    { name: '도',  midi: 60, note: 'C4', isDo: true  },
    { name: '레',  midi: 62, note: 'D4', isDo: false },
    { name: '미',  midi: 64, note: 'E4', isDo: false },
    { name: '파',  midi: 65, note: 'F4', isDo: false },
    { name: '솔',  midi: 67, note: 'G4', isDo: false },
    { name: '라',  midi: 69, note: 'A4', isDo: false },
    { name: '시',  midi: 71, note: 'B4', isDo: false },
    { name: '도',  midi: 72, note: 'C5', isDo: true  },
    { name: '레',  midi: 74, note: 'D5', isDo: false },
    { name: '미',  midi: 76, note: 'E5', isDo: false },
  ];

  /**
   * 검은건반 정의: [앞 흰건반 인덱스, 음명, MIDI 번호, 반음 오프셋]
   * B3~C5, C5~E5 구간 검은건반
   * 피아노 건반 배열 규칙에 따라 각 검은건반은 해당 흰건반 위에 위치
   */
  const BLACK_KEYS = [
    // C4-D4 사이
    { whiteIndex: 1, name: 'C#4', midi: 61, offset: 0.5 },  // C4 위 (C#4)
    { whiteIndex: 2, name: 'D#4', midi: 63, offset: 0.5 },  // D4 위 (D#4)
    // F4-G4 사이
    { whiteIndex: 4, name: 'F#4', midi: 66, offset: 0.5 },  // F4 위 (F#4)
    { whiteIndex: 5, name: 'G#4', midi: 68, offset: 0.5 },  // G4 위 (G#4)
    // A4-B4 사이
    { whiteIndex: 6, name: 'A#4', midi: 70, offset: 0.5 },  // A4 위 (A#4)
    // C5-D5 사이
    { whiteIndex: 8, name: 'C#5', midi: 73, offset: 0.5 },  // C5 위 (C#5)
    { whiteIndex: 9, name: 'D#5', midi: 75, offset: 0.5 },  // D5 위 (D#5)
  ];

  const TOTAL_BLACK = BLACK_KEYS.length;

  // ── 상태 ────────────────────────────────────────────────────────
  let showLabels = true;        // 계이름 라벨 표시 여부
  let highlightNotes = new Set(); // 강조할 MIDI 노트 집합
  let onKeyDown = null;         // 건반 터치 시 호출 콜백
  let container = null;

  // ── 초기 설정 ────────────────────────────────────────────────────
  function init(opts = {}) {
    onKeyDown = opts.onKeyDown ?? null;
    container = opts.container ?? null;
  }

  // ── 건반 렌더링 ──────────────────────────────────────────────────
  function render() {
    if (!container) return;

    const containerWidth = container.clientWidth || 400;
    const containerHeight = container.clientHeight || 300;

    // 가용 높이: 상하 padding(4px×2)만 제외, 라벨은 건반 내부에 포함되므로 별도 제외하지 않음
    const availableHeight = containerHeight - 8;
    // 건반 높이 = 가용 높이 (세로 공간 최대한 활용)
    const targetKeyHeight = Math.max(80, availableHeight);
    // 건반 비율(1.7) 기준 너비
    const targetKeyWidthByHeight = targetKeyHeight / 1.7;
    // 컨테이너 너비에 11개 건반이 모두 들어가야 하는 최대 너비 (최소 28px)
    const maxKeyWidthByWidth = Math.max(28, containerWidth / WHITE_KEYS.length);
    // 두 기준 중 작은 쪽 선택: 높이는 목표대로, 너비는 컨테이너 초과 방지
    const keyWidth = Math.min(targetKeyWidthByHeight, maxKeyWidthByWidth);

    const wrapper = document.createElement('div');
    wrapper.id = 'keyboard-wrapper';
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 4px 0;
      position: relative;
    `;

    // 건반 행 (흰건반 + 검은건반)
    const keyHeight = keyWidth * 1.7;
    const keysRow = document.createElement('div');
    keysRow.id = 'keys-row';
    keysRow.style.cssText = `
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
      width: fit-content;
      position: relative;
      height: ${keyHeight}px;
      margin: 0 auto;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    `;

    // 흰건반 렌더링 (라벨을 건반 위에 포함)
    WHITE_KEYS.forEach((key, idx) => {
      const el = document.createElement('div');
      el.className = 'white-key';
      el.dataset.midi = key.midi;
      el.dataset.note = key.note;
      el.dataset.index = idx;

      // 키 내부에 라벨 span 포함 (계이름만, 음이름 제외)
      const label = document.createElement('span');
      label.className = 'key-label';
      if (key.isDo) {
        label.style.cssText = `
          color: #f59e0b;
          text-shadow: 0 1px 2px rgba(245,158,11,0.4);
          font-size: ${Math.max(11, keyWidth * 0.35)}px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding-bottom: 2px;
        `;
      } else {
        label.style.cssText = `
          color: rgba(80,90,120,0.85);
          font-size: ${Math.max(11, keyWidth * 0.35)}px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding-bottom: 2px;
        `;
      }
      label.textContent = key.name;

      el.style.cssText = `
        width: ${keyWidth}px;
        height: ${keyHeight}px;
        background: linear-gradient(180deg, #ffffff 0%, #f0f4ff 85%, #e8ecf4 100%);
        border-radius: 0 0 8px 8px;
        border: 1px solid rgba(255,255,255,0.8);
        box-shadow:
          0 2px 3px rgba(0,0,0,0.15),
          0 8px 12px rgba(0,0,0,0.18),
          inset 0 -2px 4px rgba(150,180,220,0.35);
        cursor: pointer;
        position: relative;
        z-index: 1;
        transition: transform 0.06s ease, box-shadow 0.06s ease, background 0.15s ease;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: 6px;
      `;
      el.appendChild(label);
      keysRow.appendChild(el);
    });

    // 검은건반 렌더링
    BLACK_KEYS.forEach((bk) => {
      const el = document.createElement('div');
      el.className = 'black-key';
      el.dataset.midi = bk.midi;
      el.dataset.note = bk.name;
      el.dataset.whiteIndex = bk.whiteIndex;
      el.dataset.index = WHITE_KEYS.length + TOTAL_BLACK; // 고유 인덱스

      const bw = Math.max(16, keyWidth * 0.58);
      const bh = Math.max(16, keyHeight * 0.56);

      el.style.cssText = `
        width: ${bw}px;
        height: ${bh}px;
        background: linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 50%, #111122 100%);
        border-radius: 0 0 4px 4px;
        position: absolute;
        top: 0;
        z-index: 3;
        cursor: pointer;
        box-shadow:
          0 3px 5px rgba(0,0,0,0.55),
          0 1px 2px rgba(0,0,0,0.8),
          inset 0 -2px 3px rgba(80,80,120,0.3);
        transform: translateX(-50%);
        transition: transform 0.06s ease, box-shadow 0.06s ease;
        touch-action: none;
      `;

      // 검은건반 위치: 해당 흰건반 기준으로 offset 적용
      const targetWhite = keysRow.children[bk.whiteIndex];
      if (targetWhite) {
        const rect = targetWhite.getBoundingClientRect();
        const parentRect = keysRow.getBoundingClientRect();
        // offset: 흰건반 너비의 65% 지점 (검은건반 중심)
        const leftPx = bk.whiteIndex * keyWidth + keyWidth * bk.offset - bw / 2;
        el.style.left = `${leftPx}px`;
      }

      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleKeyDown(parseInt(el.dataset.midi));
      });
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        handleKeyDown(parseInt(el.dataset.midi), touch);
      }, { passive: false });

      keysRow.appendChild(el);
    });

    wrapper.appendChild(keysRow);

    // 기존 내용 대체
    container.innerHTML = '';
    container.appendChild(wrapper);

    // ── 이벤트 바인딩 ────────────────────────────────────────────────
    const whiteEls = keysRow.querySelectorAll('.white-key');
    whiteEls.forEach((el) => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleKeyDown(parseInt(el.dataset.midi));
      });
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        handleKeyDown(parseInt(el.dataset.midi), touch);
      }, { passive: false });
    });

    // 키보드(PC) 이벤트: C4=도, D4=레, ... 매핑
    const keyMap = {
      'a': 60, 's': 62, 'd': 64, 'f': 65, 'g': 67, 'h': 69, 'j': 71,
      'k': 72, 'l': 74,
      // 검은건반
      'w': 61, 'e': 63, 't': 66, 'y': 68, 'u': 70, 'o': 73, 'p': 75,
    };
    document.addEventListener('keydown', (e) => {
      const midi = keyMap[e.key.toLowerCase()];
      if (midi && !e.repeat) {
        e.preventDefault();
        handleKeyDown(midi);
      }
    });

    // 터치 이동 중 건반 추적 (스크롤 방지, 글리산도 방지용)
    let activeTouchId = null;
    document.addEventListener('touchmove', (e) => {
      if (activeTouchId === null) return;
      const touch = Array.from(e.changedTouches).find(t => t.identifier === activeTouchId);
      if (!touch) return;

      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('white-key')) {
        const midi = parseInt(el.dataset.midi);
        if (highlightNotes.has(midi)) handleKeyDown(midi);
      } else if (el && el.classList.contains('black-key')) {
        const midi = parseInt(el.dataset.midi);
        if (highlightNotes.has(midi)) handleKeyDown(midi);
      }
    }, { passive: true });
  }

  // ── 건반 터치 핸들러 ──────────────────────────────────────────────
  function handleKeyDown(midi, touchEvent) {
    if (!onKeyDown) return;

    // 하이라이트 중인 건반만 반응 (청음 모드: 정답 건반만 활성화)
    if (highlightNotes.size > 0 && !highlightNotes.has(midi)) {
      // 오답: 반짝임 이펙트
      const el = getKeyElement(midi);
      if (el) {
        el.style.transition = 'background 0.1s ease';
        el.style.background = 'rgba(244,63,94,0.35)';
        setTimeout(() => {
          if (el) {
            el.style.background = '';
            el.style.transition = '';
          }
        }, 200);
      }
      onKeyDown(midi, 'wrong');
      return;
    }

    // 정답 터치
    const el = getKeyElement(midi);
    if (el) {
      // 터치/키다운 피드백
      el.style.transform = 'translateY(2px)';
      el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2), inset 0 -3px 6px rgba(0,0,0,0.18)';
      if (el.classList.contains('white-key')) {
        el.style.background = 'linear-gradient(180deg, #f5f9ff 0%, #fff 60%, #ecf0f7 100%)';
      } else {
        el.style.background = 'linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 50%, #222233 100%)';
      }
      setTimeout(() => {
        if (el) {
          el.style.transform = '';
          el.style.boxShadow = '';
          el.style.background = '';
        }
      }, 80);
    }

    onKeyDown(midi, 'correct', touchEvent);
  }

  // ── 건반 요소 조회 ────────────────────────────────────────────────
  function getKeyElement(midi) {
    const wrapper = document.getElementById('keyboard-wrapper');
    if (!wrapper) return null;
    return wrapper.querySelector(`[data-midi="${midi}"]`);
  }

  // ── 건반 하이라이트 (정답/오답 피드백용) ──────────────────────────
  function setHighlightNotes(midiSet) {
    highlightNotes = new Set(midiSet);
  }

  function clearHighlight() {
    highlightNotes.clear();
  }

  // ── 계이름 라벨 표시/숨김 ──────────────────────────────────────────
  function setLabelsVisible(visible) {
    showLabels = visible;
    const labels = document.querySelectorAll('.key-label');
    labels.forEach(label => {
      label.style.opacity = visible ? '1' : '0';
      label.style.pointerEvents = visible ? 'auto' : 'none';
    });
  }

  function isLabelsVisible() {
    return showLabels;
  }

  // ── 건반 강조 (멜로디 청음 시 정답 건반 강조) ────────────────────
  function flashKey(midi, color = '#06b6d4', duration = 300) {
    const el = getKeyElement(midi);
    if (!el) return;
    const original = el.style.boxShadow;
    el.style.boxShadow = `0 0 12px ${color}, 0 0 24px ${color}80, ${original}`;
    el.style.transition = 'box-shadow 0.1s ease';
    setTimeout(() => {
      el.style.boxShadow = original;
      el.style.transition = '';
    }, duration);
  }

  function flashKeys(midiList, color = '#06b6d4', duration = 300) {
    midiList.forEach(midi => flashKey(midi, color, duration));
  }

  // ── 리사이즈 대응 ──────────────────────────────────────────────────
  function handleResize() {
    // 건반 너비 재계산은 렌더 시점에 처리됨
  }

  return {
    init,
    render,
    handleKeyDown,
    getKeyElement,
    setHighlightNotes,
    clearHighlight,
    setLabelsVisible,
    isLabelsVisible,
    flashKey,
    flashKeys,
    WHITE_KEYS,
    BLACK_KEYS,
    handleResize,
  };
})();

// export for production
if (typeof exportModules === 'function') {
  exportModules('keyboard', KEYBOARD);
}
window.KEYBOARD = KEYBOARD;
