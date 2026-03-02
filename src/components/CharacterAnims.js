// 캐릭터별 개성 있는 애니메이션 컴포넌트 5종 (속도: 기존 대비 3배 느리게)
import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

// 1. Ghost: 좌우로 이동하며 방향 전환 (scaleX 반전으로 뒤돌아보는 느낌)
export function GhostAnim({ children, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);
  const tx = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, 0],
  });
  const sx = anim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, -1, -1],
  });
  return (
    <Animated.View style={[style, { transform: [{ translateX: tx }, { scaleX: sx }] }]}>
      {children}
    </Animated.View>
  );
}

// 2. Full(보라): 제자리에서 통통 튀기 (원래 400→1200ms, delay 600→1800ms)
export function BounceAnim({ children, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.delay(1800),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const sy = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.93, 1],
  });
  return (
    <Animated.View style={[style, { transform: [{ translateY: ty }, { scaleY: sy }] }]}>
      {children}
    </Animated.View>
  );
}

// 3. Orange: 움찔움찔 (원래 600→1800ms, delay 300→900ms)
export function SquirmAnim({ children, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.delay(900),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);
  const sy = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.92, 1],
  });
  const sx = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.04, 1],
  });
  const rot = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["0deg", "-2deg", "0deg", "2deg", "0deg"],
  });
  return (
    <Animated.View style={[style, { transform: [{ scaleY: sy }, { scaleX: sx }, { rotate: rot }] }]}>
      {children}
    </Animated.View>
  );
}

// 4. Happy(초록): 공 튀면서 이동 (원래 350→1050ms, drift 2000→6000ms)
export function BallBounceAnim({ children, style }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const driftAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1050,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1050,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.delay(600),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(driftAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
    return () => {
      bounceAnim.stopAnimation();
      driftAnim.stopAnimation();
    };
  }, [bounceAnim, driftAnim]);
  const ty = bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const tx = driftAnim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });
  return (
    <Animated.View style={[style, { transform: [{ translateY: ty }, { translateX: tx }] }]}>
      {children}
    </Animated.View>
  );
}

// 5. Cloud: 좌우로 부드럽게 이동 (원래 2200→6600ms)
export function DriftAnim({ children, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 6600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 6600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [anim]);
  const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });
  return (
    <Animated.View style={[style, { transform: [{ translateX: tx }] }]}>
      {children}
    </Animated.View>
  );
}
