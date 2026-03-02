// 5번째 그림 스타일: 심플한 눈·입 + 깜빡임 애니메이션

import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const EYE_SIZE = 14;
const EYE_HIGHLIGHT = 4;
const MOUTH_WIDTH = 20;
const MOUTH_HEIGHT = 2;

export default function AnimatedFace() {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const doBlink = () => {
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0.15,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    };
    const t = setInterval(doBlink, 2500);
    return () => clearInterval(t);
  }, [blink]);

  return (
    <View style={styles.face}>
      {/* 눈 두 개 */}
      <View style={styles.eyes}>
        <View style={styles.eyeWrap}>
          <Animated.View style={[styles.eye, { opacity: blink }]}>
            <View style={styles.highlight} />
          </Animated.View>
        </View>
        <View style={styles.eyeWrap}>
          <Animated.View style={[styles.eye, { opacity: blink }]}>
            <View style={styles.highlight} />
          </Animated.View>
        </View>
      </View>
      {/* 입 */}
      <View style={styles.mouth} />
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    alignItems: "center",
    paddingVertical: 12,
  },
  eyes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  eyeWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  eye: {
    width: EYE_SIZE,
    height: EYE_SIZE,
    borderRadius: EYE_SIZE / 2,
    backgroundColor: "#1a1a1a",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  highlight: {
    width: EYE_HIGHLIGHT,
    height: EYE_HIGHLIGHT,
    borderRadius: EYE_HIGHLIGHT / 2,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginTop: 2,
    marginRight: 2,
  },
  mouth: {
    width: MOUTH_WIDTH,
    height: MOUTH_HEIGHT,
    borderRadius: MOUTH_HEIGHT / 2,
    backgroundColor: "#1a1a1a",
    marginTop: 10,
  },
});
