import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import colors from "../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !pw) return Alert.alert("이메일/비밀번호를 입력해주세요");
    setLoading(true);
    try { await login({ email: email.trim().toLowerCase(), password: pw }); }
    catch (e) { Alert.alert("로그인 실패", e.message || "다시 시도해주세요"); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <View style={s.wrap}>
        <Text style={s.title}>로그인</Text>
        <TextInput
          style={s.input}
          placeholder="이메일"
          placeholderTextColor="#A87C7C"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.input}
          placeholder="비밀번호"
          placeholderTextColor="#A87C7C"
          secureTextEntry
          value={pw}
          onChangeText={setPw}
        />
        <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={s.btnTx}>로그인</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={s.link}>계정이 없나요? 회원가입</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, justifyContent: "center" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 6 },
  btnTx: { color: "#fff", fontWeight: "800" },
  link: { color: colors.link, textAlign: "center", marginTop: 12, fontWeight: "700" },
});
