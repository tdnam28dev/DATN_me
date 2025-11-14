import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/RoomSettingScreenStyle';
import { getAuth } from '../../storage/auth';
import { updateRoomByUser, deleteRoomByUser } from '../../api/room';

export default function RoomSettingScreen({ route, navigation }) {
    const { room, onRoomUpdated, onRoomDeleted } = route.params || {};
    const [roomDetail, setRoomDetail] = useState(room);
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [newName, setNewName] = useState(room.name);
    const [savingName, setSavingName] = useState(false);
    const [showVideo, setShowVideo] = useState(true);

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSavingName(true);
        try {
            const auth = await getAuth();
            const updated = await updateRoomByUser(roomDetail._id, { name: newName }, auth.token);
            setRoomDetail(updated);
            // call parent callback if provided so RoomManager can update its list
            if (typeof onRoomUpdated === 'function') onRoomUpdated(updated);
            setEditNameVisible(false);
        } catch (err) {
            // Có thể hiển thị thông báo lỗi
        } finally {
            setSavingName(false);
        }
    };

    const handleDeleteRoom = async () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa phòng này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        const auth = await getAuth();
                        await deleteRoomByUser(roomDetail._id, auth.token);
                        if (typeof onRoomDeleted === 'function') onRoomDeleted(roomDetail._id);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Lỗi', 'Không thể xóa phòng.\n' + err.message);
                    }
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} onPress={() => setEditNameVisible(true)}>
                        <Text style={styles.label}>Name</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{roomDetail.name}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Group</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>Ungrouped Rooms</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Device</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Tap-to-Run</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Show Video Components</Text>
                        <Switch value={showVideo} onValueChange={setShowVideo} />
                    </View>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Linked Video Device</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <View>
                            <Text style={styles.label}>Device View Mode</Text>
                            <Text style={styles.subLabel}>Applies to all rooms</Text>
                        </View>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>Grid</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteRoom}>
                    <Text style={styles.deleteText}>Delete Room</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* Popup sửa tên phòng */}
            <Modal
                visible={editNameVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setEditNameVisible(false)}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupTitle}>Name</Text>
                        <TextInput
                            style={styles.popupInput}
                            placeholder="Tên phòng"
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                        />
                        <View style={styles.popupBtnRow}>
                            <TouchableOpacity
                                style={styles.popupBtnCancel}
                                onPress={() => setEditNameVisible(false)}
                                disabled={savingName}
                            >
                                <Text style={styles.popupBtnText}>Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.popupBtnSave}
                                onPress={handleSaveName}
                                disabled={savingName || !newName.trim()}
                            >
                                <Text style={[styles.popupBtnText, { color: '#1976d2', fontWeight: '500' }]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
