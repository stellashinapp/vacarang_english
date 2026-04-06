/**
 * 사용자 로그 (Google Firebase Analytics)
 * - 최대 256개 커스텀 이벤트 등록 가능 (GA4 기준 500개 이벤트명)
 * - Firebase 미설정 시 호출은 무시됨 (Expo Go 등)
 *
 * 이벤트 예시: 각 메뉴 첫 진입, 게임 클리어, 클리어 시간 등
 */

let analyticsModule = null;

try {
  const firebase = require('@react-native-firebase/analytics');
  analyticsModule = firebase.default;
} catch (e) {
  // Expo Go 또는 Firebase 미설정 시
}

/**
 * 이벤트 로깅 (파라미터는 문자열/숫자만, 최대 25개)
 */
async function logEvent(name, params = {}) {
  if (!analyticsModule) return;
  try {
    const safeParams = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        safeParams[k] = typeof v === 'object' ? JSON.stringify(v) : v;
      }
    });
    await analyticsModule().logEvent(name, safeParams);
  } catch (err) {
    // 무시
  }
}

/**
 * 화면 조회 (screen_view)
 */
export function logScreenView(screenName, screenClass = null) {
  logEvent('screen_view', {
    screen_name: screenName,
    ...(screenClass && { screen_class: screenClass }),
  });
}

/**
 * 메뉴 첫 진입 (레벨별 게임 모드 메뉴)
 */
export function logMenuFirstEnter(level, menuId) {
  logEvent('menu_first_enter', { level: String(level), menu_id: menuId });
}

/**
 * 게임 시작
 */
export function logGameStart(mode, level) {
  logEvent('game_start', { game_mode: mode, level: String(level) });
}

/**
 * 게임 클리어 (클리어 시, 평균/소요 시간 등)
 */
export function logGameComplete(payload) {
  const { mode, level, score, total, timeSeconds, extra } = payload || {};
  logEvent('game_complete', {
    game_mode: mode || '',
    level: String(level ?? ''),
    score: Number(score ?? 0),
    total: Number(total ?? 0),
    time_seconds: Number(timeSeconds ?? 0),
    ...(extra && typeof extra === 'object' ? extra : {}),
  });
}

/**
 * 레벨 선택 화면 첫 진입
 */
export function logLevelSelectEnter() {
  logEvent('level_select_enter', {});
}

/**
 * 단어장/오답노트 화면 진입
 */
export function logWordListEnter(mode) {
  logEvent('word_list_enter', { mode: mode || 'wordlist' });
}

/**
 * 샵(광고 제거) 화면 진입
 */
export function logShopEnter() {
  logEvent('shop_enter', {});
}

export default {
  logEvent,
  logScreenView,
  logMenuFirstEnter,
  logGameStart,
  logGameComplete,
  logLevelSelectEnter,
  logWordListEnter,
  logShopEnter,
};
