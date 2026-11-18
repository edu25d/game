/**
 * supabase.js — Supabase 실시간 랭킹 연동 및 LocalStorage Fallback
 *
 * 환경변수: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
 * (Vercel 환경변수 또는 HTML에서 <meta>로 주입)
 */

const SupabaseRank = (() => {

  // ── 설정 ─────────────────────────────────────────────────────────
  let client = null;
  let usingFallback = false;

  // 환경이 없으면 localStorage Fallback 사용
  function getConfig() {
    // Vercel 환경변수 또는 HTML 메타 태그에서 읽음
    const url = (
      window.__SUPABASE_URL ||
      document.querySelector('meta[name="supabase-url"]')?.content ||
      ''
    );
    const anonKey = (
      window.__SUPABASE_ANON_KEY ||
      document.querySelector('meta[name="supabase-anon-key"]')?.content ||
      ''
    );
    return { url, anonKey };
  }

  // ── Supabase 클라이언트 초기화 ────────────────────────────────────
  function init() {
    const { url, anonKey } = getConfig();

    if (!url || !anonKey) {
      usingFallback = true;
      return false;
    }

    try {
      // CDN에서 로드된 supabase-js (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)
      // UMD 빌드: window.supabase.createClient(url, key)
      const { createClient } = window.supabase || {};
      if (!createClient) {
        usingFallback = true;
        return false;
      }
      client = window.supabase.createClient(url, anonKey);
      usingFallback = false;
      return true;
    } catch (e) {
      console.warn('[SupabaseRank] 초기화 실패, localStorage Fallback 사용:', e);
      usingFallback = true;
      return false;
    }
  }

  // ── 랭킹 조회 (Top 50) ───────────────────────────────────────────
  async function getRankings(limit = 50) {
    if (!usingFallback && client) {
      try {
        const { data, error } = await client
          .from('ear_challenge_rankings')
          .select('*')
          .order('score', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return { success: true, data: data ?? [], source: 'supabase' };
      } catch (e) {
        console.warn('[SupabaseRank] 랭킹 조회 실패, fallback 전환:', e);
        usingFallback = true;
      }
    }

    // LocalStorage Fallback
    const stored = localStorage.getItem('ear_challenge_rankings_fallback');
    let rankings = [];
    if (stored) {
      try {
        rankings = JSON.parse(stored);
      } catch {}
    }
    rankings.sort((a, b) => b.score - a.score);
    return {
      success: true,
      data: rankings.slice(0, limit),
      source: 'localstorage',
      warning: usingFallback ? 'Supabase 연결 없음: 로컬 저장 랭킹 표시' : undefined,
    };
  }

  // ── 랭킹 기록 저장 ────────────────────────────────────────────────
  async function saveRanking(record) {
    const { nickname, score, maxStage, maxCombo, tierName } = record;

    // 유효성 검사
    if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 20) {
      return { success: false, error: '닉네임은 2~20자여야 합니다.' };
    }
    // 비속어 단순 필터 (기본)
    const blocked = ['욕', '씨발', '바보', '멍청'];
    if (blocked.some(b => nickname.includes(b))) {
      return { success: false, error: '부적절한 닉네임입니다.' };
    }

    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      nickname: nickname.trim(),
      score: Number(score) || 0,
      max_stage: Number(maxStage) || 0,
      max_combo: Number(maxCombo) || 0,
      tier_name: tierName || '미정',
      created_at: new Date().toISOString(),
    };

    if (!usingFallback && client) {
      try {
        const { error } = await client
          .from('ear_challenge_rankings')
          .insert([entry]);

        if (error) throw error;
        return { success: true, data: entry, source: 'supabase' };
      } catch (e) {
        console.warn('[SupabaseRank] 저장 실패, fallback 전환:', e);
        usingFallback = true;
      }
    }

    // LocalStorage Fallback
    const stored = localStorage.getItem('ear_challenge_rankings_fallback');
    let rankings = [];
    if (stored) {
      try { rankings = JSON.parse(stored); } catch {}
    }
    rankings.push(entry);
    // Top 200만 유지
    rankings.sort((a, b) => b.score - a.score);
    if (rankings.length > 200) rankings = rankings.slice(0, 200);
    localStorage.setItem('ear_challenge_rankings_fallback', JSON.stringify(rankings));

    return { success: true, data: entry, source: 'localstorage' };
  }

  // ── 내 최근 기록 조회 ─────────────────────────────────────────────
  async function getMyRecentRecord(nickname) {
    if (!usingFallback && client) {
      try {
        const { data, error } = await client
          .from('ear_challenge_rankings')
          .select('*')
          .eq('nickname', nickname)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        return { success: true, data: data?.[0] ?? null, source: 'supabase' };
      } catch (e) {
        console.warn('[SupabaseRank] 내 기록 조회 실패:', e);
        usingFallback = true;
      }
    }

    const stored = localStorage.getItem('ear_challenge_rankings_fallback');
    let rankings = [];
    if (stored) {
      try { rankings = JSON.parse(stored); } catch {}
    }
    const my = rankings.filter(r => r.nickname === nickname)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { success: true, data: my[0] ?? null, source: 'localstorage' };
  }

  // ── Supabase 연결 상태 ────────────────────────────────────────────
  function isOnline() {
    return !usingFallback && !!client;
  }

  function getSource() {
    return usingFallback ? 'localstorage' : 'supabase';
  }

  return {
    init,
    getRankings,
    saveRanking,
    getMyRecentRecord,
    isOnline,
    getSource,
    getConfig,
  };
})();

// export for production
if (typeof exportModules === 'function') {
  exportModules('supabase', SupabaseRank);
}
