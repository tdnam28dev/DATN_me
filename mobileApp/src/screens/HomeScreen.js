import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, FlatList, Modal,} from 'react-native';
import { createRoom, getRooms } from '../api/room';
import { getAuth } from '../storage/auth';
import RoomCard from '../components/RoomCard';
import styles from '../styles/HomeScreenStyle';
import { getWeather } from '../api/weather';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HomeScreen() {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [weather, setWeather] = useState(null);
  // const [isOn, setIsOn] = useState(false);
  // Lấy danh sách phòng
  const fetchRooms = async () => {
    setRefreshing(true);
    const auth = await getAuth();
    if (!auth || !auth.token) {
      setRooms([]);
      setRefreshing(false);
      return;
    }
    try {
      const res = await getRooms(auth.token);
      if (Array.isArray(res)) {
        setRooms(res);
      } else {
        setRooms([]);
      }
    } catch (e) {
      setRooms([]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRooms();
    // Lấy thời tiết Hà Nội
    (async () => {
      const w = await getWeather('Hanoi,vn');
      setWeather(w);
    })();
  }, []);

  const handleAddRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Lỗi', 'Tên phòng không được để trống');
      return;
    }
    setLoading(true);
    const auth = await getAuth();
    if (!auth || !auth.token || !auth.userid) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      setLoading(false);
      return;
    }
    try {
      const res = await createRoom({ name: roomName, owner: auth.userid }, auth.token);
      if (res && res._id) {
        Alert.alert('Thành công', 'Đã tạo phòng mới!');
        setRoomName('');
        fetchRooms(); // Refresh danh sách phòng
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể tạo phòng');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo phòng');
    }
    setLoading(false);
  };

  return (
    <View style={styles.main}>
      <View style={styles.weatherContainer}>
        {weather ? (
          <View style={styles.weatherInfo}>
            <Ionicons name="cloud-outline" size={54} color="#f9a825" style={styles.weatherIcon} />
            <View style={styles.weatherText}>
              <Text style={styles.weatherTemp}>
                {weather.main}, {weather.temp}°C
              </Text>
              <View style={styles.weatherLocDesc}>
                <Text style={styles.weatherLoc}>
                  {weather.city}, {weather.country}{","}
                </Text>
                <Text style={styles.weatherDesc}>
                  {" "}{weather.desc}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={{ color: '#888', textAlign: 'center' }}>Đang tải thời tiết...</Text>
        )}
      </View>
      <FlatList
        data={rooms}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <RoomCard room={item} />}
        refreshing={refreshing}
        onRefresh={fetchRooms}
        style={{ width: '100%', marginTop: 12 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>Chưa có phòng nào</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Thêm phòng mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên phòng"
              value={roomName}
              onChangeText={setRoomName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={async () => {
                await handleAddRoom();
                if (!loading) setModalVisible(false);
              }} disabled={loading}>
                <Text style={{ color: '#fff' }}>{loading ? 'Đang tạo...' : 'Thêm phòng'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#aaa' }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}