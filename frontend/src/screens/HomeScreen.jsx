import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={s.wrap}>
      <Text style={s.title}>반가워요 👋</Text>
      <Text style={s.sub}>{user?.nickname || user?.email}</Text>
      <TouchableOpacity style={s.btn} onPress={logout}>
        <Text style={s.btnTx}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 16,
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  sub: { color: "#ddd", marginTop: 4 },
  btn: {
    backgroundColor: "#4b5563",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  btnTx: { color: "#fff", fontWeight: "800" },
});
