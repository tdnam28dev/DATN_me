import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Switch from './Switch';

export default function DeviceCard({ name, status, icon, onPress }) {
  const [isOn, setIsOn] = React.useState(!!status);
  React.useEffect(() => {
    setIsOn(!!status);
  }, [status]);
  const cardColor = isOn ? '#d1e7dd' : '#f8d7da'; // xanh nhạt / đỏ nhạt

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      {/* Header */}
      <View style={styles.topRow}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text style={styles.name}>{name}</Text>
      </View>

      {/* Switch thay cho nút Mở/Đóng */}
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <Switch
          isOn={isOn}
          onPress={() => {
            onPress && onPress(!isOn);
          }}
        />
      </View>

      {/* Setting Button */}
      <View style={styles.settingBtnContainer}>
        <TouchableOpacity style={styles.settingBtn}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '45%',
    height: 150,
    borderRadius: 16,
    padding: 14,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
  },
  topRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    marginBottom: 4,
    tintColor: '#333',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingBtnContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
  },
  settingBtn: {},
  settingIcon: {
    fontSize: 20,
  },
});
