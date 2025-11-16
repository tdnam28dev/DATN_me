import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/NodeSettingScreenStyle';
import { getAuth } from '../../storage/auth';
import { updateNode, deleteNode } from '../../api/node';


export default function NodeSettingScreen({ route, navigation }) {
    const { node, onNodeUpdated, onNodeDeleted } = route.params || {};
    const [nodeDetail, setNodeDetail] = useState(node);
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [newName, setNewName] = useState(node.name);
    const [savingName, setSavingName] = useState(false);
    const [configStep, setConfigStep] = useState(0); // 0: chưa cấu hình, 1: hướng dẫn, 2: nhập wifi
    const [wifiForm, setWifiForm] = useState({ ssid: '', password: '', email: '', userpass: '', nodeid: node._id });
    const [wifiLoading, setWifiLoading] = useState(false);

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSavingName(true);
        try {
            const auth = await getAuth();
            const updated = await updateNode(nodeDetail._id, { name: newName }, auth.token);
            setNodeDetail(updated);
            if (typeof onNodeUpdated === 'function') onNodeUpdated(updated);
            setEditNameVisible(false);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể cập nhật node.\n' + (err.message || ''));
        } finally {
            setSavingName(false);
        }
    };

    const handleDeleteNode = async () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa node này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        const auth = await getAuth();
                        await deleteNode(nodeDetail._id, auth.token);
                        if (typeof onNodeDeleted === 'function') onNodeDeleted(nodeDetail._id);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Lỗi', 'Không thể xóa node.\n' + (err.message || ''));
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
                        <Text style={styles.label}>Tên node</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{nodeDetail.name}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Trạng thái</Text>
                        <View style={styles.rowRight}>
                            <Icon
                                name="ellipse"
                                size={18}
                                color={nodeDetail.status ? '#43A047' : '#BDBDBD'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.value, { color: nodeDetail.status ? '#43A047' : '#BDBDBD', fontWeight: '500' }]}>
                                {nodeDetail.status ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.row} onPress={() => setConfigStep(1)}>
                        <Text style={styles.label}>Cấu hình</Text>
                        <View style={styles.rowRight}>
                            <Icon
                                name={nodeDetail.isConfig ? 'checkmark-circle' : 'close-circle'}
                                size={18}
                                color={nodeDetail.isConfig ? '#1976d2' : '#D32F2F'}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.value, { color: nodeDetail.isConfig ? '#1976d2' : '#D32F2F', fontWeight: '500' }]}>
                                {nodeDetail.isConfig ? 'Đã cấu hình' : 'Chưa cấu hình'}
                            </Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Loại node</Text>
                        <Text style={styles.value}>{nodeDetail.type}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>IP</Text>
                        <Text style={styles.value}>{nodeDetail.ip || 'Chưa kết nối'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>MAC</Text>
                        <Text style={styles.value}>{nodeDetail.mac || 'Chưa kết nối'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>ID</Text>
                        <Text style={styles.value}>{nodeDetail._id}</Text>
                    </View>
                </View>
                {/* Nút cấu hình node nếu chưa có IP hoặc chưa cấu hình */}
                {(!nodeDetail.ip || !nodeDetail.isConfig) && (
                    <TouchableOpacity style={styles.configBtn} onPress={() => setConfigStep(1)}>
                        <Text style={styles.configText}>Cấu hình Node</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteNode}>
                    <Text style={styles.deleteText}>Xóa Node</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* Popup sửa tên node */}
            <Modal
                visible={editNameVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setEditNameVisible(false)}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupTitle}>Tên node</Text>
                        <TextInput
                            style={styles.popupInput}
                            placeholder="Nhập tên node"
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
                                <Text style={[styles.popupBtnText, { color: '#1976d2', fontWeight: '500' }]}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Modal hướng dẫn và cấu hình node ESP */}
            <Modal visible={configStep > 0} animationType="fade" transparent onRequestClose={() => setConfigStep(0)}>
                <View style={styles.espModalContainer}>
                    <View style={styles.espModalBox}>
                        {configStep === 1 && (
                            <>
                                <Text style={styles.espModalTitle}>Hướng dẫn kết nối ESP</Text>
                                <Text style={{ marginBottom: 16, textAlign: 'center', color: '#222' }}>
                                    1. Vào phần cài đặt WiFi trên điện thoại và kết nối tới WiFi có tên <Text style={{ fontWeight: 'bold' }}>ESP-xxxx</Text> (mật khẩu: <Text style={{ fontWeight: 'bold' }}>12345678</Text>).
                                    {'\n'}2. Sau khi kết nối, quay lại ứng dụng để nhập thông tin WiFi cần cấu hình cho ESP.
                                </Text>
                                <TouchableOpacity style={styles.espModalBtn} onPress={async () => {
                                    const auth = await getAuth();
                                    setWifiForm(f => ({
                                        ...f,
                                        email: auth?.username || '',
                                        userpass: auth?.password || '',
                                        nodeid: nodeDetail?._id || ''
                                    }));
                                    setConfigStep(2);
                                }}>
                                    <Text style={styles.espModalBtnText}>Tôi đã kết nối WiFi ESP</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.espModalBtnCancel} onPress={() => setConfigStep(0)}>
                                    <Text style={styles.espModalBtnTextCancel}>Hủy</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {configStep === 2 && (
                            <>
                                <Text style={styles.espModalTitle}>Nhập thông tin WiFi cho ESP</Text>
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
                                    <TouchableOpacity style={styles.espPopupBtnCancel} onPress={() => { setConfigStep(0); setWifiForm({ ssid: '', password: '', email: '', userpass: '', nodeid: nodeDetail._id }); setWifiLoading(false); }}>
                                        <Text style={styles.espModalBtnTextCancel}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.espPopupBtn} onPress={async () => {
                                        setWifiLoading(true);
                                        try {
                                            const espIp = '192.168.4.1';
                                            const url = `http://${espIp}/setup?ssid=${encodeURIComponent(wifiForm.ssid)}&password=${encodeURIComponent(wifiForm.password)}&user=${encodeURIComponent(wifiForm.email)}&userpass=${encodeURIComponent(wifiForm.userpass)}&node=${encodeURIComponent(wifiForm.nodeid)}`;
                                            const res = await fetch(url);
                                            const text = await res.text();
                                            if (text === 'true') {
                                                Alert.alert('Thành công', 'Đã cấu hình ESP thành công!');
                                                setConfigStep(0);
                                                setWifiForm({ ssid: '', password: '', email: '', userpass: '', nodeid: nodeDetail._id });
                                                // Cập nhật trạng thái nodeDetail
                                                setNodeDetail(nd => ({ ...nd, isConfig: true, status: 'online', ip: espIp }));
                                                if (typeof onNodeUpdated === 'function') onNodeUpdated({ ...nodeDetail, isConfig: true, status: 'online', ip: espIp });
                                            } else {
                                                Alert.alert('Lỗi', 'Cấu hình ESP thất bại!');
                                            }
                                        } catch (e) {
                                            Alert.alert('Lỗi', 'Không gửi được thông tin tới ESP');
                                        }
                                        setWifiLoading(false);
                                    }} disabled={wifiLoading}>
                                        <Text style={styles.espModalBtnText}>{wifiLoading ? '...' : 'Cập nhật'}</Text>
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
