import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../theme/colors";

export default function Screen({ children }) {
  return <View style={s.bg}>{children}</View>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
});
