import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import GoalDetailScreen from './src/screens/GoalDetailScreen';
import LedgerScreen from './src/screens/LedgerScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import { colors } from './src/theme/tokens';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: '🏠',
  Ledger: '📒',
  Kakis: '🧑\u200d🤝\u200d🧑',
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} />
    </HomeStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.jadeDark,
          tabBarInactiveTintColor: colors.textDim,
          tabBarStyle: {
            borderTopColor: colors.line,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Ledger" component={LedgerScreen} />
        <Tab.Screen name="Kakis" component={FriendsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
