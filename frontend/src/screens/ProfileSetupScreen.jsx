// src/screens/ProfileSetupScreen.jsx
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard
} from "react-native";
import Screen from "../components/Screen";
import colors from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { apiUpdateProfile } from "../lib/api";

const MBTI_LIST = [
  "ISTJ","ISFJ","INFJ","INTJ",
  "ISTP","ISFP","INFP","INTP",
  "ESTP","ESFP","ENFP","ENTP",
  "ESTJ","ESFJ","ENFJ","ENTJ",
];

export default function ProfileSetupScreen({ navigation, route }) {
  const { user } = useAuth();
  const nickname = route?.params?.nickname ?? user?.nickname ?? "";

  const [birth, setBirth] = useState("");       // YYYY-MM-DD
  const [firstDay, setFirstDay] = useState(""); // YYYY-MM-DD
  const [mbti, setMbti] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const onSave = async () => {
    if (!validDate(birth)) return Alert.alert("생일 형식", "YYYY-MM-DD 로 입력해줘.");
    if (!validDate(firstDay)) return Alert.alert("처음 만난 날 형식", "YYYY-MM-DD 로 입력해줘.");
    if (!MBTI_LIST.includes(mbti)) return Alert.alert("MBTI", "16가지 중 하나를 선택해줘.");
    try {
      setLoading(true);
      await apiUpdateProfile({ birth, first_day: firstDay, mbti });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (e) {
      Alert.alert("저장 실패", e?.message || "잠시 후 다시 시도해줘.");
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={64}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.nickRow}>
              <Text style={s.nickBadge}>닉네임: {nickname || "미설정"}</Text>
            </View>

            <Text style={s.label}>생일 (YYYY-MM-DD)</Text>
            <TextInput
              style={s.input}
              placeholder="예) 2001-05-21"
              placeholderTextColor="#A87C7C"
              value={birth}
              onChangeText={setBirth}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />

            <Text style={s.label}>처음 만난 날 (YYYY-MM-DD)</Text>
            <TextInput
              style={s.input}
              placeholder="예) 2024-09-16"
              placeholderTextColor="#A87C7C"
              value={firstDay}
              onChangeText={setFirstDay}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />

            <Text style={s.label}>MBTI</Text>

            {/* 드롭다운 래퍼: zIndex/elevation + 내부 스크롤 */}
            <View style={s.ddWrap}>
              <TouchableOpacity style={s.ddBtn} onPress={() => setOpen(v => !v)}>
                <Text style={s.ddBtnTx}>{mbti || "선택하세요"}</Text>
              </TouchableOpacity>

              {open && (
                <View style={s.ddMenu}>
                  <ScrollView
                    style={{ maxHeight: 260 }}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {MBTI_LIST.map((t) => {
                      const active = mbti === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[s.ddItem, active && s.ddItemActive]}
                          onPress={() => { setMbti(t); setOpen(false); }}
                        >
                          <Text style={[s.ddItemTx, active && s.ddItemTxActive]}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <TouchableOpacity style={s.btn} onPress={onSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTx}>저장하고 시작하기</Text>}
            </TouchableOpacity>

            {/* 아래 여백: 마지막 버튼이 키보드에 가려지지 않도록 */}
            <View style={{ height: 32 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20 },
  nickRow: { alignItems: "center", marginBottom: 6 },
  nickBadge: {
    color: colors.text,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
    fontWeight: "800",
  },
  label: { color: colors.text, marginTop: 10, marginBottom: 6, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Dropdown
  ddWrap: {
    marginBottom: 8,
    zIndex: 100,          // iOS
  },
  ddBtn: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  ddBtnTx: { color: colors.text, fontWeight: "700" },

  ddMenu: {
    marginTop: 6,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    overflow: "hidden",
    elevation: 6,         // Android z-order
  },
  ddItem: { paddingVertical: 12, paddingHorizontal: 14 },
  ddItemActive: { backgroundColor: colors.primary },
  ddItemTx: { color: colors.text, fontWeight: "700" },
  ddItemTxActive: { color: "#fff" },

  btn: {
    backgroundColor: colors.primary, padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 12,
  },
  btnTx: { color: "#fff", fontWeight: "800" },
});
