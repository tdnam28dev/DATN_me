import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import DeviceCard from '../components/DeviceCard';
import { getDevices, createDevice, updateDevice } from '../api/device';
import { getAuth } from '../storage/auth';
import { getNodes } from '../api/node';
import { getRooms } from '../api/room';

export default function DeviceScreen({}) {
  const [refreshing, setRefreshing] = useState(false);
  const fetchDevices = async () => {
    setRefreshing(true);
    try {
      const res = await getDevices(token);
      if (Array.isArray(res)) setDevices(res);
    } catch (e) {}
    setRefreshing(false);
  };
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', location: '', node: '', room: '', pin: '' });
  const [nodes, setNodes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pins, setPins] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    async function fetchTokenAndDevices() {
      const auth = await getAuth();
      const t = auth?.token || '';
      setToken(t);
      try {
        const res = await getDevices(t);
        if (Array.isArray(res)) setDevices(res);
        else setError('Không lấy được danh sách thiết bị');
      } catch (e) {
        setError('Lỗi kết nối server');
      }
      setLoading(false);
    }
    fetchTokenAndDevices();
    (async () => {
      try {
        const auth = await getAuth();
        if (auth?.token) {
          const nodeRes = await getNodes(auth.token);
          if (Array.isArray(nodeRes)) setNodes(nodeRes);
        }
      } catch (e) {
        setNodes([]);
      }
      try {
        const auth = await getAuth();
        if (auth?.token) {
          const roomRes = await getRooms(auth.token);
          if (Array.isArray(roomRes)) setRooms(roomRes);
        }
      } catch (e) {
        setRooms([]);
      }
    })();
  }, []);

  const handleAddDevice = async () => {
    try {
      // Lấy owner từ auth
      const auth = await getAuth();
      const owner = auth?.userid;
      const payload = {
        name: form.name,
        type: form.type,
        status: false,
        location: form.location,
        pin: Number(form.pin),
        node: form.node,
        owner,
        room: form.room
      };
      await createDevice(payload, token);
      setModalVisible(false);
      setForm({ name: '', type: '', location: '', node: '', room: '', pin: '' });
      // Reload danh sách thiết bị
      const res = await getDevices(token);
      if (Array.isArray(res)) setDevices(res);
    } catch (e) {
      setError('Không thể thêm thiết bị');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        keyExtractor={item => item._id || item.id}
        renderItem={({ item }) => (
          <DeviceCard
            name={item.name}
            status={!!item.status}
            onPress={async (newStatus) => {
              try {
                await updateDevice(token, item._id || item.id, { status: newStatus });
                setDevices(devices => devices.map(d =>
                  (d._id || d.id) === (item._id || item.id) ? { ...d, status: newStatus } : d
                ));
              } catch (e) {
                setError('Không thể cập nhật trạng thái thiết bị');
              }
            }}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.center}>Không có thiết bị nào</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchDevices}
          />
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Thêm thiết bị mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên thiết bị"
              value={form.name}
              onChangeText={text => setForm(f => ({ ...f, name: text }))}
            />
            <Text style={{ marginTop: 8 }}>Chọn loại thiết bị</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['light', 'fan', 'sensor', 'door', 'camera'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={{
                    padding: 8,
                    backgroundColor: form.type === type ? '#007bff' : '#eee',
                    borderRadius: 6,
                    marginRight: 8
                  }}
                  onPress={() => setForm(f => ({ ...f, type }))}
                >
                  <Text style={{ color: form.type === type ? '#fff' : '#222' }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Vị trí"
              value={form.location}
              onChangeText={text => setForm(f => ({ ...f, location: text }))}
            />
            <Text style={{ marginTop: 8 }}>Chọn Node</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8 }}>
              <FlatList
                data={nodes}
                keyExtractor={item => item._id}
                horizontal
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      padding: 8,
                      backgroundColor: form.node === item._id ? '#007bff' : '#eee',
                      borderRadius: 6,
                      marginRight: 8
                    }}
                    onPress={() => {
                      // Nếu node có trường room thì gán, nếu không thì giữ nguyên
                      setForm(f => ({ ...f, node: item._id, room: item.room ? item.room : '', pin: '' }));
                      // Nếu node có pinsAvailable thì set pins, nếu không thì dùng mặc định
                      if (item.pinsAvailable && Array.isArray(item.pinsAvailable) && item.pinsAvailable.length > 0) {
                        setPins(item.pinsAvailable);
                      } else {
                        setPins([19, 5, 16, 0, 15]);
                      }
                    }}
                  >
                    <Text style={{ color: form.node === item._id ? '#fff' : '#222' }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <Text style={{ marginTop: 8 }}>Chọn pin</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {pins.map(pin => (
                <TouchableOpacity
                  key={pin}
                  style={{
                    padding: 8,
                    backgroundColor: String(form.pin) === String(pin) ? '#007bff' : '#eee',
                    borderRadius: 6,
                    marginRight: 8
                  }}
                  onPress={() => setForm(f => ({ ...f, pin }))}
                >
                  <Text style={{ color: String(form.pin) === String(pin) ? '#fff' : '#222' }}>{pin}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleAddDevice}>
                <Text style={{ color: '#fff' }}>Thêm</Text>
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

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
    marginHorizontal: 4,
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#8f8f8fff',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});