// AdMob 광고 단위 ID
import { Platform } from 'react-native';

// 전면(Interstitial) 광고 - 2회 플레이마다, 스킵 가능
export const INTERSTITIAL_ID = Platform.select({
  android: 'ca-app-pub-4418561224540686/4205321588',
  ios: 'ca-app-pub-3940256099942544/4411468910', // iOS는 추후 교체
});

// 보상형(Rewarded) 광고 - 레벨 변경 시, 끝까지 봐야 레벨 이동
export const REWARDED_ID = Platform.select({
  android: 'ca-app-pub-4418561224540686/2105771850',
  ios: 'ca-app-pub-3940256099942544/1712485313', // iOS는 추후 교체
});
