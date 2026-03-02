// 게임모드 헤더용 오렌지 캐릭터: 좌우로 움직이면서 skin_orange ↔ skin_orange_happy2 번갈아 표시
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";

const IMG_1 = require("../../assets/skin_orange.png");
const IMG_2 = require("../../assets/skin_orange_happy2.png");

const DURATION = 800;
const SWAP_INTERVAL = 600;
const SCALE_MIN = 0.94;

export default function OrangeHeaderCharacter({ style, imageSize = 100 }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [source, setSource] = useState(IMG_1);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: DURATION,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  useEffect(() => {
    const id = setInterval(() => {
      setSource((s) => (s === IMG_1 ? IMG_2 : IMG_1));
    }, SWAP_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const scaleY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, SCALE_MIN],
  });

  const scaleX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scaleY }, { scaleX }] }, style]}>
      <Image
        source={source}
        style={[styles.img, { width: imageSize, height: imageSize }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  img: {},
});
