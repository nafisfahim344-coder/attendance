import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';

import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { OTPVerifyScreen } from '../features/auth/screens/OTPVerifyScreen';
import { EmailLoginScreen } from '../features/auth/screens/EmailLoginScreen';
import { ClockScreen } from '../features/attendance/screens/ClockScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { ReportsScreen } from '../features/reports/screens/ReportsScreen';

import type { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <AuthStack.Screen name="EmailLogin" component={EmailLoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark[800] },
        headerTintColor: colors.white,
        tabBarStyle: { backgroundColor: colors.dark[800] },
      }}
    >
      <Tab.Screen name="Home" component={ClockScreen} options={{ title: 'Clock' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="More" component={() => <View><Text>More</Text></View>} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.dark[900], justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
