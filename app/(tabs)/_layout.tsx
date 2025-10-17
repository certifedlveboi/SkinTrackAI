import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          height: Platform.select({
            ios: insets.bottom + 60,
            android: 60,
            default: 70,
          }),
          paddingTop: 8,
          paddingBottom: Platform.select({
            ios: insets.bottom + 8,
            android: 8,
            default: 8,
          }),
          paddingHorizontal: 16,
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          borderTopColor: theme.colors.glassBorder,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory-2" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: focused ? theme.colors.primary : theme.colors.secondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <MaterialIcons name="face-retouching-natural" size={28} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="timeline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="auto-awesome" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
