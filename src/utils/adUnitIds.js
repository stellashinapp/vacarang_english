// AdMob 광고 단위 ID - 전면/보상형은 AdMob 콘솔에서 생성 후 여기에 입력
import { Platform } from 'react-native';

// 배너 광고
export const BANNER_ID = Platform.select({
  android: 'ca-app-pub-4418561224540686/2364612602',
  ios: 'ca-app-pub-4418561224540686/9621266038',
});

// 전면(Interstitial) 광고
export const INTERSTITIAL_ID = Platform.select({
  android: 'ca-app-pub-4418561224540686/4205321588',
  ios: 'ca-app-pub-3940256099942544/4411468910', // iOS는 추후 교체
});

// 보상형(Rewarded) 광고
export const REWARDED_ID = Platform.select({
  android: 'ca-app-pub-4418561224540686/2105771850',
  ios: 'ca-app-pub-3940256099942544/1712485313', // iOS는 추후 교체
});

