import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { login, register } from '../api/auth';
import { getCurrentUser } from '../api/user';
import { saveAuth, getAuth } from '../storage/auth';
import { saveUser } from '../storage/user';
import Logo from '../assets/img/logo.svg';

export default function AuthScreen({ navigation, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', email: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(form.username, form.password);
        if (res.token) {
          const userData = await getCurrentUser(res.token);
          await saveUser({ name: userData.name, email: userData.email, phone: userData.phone, country: userData.country });
          await saveAuth({ username: form.username, password: form.password, token: res.token, userid: res.id });
          onLogin && onLogin(res.token, res.id);
          navigation && navigation.navigate && navigation.navigate('MainTabs');
        } else {
          setError(res.error || 'Đăng nhập thất bại');
        }
      } else {
        const res = await register(form.username, form.password, form.email, form.name);
        if (res.user) {
          setIsLogin(true);
        } else {
          setError(res.error || 'Đăng ký thất bại');
        }
      }
    } catch (e) {
      setError('Lỗi kết nối server');
    }
    setLoading(false);
  };

  return (
    // <ImageBackground source={require('../assets/img/1.jpg')} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={v => handleChange('username', v)}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={form.password}
          onChangeText={v => handleChange('password', v)}
          secureTextEntry
        />
        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={v => handleChange('email', v)}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Tên"
              value={form.name}
              onChangeText={v => handleChange('name', v)}
            />
          </>
        )}
        <Button title={isLogin ? 'Đăng nhập' : 'Đăng ký'} onPress={handleSubmit} disabled={loading} />
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </Text>
        </TouchableOpacity>
      </View>
    // </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  switchBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#007bff',
  },
});
