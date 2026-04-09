// Oxford Word Play - React Native App
// 영어 단어 학습 게임 (1,715 단어, 7레벨, 6가지 게임모드)
// 폰트: Paperlogy (assets/fonts)

import React, { useState, useEffect, useCallback } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { Audio } from "expo-av";

import HomeScreen from "./src/screens/HomeScreen";
import LevelSelectScreen from "./src/screens/LevelSelectScreen";
import GameMenuScreen from "./src/screens/GameMenuScreen";
import QuizGameScreen from "./src/screens/QuizGameScreen";
import ListenGameScreen from "./src/screens/ListenGameScreen";
import SpellGameScreen from "./src/screens/SpellGameScreen";
import MatchGameScreen from "./src/screens/MatchGameScreen";
import WordListScreen from "./src/screens/WordListScreen";
import ResultScreen from "./src/screens/ResultScreen";
import RemoveAdsScreen from "./src/screens/RemoveAdsScreen";
import { getAllWordsForLevel } from "./src/data/words";
import { AdsProvider } from "./src/context/AdsContext";
import { logScreenView, logGameStart } from "./src/services/analytics";


// Paperlogy - assets/fonts/Paperlogy 폴더에 9개 TTF 파일 넣기
const FONT_URIS = {
  "PaperlogyThin": require("./assets/fonts/Paperlogy/Paperlogy-1Thin.ttf"),
  "PaperlogyExtraLight": require("./assets/fonts/Paperlogy/Paperlogy-2ExtraLight.ttf"),
  "PaperlogyLight": require("./assets/fonts/Paperlogy/Paperlogy-3Light.ttf"),
  "PaperlogyRegular": require("./assets/fonts/Paperlogy/Paperlogy-4Regular.ttf"),
  "PaperlogyMedium": require("./assets/fonts/Paperlogy/Paperlogy-5Medium.ttf"),
  "PaperlogySemiBold": require("./assets/fonts/Paperlogy/Paperlogy-6SemiBold.ttf"),
  "PaperlogyBold": require("./assets/fonts/Paperlogy/Paperlogy-7Bold.ttf"),
  "PaperlogyExtraBold": require("./assets/fonts/Paperlogy/Paperlogy-8ExtraBold.ttf"),
  "PaperlogyBlack": require("./assets/fonts/Paperlogy/Paperlogy-9Black.ttf"),
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [screen, setScreen] = useState("home");
  const [level, setLevel] = useState(1);
  const [words, setWords] = useState([]);
  const [gameMode, setGameMode] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  // 오답 기록 & 시도 횟수 관리
  const [wrongWords, setWrongWords] = useState({}); // { "apple": { count: 2, word: {...} } }
  const [attemptHistory, setAttemptHistory] = useState({}); // { "apple": { attempts: 3, correct: 1 } }

  // Paperlogy 폰트 로드 (assets/fonts)
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(FONT_URIS);
      } catch (e) {
        console.warn("Font load failed, using system font:", e);
      }
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // 오디오 모드 설정 (TTS/효과음이 스피커로 나오도록)
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false, // 스피커로 재생
        });
      } catch (e) {
        console.warn("Audio mode setup failed:", e);
      }
    }
    setupAudio();
  }, []);

  // AsyncStorage에서 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const wrong = await AsyncStorage.getItem("wrongWords");
      const attempts = await AsyncStorage.getItem("attemptHistory");
      if (wrong) setWrongWords(JSON.parse(wrong));
      if (attempts) setAttemptHistory(JSON.parse(attempts));
    } catch (e) {
      console.log("Data load error:", e);
    }
  };

  const saveData = async (wrong, attempts) => {
    try {
      await AsyncStorage.setItem("wrongWords", JSON.stringify(wrong));
      await AsyncStorage.setItem("attemptHistory", JSON.stringify(attempts));
    } catch (e) {
      console.log("Data save error:", e);
    }
  };

  // 오답 기록 추가
  const addWrongWord = useCallback(
    (word) => {
      setWrongWords((prev) => {
        const next = { ...prev };
        if (next[word.en]) {
          next[word.en].count += 1;
        } else {
          next[word.en] = { count: 1, word };
        }
        saveData(next, attemptHistory);
        return next;
      });
    },
    [attemptHistory],
  );

  // 오답에서 제거 (맞추면)
  const removeWrongWord = useCallback(
    (word) => {
      setWrongWords((prev) => {
        const next = { ...prev };
        delete next[word.en];
        saveData(next, attemptHistory);
        return next;
      });
    },
    [attemptHistory],
  );

  // 시도 횟수 기록
  const recordAttempt = useCallback(
    (word, isCorrect) => {
      setAttemptHistory((prev) => {
        const next = { ...prev };
        if (!next[word.en]) {
          next[word.en] = { attempts: 0, correct: 0 };
        }
        next[word.en].attempts += 1;
        if (isCorrect) next[word.en].correct += 1;
        saveData(wrongWords, next);
        return next;
      });
    },
    [wrongWords],
  );

  // 화면 전환
  const goHome = () => setScreen("home");
  const goLevelSelect = () => setScreen("level");
  const goMenu = () => setScreen("menu");

  const selectLevel = (lv) => {
    setLevel(lv);
    setWords(getAllWordsForLevel(lv));
    setScreen("menu");
  };

  const startGame = (mode) => {
    logGameStart(mode, level);
    setGameMode(mode);
    setScreen("game");
  };

  // 화면 전환 시 로그 (Firebase Analytics)
  useEffect(() => {
    const name = screen === "home" ? "home" : screen === "level" ? "level_select" : screen === "menu" ? "game_menu" : screen === "game" ? "game" : screen === "result" ? "result" : screen === "wordlist" ? "word_list" : screen === "wrongnote" ? "wrong_note" : screen === "shop" ? "shop" : screen;
    logScreenView(name);
  }, [screen]);

  const goWordList = () => setScreen("wordlist");
  const goWrongNote = () => setScreen("wrongnote");
  const goShop = () => setScreen("shop");

  const onGameEnd = (result) => {
    setGameResult(result);
    setScreen("result");
  };

  // 게임 props
  const gameProps = {
    words,
    level,
    onBack: goMenu,
    onGameEnd,
    wrongWords,
    attemptHistory,
    addWrongWord,
    removeWrongWord,
    recordAttempt,
  };

  // Android 백버튼: 메인(레벨선택)에서는 종료 확인, 그 외 이전 화면
  useEffect(() => {
    const handleBack = () => {
      if (screen === "level") {
        Alert.alert("앱 종료", "앱을 종료할까요?", [
          { text: "취소", style: "cancel" },
          { text: "종료", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
      if (screen === "menu") {
        goLevelSelect();
        return true;
      }
      if (screen === "wordlist" || screen === "wrongnote" || screen === "shop") {
        goMenu();
        return true;
      }
      if (screen === "game" || screen === "result") {
        goMenu();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => sub.remove();
  }, [screen]);

  // 폰트 로딩 중
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F38F6" />
        <Text style={{ marginTop: 12, color: "#7B7B7B" }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AdsProvider>
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

          {screen === "home" && <HomeScreen onStart={goLevelSelect} />}

      {screen === "level" && (
        <LevelSelectScreen
          onSelect={selectLevel}
          currentLevel={level}
          onBack={goHome}
          attemptHistory={attemptHistory}
        />
      )}

      {screen === "menu" && (
        <GameMenuScreen
          level={level}
          onStart={startGame}
          onChangeLevel={goLevelSelect}
          onWordList={goWordList}
          onWrongNote={goWrongNote}
          onBack={goHome}
          onShop={goShop}
          wrongWords={wrongWords}
          words={words}
        />
      )}

      {screen === "game" && gameMode === "emoji" && (
        <QuizGameScreen mode="emoji" {...gameProps} />
      )}
      {screen === "game" && gameMode === "ko2en" && (
        <QuizGameScreen mode="ko2en" {...gameProps} />
      )}
      {screen === "game" && gameMode === "en2ko" && (
        <QuizGameScreen mode="en2ko" {...gameProps} />
      )}
      {screen === "game" && gameMode === "listen" && (
        <ListenGameScreen {...gameProps} />
      )}
      {screen === "game" && gameMode === "spell" && (
        <SpellGameScreen {...gameProps} />
      )}
      {screen === "game" && gameMode === "match" && (
        <MatchGameScreen {...gameProps} />
      )}

      {screen === "wordlist" && (
        <WordListScreen
          level={level}
          words={words}
          wrongWords={wrongWords}
          attemptHistory={attemptHistory}
          onBack={goMenu}
          onHome={goHome}
          mode="wordlist"
        />
      )}

      {screen === "wrongnote" && (
        <WordListScreen
          level={level}
          words={words}
          wrongWords={wrongWords}
          attemptHistory={attemptHistory}
          onBack={goMenu}
          onHome={goHome}
          mode="wrongnote"
        />
      )}

      {screen === "shop" && <RemoveAdsScreen onBack={goMenu} />}

      {screen === "result" && (
        <ResultScreen
          result={gameResult}
          wrongWords={wrongWords}
          onRetry={() => setScreen("game")}
          onMenu={goMenu}
          onHome={goHome}
          onNextStage={goLevelSelect}
        />
      )}


        </SafeAreaView>
      </AdsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8FA",
  },
});
