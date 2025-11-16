import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import DeviceCard from '../../components/DeviceCard';
import { getDevicesByUser, createDevice, updateDevice } from '../../api/device';
import { getAuth } from '../../storage/auth';
import { getNodesByUser } from '../../api/node';
import { getRoomsByUser } from '../../api/room';

export default function DeviceScreen({ route, navigation }) {
    const { roomId, roomName } = route?.params || {};
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    // Các state cho modal thêm thiết bị
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ name: '', type: '', location: '', node: '', room: '', pin: '' });
    const [nodes, setNodes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [pins, setPins] = useState([]);
    const [token, setToken] = useState('');


    // Lấy token, danh sách node, room, device
    const fetchAll = async (refreshOnly = false) => {
        if (!refreshOnly) setLoading(true);
        setRefreshing(true);
        try {
            const auth = await getAuth();
            const t = auth?.token || '';
            setToken(t);
            // Lấy danh sách thiết bị theo roomId nếu có
            const deviceRes = await getDevicesByUser(t);
            setDevices(Array.isArray(deviceRes) ? deviceRes : []);
            // Lấy node
            const nodeRes = await getNodesByUser(t);
            setNodes(Array.isArray(nodeRes) ? nodeRes : []);
            // Lấy room
            const roomRes = await getRoomsByUser(t);
            setRooms(Array.isArray(roomRes) ? roomRes : []);
            setError('');
        } catch (e) {
            setDevices([]);
            setNodes([]);
            setRooms([]);
            setError('Lỗi kết nối server');
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

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
                room: form.room || roomId // Ưu tiên form.room, nếu không có thì lấy roomId hiện tại
            };
            await createDevice(payload, token);
            setModalVisible(false);
            setForm({ name: '', type: '', location: '', node: '', room: '', pin: '' });
            // Reload danh sách thiết bị đúng phòng
            await fetchAll(true);
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
            {/* Nút quay lại nếu có roomId */}
            {roomId && (
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>{'< Quay lại'}</Text>
                </TouchableOpacity>
            )}
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
                        onRefresh={fetchAll}
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
    container: {
        flex: 1,
        backgroundColor: '#d4d4d4ff',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    backBtn: {
        marginBottom: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: '#f0f4ff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cce0ff',
        elevation: 2,
    },
    backBtnText: {
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    listContent: {
        paddingBottom: 32,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 85,
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
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 16,
        width: '85%',
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cce0ff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f8fbff',
    },
    modalBtn: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 10,
        minWidth: 90,
        alignItems: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
});
