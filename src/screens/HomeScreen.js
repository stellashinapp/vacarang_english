// 홈 화면 - 로고 인트로 후 레벨 선택으로 이동

import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONT, COLORS } from "../utils/theme";
import { playLogoSound } from "../utils/helpers";

// 배경: 가장자리 완전 흰색, 가운데 파란 그라데이션 (radial 시뮬레이션)
const BG_WHITE = "#FFFFFF";
const BG_BLUE = "#A8C8FF";
const BG_BLUE_MID = "#C8DBFF";

const SCALE_START = 0.3;
const SCALE_END = 1.4; // 기존 2배에서 70%로 축소
const SCALE_DURATION = 900;
const HOLD_MS = 4500;
const FADE_DURATION = 700;

export default function HomeScreen({ onStart }) {
  const scaleAnim = useRef(new Animated.Value(SCALE_START)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const onStartRef = useRef(onStart);
  const didNavigate = useRef(false);

  const goToLevelSelect = useCallback(() => {
    if (didNavigate.current) return;
    didNavigate.current = true;
    const fn = onStartRef.current;
    if (typeof fn === "function") {
      setTimeout(() => fn(), 0);
    }
  }, []);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    // 0. 맨 앞 로고 나올 때 로고 사운드 재생
    playLogoSound();
    // 1. 작았다가 커지면서 등장
    const scaleIn = Animated.timing(scaleAnim, {
      toValue: SCALE_END,
      duration: SCALE_DURATION,
      useNativeDriver: true,
    });
    scaleIn.start();

    // 2. HOLD_MS 후 디졸브 애니메이션
    const fadeTimer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }, HOLD_MS);

    // 3. 반드시 이 시간 뒤에 레벨 선택으로 이동 (애니메이션 콜백 의존 X)
    const navTimer = setTimeout(goToLevelSelect, HOLD_MS + FADE_DURATION + 100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, []);

  // 캐릭터/로고 살짝 움직이는 루프
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  return (
    <View style={styles.container}>
      {/* 세로: 흰→파랑→흰 (가운데 파랗게) */}
      <LinearGradient
        colors={[BG_WHITE, BG_BLUE, BG_WHITE]}
        locations={[0.05, 0.45, 0.95]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* 가로: 흰→중간파랑→흰 (겹쳐서 가운데만 진해짐) */}
      <LinearGradient
        colors={[BG_WHITE, BG_BLUE_MID, BG_WHITE]}
        locations={[0.05, 0.5, 0.95]}
        start={[0, 0.5]}
        end={[1, 0.5]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* 대각선 보정: 모서리를 확실히 흰색으로 */}
      <LinearGradient
        colors={[BG_WHITE, "rgba(255,255,255,0)", BG_WHITE]}
        locations={[0, 0.5, 1]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[StyleSheet.absoluteFill, styles.backgroundImage]} pointerEvents="box-none">
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={goToLevelSelect}
        />
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/logo-main.png")}
            style={styles.logoMain}
            resizeMode="contain"
          />
        </Animated.View>
        <View style={styles.subtitleArea}>
          <Text style={styles.subtitle1}>Oxford 3000 영어 단어</Text>
        </View>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={goToLevelSelect}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>소리켜고 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_WHITE,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    marginTop: -20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  logoMain: {
    width: "70%",
    maxWidth: 300,
    height: undefined,
    aspectRatio: 300 / 140,
    backgroundColor: "transparent",
  },
  subtitleArea: {
    marginTop: 16,
    alignItems: "center",
  },
  subtitle1: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.text,
  },
  subtitle2: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },
  startBtn: {
    marginTop: 32,
    alignSelf: "center",
    backgroundColor: "#6A5ACD",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    width: "70%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: COLORS.white,
  },
});
