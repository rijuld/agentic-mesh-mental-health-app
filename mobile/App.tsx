import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from './src/store/useStore';
import { colors } from './src/constants/theme';

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PatientHomeScreen } from './src/screens/patient/PatientHomeScreen';
import { PatientToolsScreen } from './src/screens/patient/PatientToolsScreen';
import { PatientTeamScreen } from './src/screens/patient/PatientTeamScreen';
import { AllyDashboardScreen } from './src/screens/ally/AllyDashboardScreen';
import { AllyTranslatorScreen } from './src/screens/ally/AllyTranslatorScreen';
import { AllyLearnScreen } from './src/screens/ally/AllyLearnScreen';

// ... (existing imports, but for ReplaceContent we need contiguous block. 
// I will just add the import at the top and the screen in the function separately? 
// No, I can't do multiple discontinuous edits with replace_file_content unless I use multi_replace.
// I will use multi_replace to be safe and efficient.)
import { TherapistCaseloadScreen } from './src/screens/therapist/TherapistCaseloadScreen';
import { LinkPatientScreen } from './src/screens/therapist/LinkPatientScreen';
import { TherapistDataStreamScreen } from './src/screens/therapist/TherapistDataStreamScreen';
import { SafetyContractScreen } from './src/screens/shared/SafetyContractScreen';
import { ChatScreen } from './src/screens/shared/ChatScreen';
import { SkillsLibraryScreen } from './src/screens/patient/tools/SkillsLibraryScreen';
import { SkillDetailScreen } from './src/screens/patient/tools/SkillDetailScreen';
import { JournalScreen } from './src/screens/patient/tools/JournalScreen';
import { FPBufferScreen } from './src/screens/patient/tools/FPBufferScreen';
import { MentalizationMirrorScreen } from './src/screens/patient/tools/MentalizationMirrorScreen';

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
      <Tab.Screen name="Learn" component={AllyLearnScreen} />
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
      <Stack.Screen name="LinkPatient" component={LinkPatientScreen} />
      <Stack.Screen name="SkillsLibrary" component={SkillsLibraryScreen} />
      <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="FPBuffer" component={FPBufferScreen} />
      <Stack.Screen name="MentalizationMirror" component={MentalizationMirrorScreen} />
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
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
