import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, FlatList, Modal, } from 'react-native';
import { getRooms } from '../../api/room';
import { getAuth } from '../../storage/auth';
import RoomCard from '../../components/RoomCard';
import styles from '../../styles/RoomScreenStyle';


export default function RoomScreen({ navigation }) {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
      <FlatList
        data={rooms}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <RoomCard room={item} onPress={() => navigation.navigate('DeviceScreen', { roomId: item._id, roomName: item.name })} />}
        refreshing={refreshing}
        onRefresh={fetchRooms}
        style={{ width: '100%', marginTop: 12 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>Chưa có phòng nào</Text>}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thiết bị của tôi</Text>
          </View>
        )}
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
