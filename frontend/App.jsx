import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import { applyGlobalTextStyles } from "./src/theme/fontSetup";
import colors from "./src/theme/colors";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { loading, user } = useAuth();
  if (loading) return null;

  return (
    <Stack.Navigator
      key={user ? "app" : "auth"}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontFamily: "BMJUA" },
        headerTintColor: colors.text,
      }}
    >
      {user ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "메인", headerBackVisible: false }}
        />
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
