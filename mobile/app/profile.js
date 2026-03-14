import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-circle-outline" size={80} color="#64748B" />
          <Text style={styles.notLoggedInText}>Vous n'etes pas connecte</Text>
        </View>
      </View>
    );
  }

  const menuItems = [
    { icon: 'calendar', label: 'Mes rendez-vous', route: '/my-appointments' },
    { icon: 'heart', label: 'Mes favoris', route: '/favorites' },
    { icon: 'card', label: 'Moyens de paiement', route: '/payment-methods' },
    { icon: 'notifications', label: 'Notifications', route: '/notifications' },
    { icon: 'help-circle', label: 'Aide', route: '/help' },
    { icon: 'settings', label: 'Parametres', route: '/settings' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <Image 
          source={{ uri: user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=4F46E5&color=fff` }}
          style={styles.userAvatar}
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon} size={22} color="#818cf8" />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        <Text style={styles.logoutButtonText}>Deconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInText: {
    color: '#64748B',
    marginTop: 16,
    fontSize: 16,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginHorizontal: 20,
  },
  userAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
});
