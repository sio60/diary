import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !pw) return Alert.alert("이메일/비밀번호를 입력해주세요");
    setLoading(true);
    try {
      const data = await login({ email: email.trim().toLowerCase(), password: pw });
      // ✅ 성공 로그
      console.log("[Auth] login ok:", data);
    } catch (e) {
      console.log("[Auth] login fail:", e);
      Alert.alert("로그인 실패", e.message || "다시 시도해주세요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>로그인</Text>
      <TextInput style={s.input} placeholder="이메일" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
      <TextInput style={s.input} placeholder="비밀번호" placeholderTextColor="#777" secureTextEntry value={pw} onChangeText={setPw}/>
      <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={s.btnTx}>로그인</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={s.link}>계정이 없나요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12, justifyContent: "center" },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  input: { backgroundColor: "#1c1c1e", color: "#fff", padding: 14, borderRadius: 12 },
  btn: { backgroundColor: "#4b5563", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 6 },
  btnTx: { color: "#fff", fontWeight: "800" },
  link: { color: "#8ab4ff", textAlign: "center", marginTop: 12 },
});
