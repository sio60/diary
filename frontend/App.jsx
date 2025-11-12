import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { loading, user } = useAuth();

  if (loading) return null; // 스플래시로 대체 가능

  return (
    <Stack.Navigator
      key={user ? "app" : "auth"}             // ✅ user 변화 시 스택 리셋(홈으로 전환)
      screenOptions={{ headerTitleAlign: "center" }}
    >
      {user ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "메인", headerBackVisible: false }} // ← 뒤로가기 숨김(선택)
        />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "로그인" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "회원가입" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
