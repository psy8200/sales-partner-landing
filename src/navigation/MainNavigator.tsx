import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightTheme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/main/HomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 메인 탭 네비게이션
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Benefits':
              iconName = 'card-giftcard';
              break;
            case 'Settlement':
              iconName = 'account-balance-wallet';
              break;
            case 'Partner':
              iconName = 'people';
              break;
            case 'More':
              iconName = 'more-horiz';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: lightTheme.colors.background,
          borderTopColor: lightTheme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="Benefits"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '혜택',
        }}
      />
      <Tab.Screen
        name="Settlement"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '정산',
        }}
      />
      <Tab.Screen
        name="Partner"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '파트너',
        }}
      />
      <Tab.Screen
        name="More"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '전체',
        }}
      />
    </Tab.Navigator>
  );
};

// 플레이스홀더 화면 (아직 구현되지 않은 화면들)
const PlaceholderScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>준비 중인 화면입니다.</Text>
    </View>
  );
};

// 메인 네비게이터
export const MainNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};