import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import colors from "../theme/colors";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <View style={s.wrap}>
        <Text style={s.title}>반가워요 👋</Text>
        <Text style={s.sub}>{user?.nickname || user?.email}</Text>
        <TouchableOpacity style={s.btn} onPress={logout}>
          <Text style={s.btnTx}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12, justifyContent: "center", alignItems: "center" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  sub: { color: colors.textSub, marginTop: 4 },
  btn: {
    backgroundColor: "transparent",
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 16,
  },
  btnTx: { color: colors.text, fontWeight: "800" },
});
