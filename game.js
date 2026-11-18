/**
 * game.js — 도레미 절대음감 챌린지 메인 게임 로직
 * FSM: LOBBY → INTRO → LISTENING → PHRASE_NEXT → STAGE_CLEAR → RESULT
 */

(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);

  const dom = {};

  const state = {
    phase: 'LOBBY',
    currentStageIndex: 0,
    currentPhraseIndex: 0,
    totalPhrasesCleared: 0,
    stagesCleared: new Set(),
    hearts: 3,
    maxHearts: 3,
    sheetChances: 1,
    maxSheetChances: 2,
    usedSheetChanceThisStage: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    totalNotesCorrect: 0,
    totalNotesAttempted: 0,
    isMelodyPlaying: false,
    pendingNoteIndex: 0,
    correctMidiSet: new Set(),
    isAcceptingInput: false,
    gameResult: null,
  };

  let Synth, KEYBOARD, STAGES, SupabaseRank;

  const formatScore = (n) => n.toLocaleString('ko-KR');
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const showView = (id) => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const t = document.getElementById(id);
    if (t) t.classList.add('active');
  };

  const renderHearts = () => {
    dom.heartSlots.innerHTML = '';
    for (let i = 0; i < state.maxHearts; i++) {
      const s = document.createElement('span');
      s.className = 'heart-slot ' + (i < state.hearts ? 'full' : 'empty');
      s.textContent = '\u2764\uFE0F';
      dom.heartSlots.appendChild(s);
    }
  };

  const renderScore = () => { dom.scoreValue.textContent = formatScore(state.score); };

  const renderCombo = () => {
    if (state.combo >= 2) {
      dom.comboChip.classList.add('visible');
      dom.comboValue.textContent = String(state.combo);
    } else {
      dom.comboChip.classList.remove('visible');
    }
  };

  const renderChanceBtn = () => {
    const has = state.sheetChances > 0 && !state.usedSheetChanceThisStage;
    dom.chanceBtn.disabled = !has;
    dom.chanceCount.textContent = state.sheetChances;
  };

  const renderPhraseProgress = (si, ci) => {
    const stage = STAGES.getStage(si);
    if (!stage) return;
    dom.phraseProgress.innerHTML = '';
    for (let i = 0; i < stage.phraseCount; i++) {
      const d = document.createElement('div');
      d.className = 'phrase-dot';
      if (i < ci) d.classList.add('done');
      if (i === ci) d.classList.add('current');
      dom.phraseProgress.appendChild(d);
    }
    dom.phraseProgress.classList.add('visible');
  };

  const setMessage = (emoji, text, cls = '') => {
    dom.stateMessage.innerHTML = '<span class="emoji">' + emoji + '</span>' + text;
    dom.stateMessage.className = 'state-message ' + cls;
    dom.stateMessage.classList.add('visible');
  };

  const updateStageUI = (si) => {
    const stage = STAGES.getStage(si);
    if (!stage) return;
    dom.stageChip.querySelector('.stage-num').textContent = 'STAGE ' + stage.id;
    dom.songTitle.textContent = stage.title;
  };

  const setListeningBadge = (mode, text) => {
    dom.listeningBadge.className = 'listening-badge ' + mode;
    const es = dom.listeningBadge.querySelector('span:first-child');
    const ts = dom.listeningBadge.querySelector('span:last-child');
    if (es) es.textContent = mode === 'wrong' ? '\uD83D\uDCA5' : mode === 'correct' ? '\u2705' : mode === 'playing' ? '\uD83D\uDD0A' : '\uD83D\uDD0D';
    if (ts) ts.textContent = text;
  };

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  // 로비: 랭킹 로딩
  async function loadRankings() {
    dom.rankingList.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.75rem;padding:8px;">랭킹을 불러오는 중...</div>';
    try {
      const r = await SupabaseRank.getRankings(10);
      renderRankings(r.data, r.source);
    } catch (e) {
      dom.rankingList.innerHTML = '<div style="text-align:center;color:var(--coral);font-size:0.75rem;padding:8px;">랭킹을 불러올 수 없습니다</div>';
    }
  }

  function renderRankings(rankings, source) {
    if (!rankings || rankings.length === 0) {
      dom.rankingList.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.75rem;padding:8px;">아직 기록된 점수가 없습니다. 첫 도전자!</div>';
      return;
    }
    dom.rankingList.innerHTML = '';
    rankings.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'ranking-row';
      const rc = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const ti = r.tier_name ? r.tier_name.split(' ')[0] : '\uD83C\uDFA5';
      row.innerHTML =
        '<span class="rank ' + rc + '">#' + (i + 1) + '</span>' +
        '<span class="nickname">' + ti + ' ' + escapeHtml(r.nickname) + '</span>' +
        '<span class="score">' + formatScore(r.score) + '</span>' +
        '<span class="stage-badge">S' + r.max_stage + '</span>';
      dom.rankingList.appendChild(row);
    });
    dom.rankingSourceBadge.textContent = source === 'supabase' ? 'Supabase OK' : '로컬 저장';
    dom.rankingSourceBadge.className = 'source-badge ' + (source === 'supabase' ? 'online' : 'offline');
  }

  // 게임 시작
  function startGame() {
    state.currentStageIndex = 0;
    state.currentPhraseIndex = 0;
    state.totalPhrasesCleared = 0;
    state.stagesCleared = new Set();
    state.hearts = state.maxHearts;
    state.sheetChances = 1;
    state.usedSheetChanceThisStage = false;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.isMelodyPlaying = false;
    state.isAcceptingInput = false;
    state.pendingNoteIndex = 0;
    renderHearts();
    renderScore();
    renderCombo();
    renderChanceBtn();
    showView('game-view');
    // 게임 뷰가 표시된 후 레이아웃이 완료될 시간을 확보하고 건반 렌더링
    // setTimeout으로 지연하여 container 크기가 올바르게 측정되도록 함
    setTimeout(() => {
      if (KEYBOARD) KEYBOARD.render();
    }, 50);
    updateStageUI(state.currentStageIndex);
    renderPhraseProgress(state.currentStageIndex, 0);
    setMessage('\uD83E\uDD2F', '첫 멜로디를 듣고 따라 연주해보세요!', 'instruction');
    advanceToNextPhrase();
  }

  // 프레이즈 진행 루프
  async function advanceToNextPhrase() {
    const stage = STAGES.getStage(state.currentStageIndex);
    if (!stage) { await showResult(); return; }
    if (state.currentPhraseIndex === 0) {
      updateStageUI(state.currentStageIndex);
      if (stage.hideLabels) {
        if (KEYBOARD) KEYBOARD.setLabelsVisible(false);
        setMessage('\uD83E\uDD20', '이제 계이름 라벨은 사라집니다. 귀로만 찾아보세요!', 'instruction');
        await sleep(1200);
      }
    }
    const phraseNotes = STAGES.getPhraseNotes(state.currentStageIndex, state.currentPhraseIndex);
    if (!phraseNotes || phraseNotes.length === 0) {
      state.currentPhraseIndex++;
      await advanceToNextPhrase();
      return;
    }
    state.correctMidiSet = STAGES.getCorrectMidiSet(state.currentStageIndex, state.currentPhraseIndex);
    if (KEYBOARD) KEYBOARD.setHighlightNotes(state.correctMidiSet);
    renderPhraseProgress(state.currentStageIndex, state.currentPhraseIndex);
    state.phase = 'INTRO';
    setListeningBadge('playing', '\uD83D\uDD0A 모델 멜로디 재생 중');
    setMessage('\uD83D\uDD0A', '멜로디를 듣고 외워보세요...', '');
    await playMelodySequence(phraseNotes);
    state.phase = 'LISTENING';
    state.pendingNoteIndex = 0;
    state.isAcceptingInput = true;
    setListeningBadge('listening', '\uD83D\uDD0D 이제 직접 연주해보세요!');
    setMessage('\uD83E\uDD29', '들은 멜로디를 따라 건반을 탭하세요!', 'instruction');
  }

  async function playMelodySequence(notes) {
    state.isMelodyPlaying = true;
    const totalDuration = await Synth.playMelody(notes, (i, midi) => {
      if (KEYBOARD) KEYBOARD.flashKey(midi, '#06b6d4', 250);
    });
    await sleep(totalDuration * 1000 + 200);
    state.isMelodyPlaying = false;
  }

  async function onKeyDownHandler(midi, result) {
    if (!state.isAcceptingInput || state.isMelodyPlaying) return;
    if (result === 'correct') await handleCorrectNote(midi);
    else if (result === 'wrong') await handleWrongNote(midi);
  }

  async function handleCorrectNote(midi) {
    const phraseNotes = STAGES.getPhraseNotes(state.currentStageIndex, state.currentPhraseIndex);
    if (!phraseNotes || state.pendingNoteIndex >= phraseNotes.length) return;
    const expectedMidi = phraseNotes[state.pendingNoteIndex].midi;
    if (midi === expectedMidi) {
      state.totalNotesCorrect++;
      state.totalNotesAttempted++;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      const cm = 1 + (state.combo - 1) * 0.15;
      state.score += Math.round(100 * cm);
      if (state.combo >= 3) await Synth.playComboFlare();
      else await Synth.playCorrect();
      if (KEYBOARD) KEYBOARD.flashKey(midi, '#10b981', 200);
      renderScore();
      renderCombo();
      state.pendingNoteIndex++;
      if (state.pendingNoteIndex >= phraseNotes.length) {
        await onPhraseCleared();
      } else {
        setListeningBadge('correct', '\u2705 맞았어요! 다음 음으로...');
        setMessage('\u2705', '정답! (' + state.combo + '콤보)', 'success');
        state.isAcceptingInput = false;
        setTimeout(() => {
          state.isAcceptingInput = true;
          if (state.phase === 'LISTENING') {
            setListeningBadge('listening', '\uD83D\uDD0D 계속 연주하세요!');
            setMessage('\uD83E\uDD29', '남은 ' + (phraseNotes.length - state.pendingNoteIndex) + '음', 'instruction');
          }
        }, 400);
      }
    } else {
      if (KEYBOARD) KEYBOARD.flashKey(midi, '#f43f5e', 200);
      await Synth.playWrong();
    }
  }

  async function handleWrongNote(midi) {
    state.hearts--;
    renderHearts();
    await Synth.playWrong();
    if (KEYBOARD) KEYBOARD.flashKey(midi, '#f43f5e', 300);
    setListeningBadge('wrong', '\uD83D\uDCA5 틀렸어요!');
    setMessage('\uD83D\uDCA5', '틀렸습니다! 하트를 하나 잃었어요.', 'error');
    state.combo = 0;
    renderCombo();
    if (state.hearts <= 0) {
      state.isAcceptingInput = false;
      state.phase = 'GAME_OVER';
      await Synth.playGameOver();
      setTimeout(() => showResult(), 1000);
    } else {
      state.isAcceptingInput = false;
      setTimeout(() => {
        state.pendingNoteIndex = 0;
        advanceToNextPhrase();
      }, 1200);
    }
  }

  async function onPhraseCleared() {
    state.phase = 'PHRASE_NEXT';
    state.isAcceptingInput = false;
    await Synth.playCorrect();
    setListeningBadge('correct', '\u2705 프레이즈 클리어!');
    setMessage('\uD83C\uDFAF', '프레이즈 클리어!', 'success');
    state.totalPhrasesCleared++;
    state.currentPhraseIndex++;
    const stage = STAGES.getStage(state.currentStageIndex);
    if (state.currentPhraseIndex >= stage.phraseCount) {
      onStageCleared();
    } else {
      setTimeout(() => advanceToNextPhrase(), 900);
    }
  }

  function onStageCleared() {
    state.phase = 'STAGE_CLEAR';
    state.stagesCleared.add(state.currentStageIndex);
    state.isAcceptingInput = false;
    const stage = STAGES.getStage(state.currentStageIndex);
    const noMiss = state.hearts === state.maxHearts;
    if (noMiss && state.sheetChances < state.maxSheetChances) {
      state.sheetChances++;
      setMessage('\uD83C\uDFA8', '노미스 클리어! 악보 찬스 +1 (현재: ' + state.sheetChances + ')', 'success');
    } else if (noMiss) {
      setMessage('\uD83C\uDFA8', '노미스 클리어! (악보 찬스 최대 보유)', 'success');
    } else {
      setMessage('\uD83C\uDFA9', 'Stage ' + stage.id + ' 클리어! ' + stage.tier, 'success');
    }
    state.currentStageIndex++;
    if (state.currentStageIndex >= STAGES.getStageCount()) {
      setTimeout(() => showResult(), 1500);
    } else {
      setTimeout(() => {
        state.currentPhraseIndex = 0;
        state.usedSheetChanceThisStage = false;
        renderChanceBtn();
        advanceToNextPhrase();
      }, 1500);
    }
  }

  async function useSheetChance() {
    if (state.sheetChances <= 0 || state.usedSheetChanceThisStage) return;
    state.sheetChances--;
    state.usedSheetChanceThisStage = true;
    renderChanceBtn();
    openSheetModal(state.currentStageIndex);
  }

  function openSheetModal(si) {
    const stage = STAGES.getStage(si);
    if (!stage) return;
    dom.sheetContainer.innerHTML = '<div class="sheet-placeholder">오선보를 렌더링하는 중...</div>';
    dom.sheetModalOverlay.classList.add('open');
    loadOSMD(stage.musicXml, si);
  }

  function loadOSMD(musicXml, si) {
    if (window.OpenSheetMusicDisplay) {
      doOSMDRender(musicXml, si);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@0.7.4/dist/opensheetmusicdisplay.bundle.js';
      script.onload = () => doOSMDRender(musicXml, si);
      script.onerror = () => {
        dom.sheetContainer.innerHTML = '<div class="sheet-placeholder">악보 엔진을 불러올 수 없습니다.</div>';
      };
      document.head.appendChild(script);
    }
  }

  function doOSMDRender(musicXml, si) {
    try {
      const osmd = new OpenSheetMusicDisplay('sheet-container', {
        position: 'relative',
        autoResize: true,
        drawBarNumbers: false,
      });
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(musicXml, 'application/xml');
      osmd.load(xmlDoc.documentElement).then(() => {
        osmd.render();
        dom.sheetContainer.innerHTML = '';
        const canvas = osmd.getCanvas();
        if (canvas) dom.sheetContainer.appendChild(canvas);
      }).catch(err => {
        dom.sheetContainer.innerHTML = '<div class="sheet-placeholder">악보를 표시할 수 없습니다</div>';
      });
    } catch (e) {
      dom.sheetContainer.innerHTML = '<div class="sheet-placeholder">악보 렌더링 실패</div>';
    }
  }

  function closeSheetModal() {
    dom.sheetModalOverlay.classList.remove('open');
  }

  async function playSheetDemo(si) {
    const stage = STAGES.getStage(si);
    if (!stage) return;
    const fullMelody = STAGES.getFullMelody(si);
    if (!fullMelody || fullMelody.length === 0) return;
    state.isMelodyPlaying = true;
    setListeningBadge('playing', '\uD83D\uDD0A 모범 연주 중...');
    setMessage('\uD83D\uDD0A', '모범 연주를 들어보세요', '');
    await Synth.playMelody(fullMelody, (i, midi) => {
      if (KEYBOARD) KEYBOARD.flashKey(midi, '#f59e0b', 300);
    });
    const td = fullMelody.reduce((a, n) => a + n.duration + (n.gap || 0.08), 0);
    setTimeout(() => {
      state.isMelodyPlaying = false;
      setListeningBadge('listening', '\uD83D\uDD0D 이제 연주해보세요!');
      setMessage('\uD83E\uDD29', '이제 직접 연주해보세요!', 'instruction');
    }, td * 1000 + 200);
  }

  async function showResult() {
    state.phase = 'RESULT';
    state.isAcceptingInput = false;
    if (KEYBOARD) KEYBOARD.setHighlightNotes(new Set());
    let maxStageIndex = 0;
    for (let i = 0; i < STAGES.getStageCount(); i++) {
      if (state.stagesCleared.has(i)) maxStageIndex = i;
    }
    const tierStage = STAGES.getStage(maxStageIndex);
    const tierName = tierStage ? tierStage.tier : '\uD83C\uDFA5 초보 음악가';
    const tierDesc = tierStage ? tierStage.tierDesc : '소리의 세계에 첫 발을 내딛은 리스너';
    const tierIcon = tierStage ? tierStage.name.charAt(0) : '\uD83C\uDFA5';
    const badgeClassMap = {
      '\uD83C\uDFA5': 'cyan', '\uD83C\uDFA6': 'cyan',
      '\uD83C\uDFA9': 'bronze', '\uD83C\uDFA8': 'silver', '\uD83D\uDC61': 'gold',
    };
    const badgeCls = badgeClassMap[tierIcon] || 'cyan';
    dom.resultTierBadge.textContent = tierIcon;
    dom.resultTierBadge.className = 'tier-badge ' + badgeCls;
    dom.resultTierName.textContent = tierName;
    dom.resultTierDesc.textContent = tierDesc;
    dom.resultScore.textContent = formatScore(state.score);
    dom.resultCombo.textContent = state.maxCombo;
    dom.resultStage.textContent = tierStage ? 'Stage ' + tierStage.id : 'Stage 0';
    dom.resultCleared.textContent = state.stagesCleared.size;
    showView('result-view');
    dom.nameInput.value = '';
    dom.nameInput.focus();
    dom.resultSaveStatus.textContent = '';
    dom.resultSaveStatus.className = 'result-save-status info';
    await loadRankings();
    window.__shareText =
      '내 절대음감 등급: ' + tierName +
      ' (점수: ' + formatScore(state.score) + '점, Stage ' + (maxStageIndex + 1) + ')! ' +
      '내 기록을 깰 수 있을까? \uD83D\uDCA7 ' + window.location.href;
  }

  async function saveScore() {
    const nickname = dom.nameInput.value.trim();
    if (!nickname || nickname.length < 2 || nickname.length > 10) {
      dom.resultSaveStatus.textContent = '\u26A0\uFE0F 닉네임은 2~10자로 입력하세요';
      dom.resultSaveStatus.className = 'result-save-status error';
      return;
    }
    dom.btnSaveScore.disabled = true;
    dom.resultSaveStatus.textContent = '\u23F3 기록 저장 중...';
    dom.resultSaveStatus.className = 'result-save-status info';
    const lastSI = state.stagesCleared.size > 0 ? Math.max(...state.stagesCleared) : 0;
    try {
      const r = await SupabaseRank.saveRanking({
        nickname,
        score: state.score,
        maxStage: lastSI + 1,
        maxCombo: state.maxCombo,
        tierName: dom.resultTierName.textContent,
      });
      if (r.success) {
        dom.resultSaveStatus.textContent = '\u2705 기록 저장 완료! (' + r.source + ')';
        dom.resultSaveStatus.className = 'result-save-status success';
        dom.nameInput.disabled = true;
        dom.btnSaveScore.textContent = 'SAVED \u2713';
        dom.btnSaveScore.disabled = true;
        await loadRankings();
      } else {
        dom.resultSaveStatus.textContent = '\u274C 저장 실패: ' + r.error;
        dom.resultSaveStatus.className = 'result-save-status error';
        dom.btnSaveScore.disabled = false;
      }
    } catch (e) {
      dom.resultSaveStatus.textContent = '\u274C 저장 중 오류 발생';
      dom.resultSaveStatus.className = 'result-save-status error';
      dom.btnSaveScore.disabled = false;
    }
  }

  async function shareResult() {
    const text = window.__shareText || '도레미 절대음감 챌린지 결과를 확인하세요!';
    if (navigator.share) {
      try {
        await navigator.share({ title: '도레미 절대음감 챌린지', text });
      } catch (e) {
        if (e.name !== 'AbortError') fallbackShare(text);
      }
    } else {
      fallbackShare(text);
    }
  }

  function fallbackShare(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        dom.resultSaveStatus.textContent = '\uD83D\uDCCB 결과가 클립보드에 복사되었어요!';
        dom.resultSaveStatus.className = 'result-save-status success';
      }).catch(() => promptShare(text));
    } else {
      promptShare(text);
    }
  }

  function promptShare(text) {
    prompt('결과를 공유하려면 아래 텍스트를 복사하세요:\n\n' + text);
    dom.resultSaveStatus.textContent = '\uD83D\uDCCB 텍스트가 선택되었습니다. 복사 후 공유하세요!';
    dom.resultSaveStatus.className = 'result-save-status info';
  }

  function retryGame() {
    startGame();
  }

  function initDom() {
    dom.loadingOverlay = document.getElementById('loading-overlay');
    dom.lobbyView = document.getElementById('lobby-view');
    dom.rankingList = document.getElementById('ranking-list');
    dom.rankingSourceBadge = document.getElementById('ranking-source-badge');
    dom.gameView = document.getElementById('game-view');
    dom.resultView = document.getElementById('result-view');
    dom.btnStart = document.getElementById('btn-start');
    dom.btnRetry = document.getElementById('btn-retry');
    dom.btnShare = document.getElementById('btn-share');
    dom.btnSaveScore = document.getElementById('btn-save-score');
    dom.stageChip = document.getElementById('stage-chip');
    dom.songTitle = document.getElementById('song-title');
    dom.listeningBadge = document.getElementById('listening-badge');
    dom.heartSlots = document.getElementById('heart-slots');
    dom.chanceBtn = document.getElementById('chance-btn');
    dom.chanceCount = document.getElementById('chance-count');
    dom.scoreValue = document.getElementById('score-value');
    dom.comboChip = document.getElementById('combo-chip');
    dom.comboValue = document.getElementById('combo-value');
    dom.stateMessage = document.getElementById('state-message');
    dom.phraseProgress = document.getElementById('phrase-progress');
    dom.sheetModalOverlay = document.getElementById('sheet-modal-overlay');
    dom.sheetModalClose = document.getElementById('sheet-modal-close');
    dom.sheetContainer = document.getElementById('sheet-container');
    dom.sheetDemoBtn = document.getElementById('sheet-demo-btn');
    dom.resultTierBadge = document.getElementById('tier-badge');
    dom.resultTierName = document.getElementById('tier-name');
    dom.resultTierDesc = document.getElementById('tier-desc');
    dom.resultScore = document.getElementById('result-score');
    dom.resultCombo = document.getElementById('result-combo');
    dom.resultStage = document.getElementById('result-stage');
    dom.resultCleared = document.getElementById('result-cleared');
    dom.nameInput = document.getElementById('name-input');
    dom.resultSaveStatus = document.getElementById('result-save-status');
  }

  function init() {
    // DOM 요소가 아직 없으면 재시도
    if (!document.getElementById('loading-overlay')) {
      setTimeout(init, 50);
      return;
    }
    initDom();
    Synth = window.Synth;
    KEYBOARD = window.KEYBOARD;
    STAGES = window.STAGES;
    SupabaseRank = window.SupabaseRank;
    if (!Synth || !KEYBOARD || !STAGES) {
      if (dom.loadingOverlay) dom.loadingOverlay.classList.add('hidden');
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:var(--coral);font-family:sans-serif;">게임 모듈을 로드할 수 없습니다.</div>';
      return;
    }
    if (SupabaseRank) SupabaseRank.init();
    KEYBOARD.init({
      container: document.getElementById('keyboard-container'),
      onKeyDown: (midi, result, touch) => onKeyDownHandler(midi, result, touch),
    });
    // 건반 렌더링은 game-view가 표시된 후에만 수행 (init 단계에서는 lobby-view만 활성이므로 불필요)
    dom.btnStart.addEventListener('click', async () => {
      if (Synth) await Synth.getContext();
      startGame();
    });
    dom.chanceBtn.addEventListener('click', () => useSheetChance());
    dom.sheetModalClose.addEventListener('click', closeSheetModal);
    dom.sheetModalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.sheetModalOverlay) closeSheetModal();
    });
    dom.sheetDemoBtn.addEventListener('click', () => playSheetDemo(state.currentStageIndex));
    dom.btnSaveScore.addEventListener('click', saveScore);
    dom.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveScore();
    });
    dom.btnRetry.addEventListener('click', retryGame);
    dom.btnShare.addEventListener('click', shareResult);
    window.addEventListener('resize', () => {
      if (KEYBOARD) KEYBOARD.handleResize();
    });
    if (dom.loadingOverlay) dom.loadingOverlay.classList.add('hidden');
    loadRankings();
    console.log('[game] init 완료 — 로비 화면 표시');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
