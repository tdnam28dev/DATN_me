import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import styles from '../../styles/NodeScreenStyle';
import { getAuth } from '../../storage/auth';
import { getNodesByUser, createNode, deleteNode } from '../../api/node';
import { getRooms } from '../../api/room';

export default function NodeScreen() {
  const [nodes, setNodes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', room: '', type: '' });
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configStep, setConfigStep] = useState(0); // 0: chưa cấu hình, 1: hướng dẫn, 2: nhập wifi
  const [wifiForm, setWifiForm] = useState({ ssid: '', password: '', email: '', userpass: '', nodeid: '' });
  const [wifiLoading, setWifiLoading] = useState(false);

  const fetchNodes = async () => {
    setRefreshing(true);
    const auth = await getAuth();
    if (!auth || !auth.token) {
      setNodes([]);
      setRefreshing(false);
      return;
    }
    try {
      const res = await getNodesByUser(auth.token);
      if (Array.isArray(res)) setNodes(res);
      else setNodes([]);
    } catch (e) {
      setNodes([]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  // Lấy danh sách phòng khi mở modal
  useEffect(() => {
    const fetchRoomsList = async () => {
      if (modalVisible) {
        const auth = await getAuth();
        if (auth && auth.token) {
          try {
            const res = await getRooms(auth.token);
            if (Array.isArray(res)) setRooms(res);
            else setRooms([]);
          } catch (e) {
            setRooms([]);
          }
        }
      } else {
        setRooms([]);
      }
    };
    fetchRoomsList();
  }, [modalVisible]);

  // Danh sách loại node
  const nodeTypes = [
    { label: 'Bóng đèn', value: 'light' },
    { label: 'Cửa', value: 'door' },
    { label: 'Quạt', value: 'fan' },
    { label: 'Cảm biến', value: 'sensor' },
    { label: 'Khác', value: 'other' },
  ];

  const handleAddNode = async () => {
    if (!form.name.trim()) {
      Alert.alert('Lỗi', 'Tên node không được để trống');
      return;
    }
    if (!form.room) {
      Alert.alert('Lỗi', 'Bạn phải chọn phòng');
      return;
    }
    if (!form.type) {
      Alert.alert('Lỗi', 'Bạn phải chọn loại node');
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
      const res = await createNode({ name: form.name, owner: auth.userid, room: form.room, type: form.type }, auth.token);
      if (res && res._id) {
        Alert.alert('Thành công', 'Đã thêm node mới!');
        setForm({ name: '', room: '', type: '' });
        setModalVisible(false);
        fetchNodes();
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể thêm node');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm node');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách Node</Text>
      </View>
      <FlatList
        data={nodes}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedNode(item)}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>IP: {item.ip || 'Chưa kết nối'}</Text>
              <Text style={styles.info}>MAC: {item.mac || 'Chưa kết nối'}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNodes} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>Chưa có node nào</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
      {/* Thêm node mới */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Thêm node mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên node"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />
            {/* Chọn loại node */}
            <Text style={{ marginTop: 8, marginBottom: 4 }}>Chọn loại node</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              onPress={() => setTypeModalVisible(true)}
            >
              <Text style={{ color: form.type ? '#222' : '#888' }}>
                {form.type ? (
                  nodeTypes.find(t => t.value === form.type)?.label || 'Chọn loại node'
                ) : '-- Chọn loại node --'}
              </Text>
            </TouchableOpacity>
            <Modal visible={typeModalVisible} animationType="slide" transparent onRequestClose={() => setTypeModalVisible(false)}>
              <View style={styles.modalBg}>
                <View style={[styles.modalContent, { padding: 0, width: '80%' }]}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 16 }}>Chọn loại node</Text>
                  <FlatList
                    data={nodeTypes}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: form.type === item.value ? '#e6f0ff' : '#fff' }}
                        onPress={() => {
                          setForm(f => ({ ...f, type: item.value }));
                          setTypeModalVisible(false);
                        }}
                      >
                        <Text style={{ fontSize: 16, color: '#222' }}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 24, color: '#888' }}>Không có loại node</Text>}
                  />
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#aaa', margin: 16 }]} onPress={() => setTypeModalVisible(false)}>
                    <Text style={{ color: '#fff' }}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            {/* Chọn phòng */}
            <Text style={{ marginTop: 8, marginBottom: 4 }}>Chọn phòng</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              onPress={() => setRoomModalVisible(true)}
            >
              <Text style={{ color: form.room ? '#222' : '#888' }}>
                {form.room ? (rooms.find(r => r._id === form.room)?.name || 'Chọn phòng') : '-- Chọn phòng --'}
              </Text>
            </TouchableOpacity>
            <Modal visible={roomModalVisible} animationType="slide" transparent onRequestClose={() => setRoomModalVisible(false)}>
              <View style={styles.modalBg}>
                <View style={[styles.modalContent, { padding: 0, width: '80%' }]}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 16 }}>Chọn phòng</Text>
                  <FlatList
                    data={rooms}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: form.room === item._id ? '#e6f0ff' : '#fff' }}
                        onPress={() => {
                          setForm(f => ({ ...f, room: item._id }));
                          setRoomModalVisible(false);
                        }}
                      >
                        <Text style={{ fontSize: 16, color: '#222' }}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 24, color: '#888' }}>Không có phòng nào</Text>}
                  />
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#aaa', margin: 16 }]} onPress={() => setRoomModalVisible(false)}>
                    <Text style={{ color: '#fff' }}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleAddNode} disabled={loading}>
                <Text style={{ color: '#fff' }}>{loading ? 'Đang thêm...' : 'Thêm node'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#aaa' }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chi tiết node */}
      <Modal visible={!!selectedNode} animationType="slide" transparent onRequestClose={() => setSelectedNode(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selectedNode && (
              <>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, padding: 8 }}
                  onPress={() => setSelectedNode(null)}
                >
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#888' }}>×</Text>
                </TouchableOpacity>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>Thông tin Node</Text>
                <Text style={styles.info}>Tên: {selectedNode.name}</Text>
                <Text style={styles.info}>IP: {selectedNode.ip || 'Chưa kết nối'}</Text>
                <Text style={styles.info}>MAC: {selectedNode.mac || 'Chưa kết nối'}</Text>
                <Text style={styles.info}>ID: {selectedNode._id}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  {/* Nếu node chưa cấu hình IP thì hiện nút cấu hình, nếu đã có IP thì hiện nút cập nhật cấu hình */}
                  {!selectedNode.ip ? (
                    <TouchableOpacity style={styles.modalBtn} onPress={() => {
                      setConfigStep(1);
                    }}>
                      <Text style={{ color: '#fff' }}>Cấu hình Node</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.modalBtn} onPress={async () => {
                      // Lấy thông tin đăng nhập
                      const auth = await getAuth();
                      setWifiForm(f => ({
                        ...f,
                        email: auth?.username || '',
                        userpass: auth?.password || '',
                        nodeid: selectedNode?._id || ''
                      }));
                      setConfigStep(1); // Mở trực tiếp form cấu hình WiFi
                    }}>
                      <Text style={{ color: '#fff' }}>Cập nhật cấu hình</Text>
                    </TouchableOpacity>
                  )}
                  {/* Nút xóa node */}
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: '#e74c3c' }]}
                    onPress={async () => {
                      Alert.alert(
                        'Xác nhận',
                        'Bạn có chắc chắn muốn xóa node này?',
                        [
                          { text: 'Hủy', style: 'cancel' },
                          {
                            text: 'Xóa', style: 'destructive', onPress: async () => {
                              try {
                                const auth = await getAuth();
                                if (!auth || !auth.token) {
                                  Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
                                  return;
                                }
                                const res = await deleteNode(selectedNode._id, auth.token);
                                if (res && res.success !== false) {
                                  Alert.alert('Thành công', 'Đã xóa node!');
                                  setSelectedNode(null);
                                  fetchNodes();
                                } else {
                                  Alert.alert('Lỗi', res.error || 'Không thể xóa node');
                                }
                              } catch (e) {
                                Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa node');
                              }
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={{ color: '#fff' }}>Xóa node</Text>
                  </TouchableOpacity>
                </View>
                {/* Modal hướng dẫn và cấu hình node ESP */}
                <Modal visible={configStep > 0} animationType="slide" transparent onRequestClose={() => setConfigStep(0)}>
                  <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                      {configStep === 1 && (
                        <>
                          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Hướng dẫn kết nối ESP</Text>
                          <Text style={{ marginBottom: 16 }}>
                            1. Vào phần cài đặt WiFi trên điện thoại và kết nối tới WiFi có tên <Text style={{ fontWeight: 'bold' }}>ESP-xxxx</Text> (mật khẩu: <Text style={{ fontWeight: 'bold' }}>12345678</Text>).
                            {'\n'}2. Sau khi kết nối, quay lại ứng dụng để nhập thông tin WiFi cần cấu hình cho ESP.
                          </Text>
                          <TouchableOpacity style={styles.modalBtn} onPress={async () => {
                            // Lấy thông tin đăng nhập
                            const auth = await getAuth();
                            setWifiForm(f => ({
                              ...f,
                              email: auth?.username || '',
                              userpass: auth?.password || '',
                              nodeid: selectedNode?._id || ''
                            }));
                            setConfigStep(2);
                          }}>
                            <Text style={{ color: '#fff' }}>Tôi đã kết nối WiFi ESP</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#aaa', marginTop: 12 }]} onPress={() => setConfigStep(0)}>
                            <Text style={{ color: '#fff' }}>Hủy</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {configStep === 2 && (
                        <>
                          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Nhập thông tin WiFi cho ESP</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="WiFi SSID"
                            value={wifiForm.ssid}
                            onChangeText={text => setWifiForm(f => ({ ...f, ssid: text }))}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="WiFi Password"
                            value={wifiForm.password}
                            onChangeText={text => setWifiForm(f => ({ ...f, password: text }))}
                            secureTextEntry
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Email đăng nhập"
                            value={wifiForm.email}
                            onChangeText={text => setWifiForm(f => ({ ...f, email: text }))}
                            autoCapitalize="none"
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu đăng nhập"
                            value={wifiForm.userpass}
                            onChangeText={text => setWifiForm(f => ({ ...f, userpass: text }))}
                            secureTextEntry
                          />
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                            <TouchableOpacity style={styles.modalBtn} onPress={async () => {
                              setWifiLoading(true);
                              try {
                                const espIp = '192.168.4.1';
                                const url = `http://${espIp}/setup?ssid=${encodeURIComponent(wifiForm.ssid)}&password=${encodeURIComponent(wifiForm.password)}&user=${encodeURIComponent(wifiForm.email)}&userpass=${encodeURIComponent(wifiForm.userpass)}&node=${encodeURIComponent(wifiForm.nodeid)}`;
                                const res = await fetch(url);
                                const text = await res.text();
                                if (text === 'true') {
                                  Alert.alert('Thành công', 'Đã cấu hình ESP thành công!');
                                  setConfigStep(0);
                                  setWifiForm({ ssid: '', password: '', email: '', userpass: '', nodeid: '' });
                                  setSelectedNode(null);
                                  fetchNodes();
                                } else {
                                  Alert.alert('Lỗi', 'Cấu hình ESP thất bại! ' + res);
                                }
                              } catch (e) {
                                Alert.alert('Lỗi', 'Không gửi được thông tin tới ESP' + res);
                              }
                              setWifiLoading(false);
                            }} disabled={wifiLoading}>
                              <Text style={{ color: '#fff' }}>{wifiLoading ? '...' : 'Cập nhật'}</Text>
                            </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#aaa' }]} onPress={() => {setConfigStep(0); setWifiForm({ ssid: '', password: '', email: '', userpass: '', nodeid: '' });setWifiLoading(false);}}>
                              <Text style={{ color: '#fff' }}>Hủy</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </Modal>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


