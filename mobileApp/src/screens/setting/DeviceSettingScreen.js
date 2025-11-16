import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/DeviceSettingScreenStyle';
import { getAuth } from '../../storage/auth';
import { getDeviceById, updateDevice, deleteDevice } from '../../api/device';

export default function DeviceSettingScreen({ route, navigation }) {
    const { device, homeid } = route.params || {};
    const [deviceDetail, setDeviceDetail] = useState(device);
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [newName, setNewName] = useState(device.name);
    const [savingName, setSavingName] = useState(false);
    const [showVideo, setShowVideo] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchRoom = async () => {
                try {
                    const auth = await getAuth();
                    const latestDevice = await getDeviceById(device._id, auth.token);
                    console.log('Fetched latest device detail:', latestDevice);
                    if (isActive && latestDevice) {
                        setDeviceDetail(latestDevice);
                        setNewName(latestDevice.name);
                    }
                } catch (err) {
                    
                }
            };
            fetchRoom();
            return () => { isActive = false; };
        }, [device._id])
    );

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSavingName(true);
        try {
            const auth = await getAuth();
            const updated = await updateDevice(deviceDetail._id, { name: newName }, auth.token);
            setDeviceDetail(updated);
            setEditNameVisible(false);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể lưu tên thiết bị.\n' + err.message);
        } finally {
            setSavingName(false);
        }
    };

    const handleDeleteDevice = async () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thiết bị này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        const auth = await getAuth();
                        await deleteDevice(deviceDetail._id, auth.token);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Lỗi', 'Không thể xóa thiết bị.\n' + err.message);
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
                            <Text style={styles.value}>{deviceDetail.name}</Text>
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
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteDevice}>
                    <Text style={styles.deleteText}>Delete Device</Text>
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
