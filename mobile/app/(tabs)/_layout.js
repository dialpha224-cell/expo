import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        tabBarStyle: { 
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom + 4,
          height: Platform.OS === 'android' ? 65 + Math.max(insets.bottom, 8) : 80,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          headerTitle: 'AfroCrown',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tendances"
        options={{
          title: 'Tendances',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              backgroundColor: focused ? '#FFD700' : 'transparent',
              borderRadius: 12,
              padding: 6,
            }}>
              <Ionicons name="flame" size={20} color={focused ? '#0f172a' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Réserver',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="simulation"
        options={{
          title: 'IA',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trimconnect"
        options={{
          title: 'Battle',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size - 2} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - accessible via navigation */}
      <Tabs.Screen
        name="marketplace"
        options={{
          href: null, // Hide from tab bar
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          href: null, // Hide from tab bar
          title: 'Mes RDV',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
