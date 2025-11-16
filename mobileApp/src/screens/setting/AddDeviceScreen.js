import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/AddDeviceScreenStyle';
import { createDevice } from '../../api/device';
import { getNodesByUser } from '../../api/node';
import { getAuth } from '../../storage/auth';



export default function AddDeviceScreen({ route, navigation }) {
    const { roomid, deviceType, homeid } = route.params || {};
    const [name, setName] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedPin, setSelectedPin] = useState('');
    const [nodes, setNodes] = useState([]);

    // Lấy danh sách pin từ node (giả sử node có thuộc tính pins)
    const pins = selectedNode?.pinsAvailable || [];

    // Kiểm tra loại thiết bị có cần chọn node, pin không
    const needNodePin = ['light', 'fan', 'sensor'].includes(deviceType?.value || deviceType);

    useEffect(() => {
        if (!needNodePin) return;
        (async () => {
            try {
                const auth = await getAuth();
                const nodeType = deviceType?.value || deviceType;
                const data = await getNodesByUser(auth.token, { type: nodeType, home: homeid });
                setNodes(data);
            } catch (err) {
                setNodes([]);
            } finally {
                setLoadingNodes(false);
            }
        })();
    }, [deviceType]);

    // Hàm lưu thiết bị
    const handleSave = async () => {
        try {
            const auth = await getAuth();
            const typeValue = deviceType?.value || deviceType;
            let payload = {
                name: name.trim(),
                type: typeValue,
                room: roomid,
            };
            if (typeValue !== 'door' && selectedNode) {
                payload.node = selectedNode._id;
            }
            if (typeValue !== 'door' && selectedPin) {
                payload.pin = selectedPin;
            }
            console.log('Creating device with payload:', payload);
            await createDevice(payload, auth.token);
            navigation.goBack();
        } catch (err) {
            alert('Lỗi khi lưu thiết bị: ' + (err?.message || err));
        }
    };

    useLayoutEffect(() => {
        let canSave = false;
        if ((deviceType?.value || deviceType) === 'door') {
            canSave = !!name.trim();
        } else {
            canSave = name.trim() && selectedNode && selectedPin;
        }
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBtn}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelText}>Hủy bỏ</Text>
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity
                    disabled={!canSave}
                    style={[styles.headerBtn, !canSave && styles.headerBtnDisabled]}
                    activeOpacity={0.7}
                    onPress={canSave ? handleSave : undefined}
                >
                    <Text style={[styles.saveText, !canSave && styles.saveDisabled]}>Lưu</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, name, selectedNode, selectedPin, deviceType]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                <View style={styles.card}>
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Tên thiết bị<Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập"
                                value={name}
                                onChangeText={setName}
                            />
                            {!!name && (
                                <TouchableOpacity style={styles.clearIcon} onPress={() => setName('')}>
                                    <Icon name="close-circle" size={22} color="#bbb" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Kiểu thiết bị (chỉ hiển thị, không cho chọn) */}
                <View style={styles.typeBox}>
                    <Text style={styles.typeLabel}>Kiểu thiết bị:</Text>
                    <Text style={styles.typeText}>
                        {deviceType?.label || deviceType}
                    </Text>
                </View>
                {needNodePin && (
                    <Text style={styles.sectionTitle}>Chọn node:</Text>
                )}
                {/* Chọn node nếu cần */}
                {needNodePin && (
                    <View style={styles.nodeBox}>
                        {nodes.map((node) => (
                            <TouchableOpacity
                                key={node._id}
                                style={styles.roomRow}
                                onPress={() => setSelectedNode(node)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.roomName}>{node.name || node._id}</Text>
                                {selectedNode?._id === node._id ? (
                                    <Icon name="checkmark-circle" size={28} color="#267AFF" />
                                ) : (
                                    <Icon name="ellipse-outline" size={28} color="#C7C7CC" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {needNodePin && selectedNode && (
                    <Text style={styles.sectionTitle}>Chọn pin:</Text>
                )}
                {/* Chọn pin nếu cần */}
                {needNodePin && selectedNode && (
                    <View style={styles.nodeBox}>
                        {pins.map((pin) => (
                            <TouchableOpacity
                                key={pin}
                                style={styles.roomRow}
                                onPress={() => setSelectedPin(pin)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.roomName}>{pin}</Text>
                                {selectedPin === pin ? (
                                    <Icon name="checkmark-circle" size={28} color="#267AFF" />
                                ) : (
                                    <Icon name="ellipse-outline" size={28} color="#C7C7CC" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
