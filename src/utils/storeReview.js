// 앱 평가 요청 - 15회 게임 완료 후 1회 표시
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const GAME_COUNT_KEY = 'totalGameCount';
const REVIEW_SHOWN_KEY = 'reviewShown';
const REVIEW_AT = 15; // 15회 게임 완료 시 리뷰 요청

export async function checkAndRequestReview() {
  try {
    const [countStr, shown] = await Promise.all([
      AsyncStorage.getItem(GAME_COUNT_KEY),
      AsyncStorage.getItem(REVIEW_SHOWN_KEY),
    ]);

    const count = (Number(countStr) || 0) + 1;
    await AsyncStorage.setItem(GAME_COUNT_KEY, String(count));

    // 이미 요청한 적 있으면 스킵
    if (shown === 'true') return;

    // 15회 도달 시 리뷰 요청
    if (count >= REVIEW_AT) {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
        await AsyncStorage.setItem(REVIEW_SHOWN_KEY, 'true');
      }
    }
  } catch (e) {
    console.warn('Store review error:', e);
  }
}
