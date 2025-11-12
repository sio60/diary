import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !pw) return Alert.alert("이메일/비밀번호는 필수예요");
    setLoading(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password: pw,
        nickname: nickname.trim() || null,
      });
    } catch (e) {
      Alert.alert("회원가입 실패", e.message || "다시 시도해주세요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>회원가입</Text>
      <TextInput
        style={s.input}
        placeholder="이메일"
        placeholderTextColor="#777"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="비밀번호"
        placeholderTextColor="#777"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
      />
      <TextInput
        style={s.input}
        placeholder="닉네임(선택)"
        placeholderTextColor="#777"
        value={nickname}
        onChangeText={setNickname}
      />
      <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={s.btnTx}>가입하기</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12, justifyContent: "center" },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1c1c1e",
    color: "#fff",
    padding: 14,
    borderRadius: 12,
  },
  btn: {
    backgroundColor: "#4b5563",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  btnTx: { color: "#fff", fontWeight: "800" },
});
