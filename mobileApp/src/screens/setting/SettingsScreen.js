
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/SettingScreenStyle';
import { getCurrentUser, updateUser } from '../../api/user';
import { getUser, removeUser } from '../../storage/user';
import { getAuth, removeAuth } from '../../storage/auth';

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      const authData = await getAuth();
      setAuth(authData);
      const userData = await getUser();
      setUser(userData);
      if (!user && auth) {
        // Nếu không có user trong storage thì lấy từ API
        userData = await getCurrentUser(auth.token);
        if (userData && !userData.error) {
          setUser({ ...userData, avatar: userData.avatar || null });
        }
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await removeUser();
      await removeAuth();
      setUser(null);
      setAuth(null);
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch (err) {
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header user */}
        <View style={styles.headerUser}>
          {!user ? (
            <ActivityIndicator size={28} color="#8b8b8bff" style={{ marginVertical: 24 }} />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.profilePressable,
                pressed && { opacity: 0.6, transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => navigation && navigation.navigate && navigation.navigate('UserInfo')}
            >
              <View style={styles.avatarWrap}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.userName}>{user.name}</Text>
            </Pressable>
          )}
        </View>

        {/* Service Center */}
        <View style={[styles.serviceCenter, styles.card]}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>Service Center</Text>
            <TouchableOpacity style={styles.cardMoreRow}>
              <Text style={styles.cardMore}>Thêm</Text>
              <Icon name="chevron-forward" size={18} color="#bbb" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.serviceRow}>
            <View style={styles.serviceItem}>
              <Image source={require('../../assets/img/test.png')} style={styles.serviceIcon} />
              <Text style={styles.serviceText}>Alexa</Text>
            </View>
            <View style={styles.serviceItem}>
              <Image source={require('../../assets/img/test.png')} style={styles.serviceIcon} />
              <Text style={styles.serviceText}>Trợ lý Goog...</Text>
            </View>
            <View style={styles.serviceItem}>
              <Image source={require('../../assets/img/test.png')} style={styles.serviceIcon} />
              <Text style={styles.serviceText}>SmartThings</Text>
            </View>
            <View style={styles.serviceItem}>
              <Image source={require('../../assets/img/test.png')} style={styles.serviceIcon} />
              <Text style={styles.serviceText}>IFTTT</Text>
            </View>
          </View>
        </View>

        {/* Danh sách chức năng */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation && navigation.navigate && navigation.navigate('HomeManager')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="home" size={20} color="#ff7a00" />
            </View>
            <Text style={styles.menuText}>Quản Lý Nhà</Text>
            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation && navigation.navigate && navigation.navigate('NodeManager')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FFF8E1' }]}>
              <Icon name="server" size={20} color="#ffb300" />
            </View>
            <Text style={styles.menuText}>Quản Lý Node</Text>
            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#E6F9ED' }]}>
              <Icon name="chatbubble-ellipses" size={20} color="#4cd964" />
            </View>
            <Text style={styles.menuText}>Trung tâm tin nhắn</Text>
            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF8E1' }]}>
              <Icon name="home-outline" size={20} color="#ffb300" />
            </View>
            <Text style={styles.menuText}>HomeKit Information</Text>
            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#E6F4FB' }]}>
              <Icon name="help-circle" size={20} color="#00bfff" />
            </View>
            <Text style={styles.menuText}>Câu hỏi thường gặp và phản hồi</Text>
            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>

        {/* Block mới: các mục bổ sung */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => navigation && navigation.navigate && navigation.navigate('UserInfo')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="person-circle" size={20} color="#8e24aa" />
            </View>
            <Text style={[styles.menuText,]}>Thông tin cá nhân</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation && navigation.navigate && navigation.navigate('AccountSecurity')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="shield-checkmark" size={20} color="#1976d2" />
            </View>
            <Text style={[styles.menuText,]}>Tài khoản và bảo mật</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFFDE7' }]}>
              <Icon name="hardware-chip" size={20} color="#fbc02d" />
            </View>
            <Text style={[styles.menuText,]}>Device Update</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#E1F5FE' }]}>
              <Icon name="information-circle" size={20} color="#039be5" />
            </View>
            <Text style={[styles.menuText,]}>Giới thiệu</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F1F8E9' }]}>
              <Icon name="lock-closed" size={20} color="#43a047" />
            </View>
            <Text style={[styles.menuText,]}>Privacy Settings</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="document-text" size={20} color="#ff9800" />
            </View>
            <Text style={[styles.menuText,]}>Privacy Policy Management</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="pulse" size={20} color="#1976d2" />
            </View>
            <Text style={[styles.menuText,]}>Chẩn đoán mạng</Text>
            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFFDE7' }]}>
              <Icon name="trash" size={20} color="#fbc02d" />
            </View>
            <Text style={[styles.menuText,]}>Xóa bộ nhớ đệm</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#a8a8a8ff', fontSize: 13 }}>22.58M</Text>
              <Icon name="chevron-forward" size={20} color="#bbb" style={styles.menuArrow} />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={{ color: '#F44336', fontWeight: '600', fontSize: 16 }}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

