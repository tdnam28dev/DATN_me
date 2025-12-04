import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Pressable } from 'react-native';
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
    const [statusPopupVisible, setStatusPopupVisible] = useState(false);
    // Thêm state cho modal cấu hình thiết bị (dành cho thiết bị cửa)
    const [configStep, setConfigStep] = useState(0); // 0: chưa cấu hình, 1: hướng dẫn, 2: nhập wifi
    const [wifiForm, setWifiForm] = useState({ ssid: '', password: '', email: '', userpass: '', deviceid: device._id });
    const [wifiLoading, setWifiLoading] = useState(false);

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

    const handleUpdateStatus = async () => {
        try {
            const auth = await getAuth();
            const updated = await updateDevice(deviceDetail._id, { status: !deviceDetail.status }, auth.token);
            console.log('Updated device status:', updated);
            setDeviceDetail(updated);
            setStatusPopupVisible(false);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể đổi trạng thái thiết bị.\n' + err.message);
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

    const sendConfigToDevice = async () => {
        setWifiLoading(true);
        try {
            const espIp = '192.168.4.1';
            const url = `http://${espIp}/setup?ssid=${encodeURIComponent(wifiForm.ssid)}&password=${encodeURIComponent(wifiForm.password)}&user=${encodeURIComponent(wifiForm.email)}&userpass=${encodeURIComponent(wifiForm.userpass)}&device=${encodeURIComponent(wifiForm.deviceid)}`;
            const res = await fetch(url);
            const text = await res.text();
            if (text === 'true') {
                Alert.alert('Thành công', 'Đã cấu hình thiết bị thành công!');
                setConfigStep(0);
                setWifiForm({ ssid: '', password: '', email: '', userpass: '', deviceid: deviceDetail._id });
                setDeviceDetail(d => ({ ...d, isConfig: true, status: 'online', ip: espIp }));
            } else {
                Alert.alert('Lỗi', 'Cấu hình thiết bị thất bại!');
            }
        } catch (e) {
            Alert.alert('Lỗi', 'Không gửi được thông tin tới thiết bị');
        }
        setWifiLoading(false);
    }

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
                    <TouchableOpacity style={styles.row} onPress={() => setStatusPopupVisible(true)}>
                        <Text style={styles.label}>Trạng thái</Text>
                        <View style={styles.rowRight}>
                            {deviceDetail.type !== 'door' && (
                                <Icon
                                    name="ellipse"
                                    size={18}
                                    color={deviceDetail.status ? '#43A047' : '#D32F2F'}
                                    style={{ marginRight: 6 }}
                                />)}
                            {deviceDetail.type === 'door' && (
                                <Icon
                                    name="ellipse"
                                    size={18}
                                    color={!deviceDetail.status ? '#43A047' : '#D32F2F'}
                                    style={{ marginRight: 6 }}
                                />)}
                            {deviceDetail.type !== 'door' && (
                                <Text style={[styles.value, { color: deviceDetail.status ? '#43A047' : '#D32F2F', fontWeight: '500' }]}>
                                    {deviceDetail.status ? 'On' : 'Off'}
                                </Text>)}
                            {deviceDetail.type === 'door' && (
                                <Text style={[styles.value, { color: !deviceDetail.status ? '#43A047' : '#D32F2F', fontWeight: '500' }]}>
                                    {deviceDetail.status ? 'Mở' : 'Đóng'}
                                </Text>)}
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                    {deviceDetail.type !== 'door' && (
                        <TouchableOpacity style={styles.row}>
                            <Text style={styles.label}>Node</Text>
                            <View style={styles.rowRight}>
                                <Icon
                                    name="ellipse"
                                    size={18}
                                    color={deviceDetail.node.status ? '#43A047' : '#BDBDBD'}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.value, { color: deviceDetail.node.status ? '#43A047' : '#BDBDBD', fontWeight: '500' }]}>
                                    {deviceDetail.node.status ? 'Online' : 'Offline'}
                                </Text>
                                <Icon name="chevron-forward" size={18} color="#bbb" />
                            </View>
                        </TouchableOpacity>)}
                    {deviceDetail.type !== 'door' && (
                        <TouchableOpacity style={styles.row} onPress={() => navigation && navigation.navigate && navigation.navigate('ScheduleDevice', { deviceid: deviceDetail._id, roomid: deviceDetail.room._id, ownerid: deviceDetail.owner._id, nodeid: deviceDetail.node._id})}>
                            <Text style={styles.label}>Lịch trình</Text>
                            <View style={styles.rowRight}>
                                
                                <Icon name="chevron-forward" size={18} color="#bbb" />
                            </View>
                        </TouchableOpacity>)}
                    {deviceDetail.type === 'door' && (
                        <TouchableOpacity style={styles.row} onPress={() => setConfigStep(1)}>
                            <Text style={styles.label}>Cấu hình</Text>
                            <View style={styles.rowRight}>
                                <Icon
                                    name={deviceDetail.isConfig ? 'checkmark-circle' : 'close-circle'}
                                    size={18}
                                    color={deviceDetail.isConfig ? '#1976d2' : '#D32F2F'}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.value, { color: deviceDetail.isConfig ? '#1976d2' : '#D32F2F', fontWeight: '500' }]}>
                                    {deviceDetail.isConfig ? 'Đã cấu hình' : 'Chưa cấu hình'}
                                </Text>
                                <Icon name="chevron-forward" size={18} color="#bbb" />
                            </View>
                        </TouchableOpacity>
                    )}

                </View>
                <View style={styles.card}>
                    {deviceDetail.type !== 'door' && (
                        <TouchableOpacity style={styles.row}>
                            <Text style={styles.label}>Chân kết nối</Text>
                            <View style={styles.rowRight}>
                                <Text style={[styles.value]}>
                                    {'Pin ' + deviceDetail.pin}
                                </Text>
                                <Icon name="chevron-forward" size={18} color="#bbb" />
                            </View>
                        </TouchableOpacity>)}

                    {deviceDetail.type === 'door' && (
                        <TouchableOpacity style={styles.row}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.rowRight}>
                                <Text style={[styles.value]}>
                                    {deviceDetail.doorPassword !== undefined && deviceDetail.doorPassword !== null ? deviceDetail.doorPassword : 'Đặt mật khẩu'}
                                </Text>
                                <Icon name="chevron-forward" size={18} color="#bbb" />
                            </View>
                        </TouchableOpacity>)}
                    <TouchableOpacity style={styles.row}>
                        <View>
                            <Text style={styles.label}>Loại thiết bị</Text>
                            {/* <Text style={styles.subLabel}>Applies to all rooms</Text> */}
                        </View>
                        <View style={styles.rowRight}>
                            <Text style={[styles.value, { marginRight: 6 }]}>{deviceDetail.type}</Text>
                            {/* <Icon name="chevron-forward" size={18} color="#bbb" /> */}
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteDevice}>
                    <Text style={styles.deleteText}>Delete Device</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* Popup sửa tên */}
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
                            placeholder="Nhập"
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

            {/* Popup đổi trạng thái thiết bị */}
            <Modal
                visible={statusPopupVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setStatusPopupVisible(false)}
            >
                <Pressable style={styles.statusPopupOverlay} onPress={() => setStatusPopupVisible(false)}>
                    <Pressable style={styles.statusPopupBox} onPress={(e) => e.stopPropagation()}>
                        <TouchableOpacity style={styles.statusPopupCloseBtn} onPress={() => setStatusPopupVisible(false)}>
                            <Icon name="close" size={22} color="#888" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statusPopupBtn} onPress={handleUpdateStatus}>
                            {deviceDetail.type !== 'door' && (
                                <Icon
                                    name={'power'}
                                    size={60}
                                    color={!deviceDetail.status ? '#43A047' : '#D32F2F'}
                                />
                            )}
                            {deviceDetail.type === 'door' && (
                                <Icon
                                    name={!deviceDetail.status ? 'lock-open' : 'lock-closed'}
                                    size={60}
                                    color={!deviceDetail.status ? '#43A047' : '#D32F2F'}
                                />
                            )}
                            <Text style={styles.statusPopupBtnText}>{deviceDetail.type === 'door' ? (!deviceDetail.status ? 'Mở khóa' : 'Khóa lại') : (deviceDetail.status ? 'Tắt' : 'Bật')}</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
            {/* Modal hướng dẫn và cấu hình thiết bị cửa (door) */}
            <Modal visible={configStep > 0} animationType="fade" transparent onRequestClose={() => setConfigStep(0)}>
                <View style={styles.configPopupContainer}>
                    <View style={styles.configPopupBox}>
                        {configStep === 1 && (
                            <>
                                <Text style={styles.configPopupTitle}>Hướng dẫn kết nối thiết bị cửa</Text>
                                <Text style={{ marginBottom: 16, textAlign: 'center', color: '#222' }}>
                                    1. Vào phần cài đặt WiFi trên điện thoại và kết nối tới WiFi có tên <Text style={{ fontWeight: 'bold' }}>ESP-xxxx</Text> (mật khẩu: <Text style={{ fontWeight: 'bold' }}>12345678</Text>).
                                    {'\n'}2. Sau khi kết nối, quay lại ứng dụng để nhập thông tin WiFi cần cấu hình cho thiết bị.
                                </Text>
                                <TouchableOpacity style={styles.configPopupBtn} onPress={async () => {
                                    const auth = await getAuth();
                                    setWifiForm(f => ({
                                        ...f,
                                        email: auth?.username || '',
                                        userpass: auth?.password || '',
                                        deviceid: deviceDetail?._id || ''
                                    }));
                                    setConfigStep(2);
                                }}>
                                    <Text style={styles.configPopupBtnText}>Tôi đã kết nối WiFi ESP</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.configPopupBtnCancel} onPress={() => setConfigStep(0)}>
                                    <Text style={styles.configPopupBtnTextCancel}>Hủy</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {configStep === 2 && (
                            <>
                                <Text style={styles.configPopupTitle}>Nhập thông tin WiFi cho thiết bị</Text>
                                <TextInput
                                    style={styles.popupInput}
                                    placeholder="WiFi SSID"
                                    value={wifiForm.ssid}
                                    onChangeText={text => setWifiForm(f => ({ ...f, ssid: text }))}
                                />
                                <TextInput
                                    style={styles.popupInput}
                                    placeholder="WiFi Password"
                                    value={wifiForm.password}
                                    onChangeText={text => setWifiForm(f => ({ ...f, password: text }))}
                                    secureTextEntry
                                />
                                <TextInput
                                    style={styles.popupInput}
                                    placeholder="Email đăng nhập"
                                    value={wifiForm.email}
                                    onChangeText={text => setWifiForm(f => ({ ...f, email: text }))}
                                    autoCapitalize="none"
                                />
                                <TextInput
                                    style={styles.popupInput}
                                    placeholder="Mật khẩu đăng nhập"
                                    value={wifiForm.userpass}
                                    onChangeText={text => setWifiForm(f => ({ ...f, userpass: text }))}
                                    secureTextEntry
                                />
                                <View style={styles.popupBtnRow}>
                                    <TouchableOpacity style={styles.configPopupBtnCancel} onPress={() => { setConfigStep(0); setWifiForm({ ssid: '', password: '', email: '', userpass: '', deviceid: deviceDetail._id }); setWifiLoading(false); }}>
                                        <Text style={styles.configPopupBtnTextCancel}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.configPopupBtn} onPress={sendConfigToDevice} disabled={wifiLoading}>
                                        <Text style={styles.configPopupBtnText}>{wifiLoading ? '...' : 'Cập nhật'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
