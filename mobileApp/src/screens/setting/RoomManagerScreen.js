import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/RoomManagerScreenStyle';

export default function RoomManagerScreen({ route, navigation }) {
    const { rooms: initialRooms = [] } = route.params || {};
    const [rooms, setRooms] = useState(initialRooms);
    const [addRoomVisible, setAddRoomVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [savingRoom, setSavingRoom] = useState(false);

    const handleAddRoom = async () => {
        if (!newRoomName.trim()) return;
        setSavingRoom(true);
        // TODO: Gọi API tạo phòng nếu cần
        setRooms([...rooms, { name: newRoomName }]);
        setNewRoomName('');
        setAddRoomVisible(false);
        setSavingRoom(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {rooms.map((room, idx) => (
                        <TouchableOpacity key={room._id || idx} style={styles.roomRow}>
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
                                <Text style={[styles.popupBtnText, { color: '#1976d2', fontWeight: '500' }]}>Hoàn tất</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
