import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/RoomManagerScreenStyle';
import { createRoom } from '../../api/room';
import { getAuth } from '../../storage/auth';

export default function RoomManagerScreen({ route, navigation }) {
    const { rooms: initialRooms = [], homeid } = route.params || {};
    const [rooms, setRooms] = useState(initialRooms);
    const [addRoomVisible, setAddRoomVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [savingRoom, setSavingRoom] = useState(false);

    const handleAddRoom = async () => {
        if (!newRoomName.trim()) return;
        setSavingRoom(true);
        try {
            const auth = await getAuth();
            const newRoom = await createRoom({ name: newRoomName.trim(), home: homeid, owner: auth.userid }, auth.token);
            setRooms(prev => [...prev, newRoom]);
            setNewRoomName('');
            setAddRoomVisible(false);
        } catch (err) {
            // Hiển thị thông báo lỗi cho người dùng nếu cần
            console.error('Lỗi khi tạo phòng:', err);
        } finally {
            setSavingRoom(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {rooms.map((room, idx) => (
                        <TouchableOpacity
                            key={room._id || idx}
                            style={styles.roomRow}
                            onPress={() => navigation && navigation.navigate && navigation.navigate('RoomSetting', {
                                room,
                                homeid,
                                onRoomUpdated: (updatedRoom) => {
                                    setRooms(prev => prev.map(r => (r._id === updatedRoom._id ? updatedRoom : r)));
                                },
                                onRoomDeleted: (deletedRoomId) => {
                                    setRooms(prev => prev.filter(r => r._id !== deletedRoomId));
                                }
                            })}
                        >
                            <Text style={styles.roomName}>{room.name}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setAddRoomVisible(true)}>
                    <Text style={styles.addBtnText}>Thêm phòng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createGroupBtn}>
                    <Text style={styles.createGroupText}>Create Room Group</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* Popup thêm phòng */}
            <Modal
                visible={addRoomVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setAddRoomVisible(false)}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupTitle}>Thêm phòng</Text>
                        <TextInput
                            style={styles.popupInput}
                            placeholder="Tên phòng"
                            value={newRoomName}
                            onChangeText={setNewRoomName}
                            autoFocus
                        />
                        <View style={styles.popupBtnRow}>
                            <TouchableOpacity
                                style={styles.popupBtnCancel}
                                onPress={() => setAddRoomVisible(false)}
                                disabled={savingRoom}
                            >
                                <Text style={styles.popupBtnText}>Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.popupBtnSave}
                                onPress={handleAddRoom}
                                disabled={savingRoom || !newRoomName.trim()}
                            >
                                <Text style={[styles.popupBtnText, { color: '#0000', fontWeight: '500' }]}>Hoàn tất</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
