// 캐릭터 살짝 움직이는 애니메이션 래퍼
// axis: 'y' = 위아래, 'x' = 좌우(꼬물꼬물) | direction: 1 = 오른쪽/위 먼저, -1 = 왼쪽/아래 먼저
// axis='x'일 때 세로 스케일(scaleY)로 기어가는 느낌
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

const FLOAT_RANGE = 5;
const DURATION = 2000;
const CRAWL_SCALE_MIN = 0.92; // 세로로 눌렀다 펴서 기어가는 느낌

export default function CharacterFloat({
  children,
  style,
  range = FLOAT_RANGE,
  duration = DURATION,
  axis = "y",
  direction = 1,
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration]);

  const delta = anim.interpolate({
    inputRange: [0, 1],
    outputRange: axis === "x" ? [0, range * direction] : [0, -range],
  });

  // 좌우 움직일 때: 세로로만 스케일 (눌렀다 펴기) → 기어가는 느낌
  const scaleY =
    axis === "x"
      ? anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, CRAWL_SCALE_MIN],
        })
      : 1;

  const transform =
    axis === "x"
      ? [{ translateX: delta }, { scaleY }]
      : [{ translateY: delta }];

  return (
    <Animated.View style={[style, { transform }]}>
      {children}
    </Animated.View>
  );
}
