import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from './src/store/useStore';
import { colors } from './src/constants/theme';

import { RoleGateScreen } from './src/screens/RoleGateScreen';
import { PatientHomeScreen } from './src/screens/patient/PatientHomeScreen';
import { PatientToolsScreen } from './src/screens/patient/PatientToolsScreen';
import { PatientTeamScreen } from './src/screens/patient/PatientTeamScreen';
import { AllyDashboardScreen } from './src/screens/ally/AllyDashboardScreen';
import { AllyTranslatorScreen } from './src/screens/ally/AllyTranslatorScreen';
import { TherapistCaseloadScreen } from './src/screens/therapist/TherapistCaseloadScreen';
import { TherapistDataStreamScreen } from './src/screens/therapist/TherapistDataStreamScreen';
import { SafetyContractScreen } from './src/screens/shared/SafetyContractScreen';
import { ChatScreen } from './src/screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tools') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceLight,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeScreen} />
      <Tab.Screen name="Tools" component={PatientToolsScreen} />
      <Tab.Screen name="Team" component={PatientTeamScreen} />
    </Tab.Navigator>
  );
}

function AllyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Translator') {
            iconName = focused ? 'language' : 'language-outline';
          } else if (route.name === 'Learn') {
            iconName = focused ? 'book' : 'book-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.cardAlly,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceLight,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AllyDashboardScreen} />
      <Tab.Screen name="Translator" component={AllyTranslatorScreen} />
    </Tab.Navigator>
  );
}

function TherapistTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Caseload') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'DataStream') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Interventions') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.cardTherapist,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceLight,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Caseload" component={TherapistCaseloadScreen} />
      <Tab.Screen 
        name="DataStream" 
        component={TherapistDataStreamScreen}
        options={{ tabBarLabel: 'Data' }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { user, selectedRole } = useStore();
  
  const getMainScreen = () => {
    const role = user?.role || selectedRole;
    switch (role) {
      case 'patient':
        return PatientTabs;
      case 'ally':
        return AllyTabs;
      case 'therapist':
        return TherapistTabs;
      default:
        return PatientTabs;
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={getMainScreen()} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="SafetyContract" component={SafetyContractScreen} />
      <Stack.Screen name="PatientDetail" component={TherapistDataStreamScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, selectedRole } = useStore();

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!isAuthenticated && !selectedRole ? (
          <Stack.Screen name="RoleGate" component={RoleGateScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
