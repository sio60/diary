import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import colors from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !pw) return Alert.alert("이메일/비밀번호는 필수예요");
    setLoading(true);
    try {
      const data = await register({
        email: email.trim().toLowerCase(),
        password: pw,
        nickname: nickname.trim() || null,
      });

      const nick = data?.user?.nickname || "";
      // ✅ 스택 리셋 + ProfileSetup로 닉네임 전달
      navigation.reset({
        index: 0,
        routes: [{ name: "ProfileSetup", params: { nickname: nick } }],
      });
    } catch (e) {
      Alert.alert("회원가입 실패", e.message || "다시 시도해주세요");
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <View style={s.wrap}>
        <Text style={s.preview}>닉네임: <Text style={s.previewStrong}>{nickname || "미입력"}</Text></Text>
        <Text style={s.title}>회원가입</Text>

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
        <TextInput
          style={s.input}
          placeholder="닉네임(선택)"
          placeholderTextColor="#A87C7C"
          value={nickname}
          onChangeText={setNickname}
        />

        <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={s.btnTx}>가입하기</Text>}
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 12, justifyContent: "center" },
  preview: { color: colors.text, textAlign: "center", marginBottom: 6 },
  previewStrong: { fontWeight: "800", color: colors.link },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  input: { backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 6 },
  btnTx: { color: "#fff", fontWeight: "800" },
});
