import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Screen from "../components/Screen";
import colors from "../theme/colors";

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen>
      <View style={s.wrap}>
        {/* 로고: assets/adaptive-icon.png 사용 (자기 로고 파일 있으면 여기 경로만 바꿔) */}
        <Image source={require("../../assets/logo.png")} style={s.logo} />

        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("Login")}>
          <Text style={s.btnTx}>로그인</Text>
        </TouchableOpacity>

        <View style={s.sepRow}>
          <View style={s.line} />
          <Text style={s.sepTx}>아직 회원이 아니신가요?</Text>
          <View style={s.line} />
        </View>

        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("Register")}>
          <Text style={s.btnTx}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  logo: { width: 160, height: 160, resizeMode: "contain", marginBottom: 8 },
  btn: {
    alignSelf: "stretch",
    backgroundColor: colors.primary,   // ★ 고정
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnTx: { color: "#fff", fontSize: 16, fontWeight: "800" },
  sepRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 2, paddingHorizontal: 6, width: "100%" },
  line: { flex: 1, height: 1, backgroundColor: "rgba(51,39,42,0.25)" },
  sepTx: { color: colors.text, opacity: 0.9, fontSize: 12, letterSpacing: 0.2 },
});
