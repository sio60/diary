// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";
import { applyGlobalTextStyles } from "./src/theme/fontSetup";
import colors from "./src/theme/colors";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { loading, user } = useAuth();
  if (loading) return null;

  // ✅ 백엔드 키와 동일하게 체크
  const profileDone = !!(user?.birth && user?.first_day && user?.mbti);

  return (
    <Stack.Navigator
      key={user ? (profileDone ? "app" : "needProfile") : "auth"}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontFamily: "BMJUA" },
        headerTintColor: colors.text,
      }}
    >
      {user ? (
        profileDone ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "메인", headerBackVisible: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupScreen}
              options={{ title: "프로필 설정", headerBackVisible: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "메인" }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ BMJUA: require("./assets/BMJUA_ttf.ttf") });
  useEffect(() => { if (fontsLoaded) applyGlobalTextStyles(); }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
