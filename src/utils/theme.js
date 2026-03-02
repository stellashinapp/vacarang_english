// 테마 & 공통 스타일 - 폰트: Paperlogy (assets/fonts)

export const FONT = {
  regular: 'PaperlogyRegular',
  medium: 'PaperlogyMedium',
  semiBold: 'PaperlogySemiBold',
  bold: 'PaperlogyBold',
  extraBold: 'PaperlogyExtraBold',
  black: 'PaperlogyBlack',
};

// 참고: 라이트 그레이 배경, 퍼플 액센트(미디엄 블루-바이올렛), 카드/버튼 플랫 모던
export const COLORS = {
  bg: '#F8F8FA',
  primary: '#5B4BBD',
  primaryLight: '#B8ADDD',
  secondary: '#4A3D9E',
  primaryBorder: '#DDD6F0',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  text: '#2C2C2C',
  textSecondary: '#7B7B7B',
  textLight: '#9ca3af',
  white: '#FFFFFF',
  card: '#FFFFFF',
  border: '#EBEBEB',
  overlay: 'rgba(0,0,0,0.5)',
};

// 카드/버튼/뱃지 공통 라운드 (통일)
export const RADIUS = 14;

// 카드/버튼: 은은한 그림자, 플랫한 느낌
export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};
