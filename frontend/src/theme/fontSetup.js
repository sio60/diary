// 전역 폰트 적용 도우미
import { Text, TextInput } from "react-native";

let applied = false;
export function applyGlobalTextStyles() {
  if (applied) return;
  applied = true;

  // Text 기본 폰트
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = [
    Text.defaultProps.style,
    { fontFamily: "BMJUA" }, // 로드된 이름
  ];

  // TextInput 기본 폰트
  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = [
    TextInput.defaultProps.style,
    { fontFamily: "BMJUA" },
  ];
}
