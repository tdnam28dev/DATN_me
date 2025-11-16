
import React, { useState, useLayoutEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/DeviceManagerScreenStyle';
import { getAuth } from '../../storage/auth';
import { getDevicesByUser } from '../../api/device';

export default function DeviceManagerScreen({ route, navigation }) {
    const { devices: initDevices = [], roomid, homeid } = route.params || {};
    const [devices, setDevices] = useState(initDevices);
    // Lấy danh sách thiết bị theo room mỗi khi focus
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            (async () => {
                try {
                    const auth = await getAuth();
                    const data = await getDevicesByUser(auth.token, { room: roomid });
                    console.log('Fetched devices for room', roomid, data);
                    if (isActive) setDevices(data);
                } catch (err) {
                    if (isActive) setDevices([]);
                }
            })();
            return () => { isActive = false; };
        }, [roomid])
    );
    const [menuVisible, setMenuVisible] = useState(false);
    const menuAnim = useRef(new Animated.Value(0)).current;

    const defaultDeviceTypes = [
        { label: 'Ánh sáng', value: 'light', icon: 'bulb-outline' },
        { label: 'Cửa', value: 'door', icon: 'lock-closed-outline' },
        { label: 'Quạt', value: 'fan', icon: 'aperture-outline' },
        { label: 'Cảm biến', value: 'sensor', icon: 'analytics-outline' },
        { label: 'Khác', value: 'other', icon: 'ellipsis-horizontal-outline' },
    ];



    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        setMenuVisible(true);
                        Animated.timing(menuAnim, {
                            toValue: 1,
                            duration: 180,
                            useNativeDriver: true,
                        }).start();
                    }}
                    style={styles.addBtn}
                    activeOpacity={0.7}
                >
                    <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

    const menuStyle = [
        styles.menuPopup,
        {
            transform: [
                {
                    scale: menuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.85, 1],
                    }),
                },
                {
                    translateX: menuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                    }),
                },
                {
                    translateY: menuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                    }),
                },
            ],
            opacity: menuAnim,
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {defaultDeviceTypes.map(typeInfo => {
                    const filtered = devices.filter(d => (d.type || 'other') === typeInfo.value);
                    if (filtered.length === 0) return null;
                    return (
                        <View key={typeInfo.value}>
                            <View style={styles.sectionDivider} >
                                <Icon name={typeInfo.icon} size={15} color="#00b7ff" />
                                <Text style={styles.sectionTitle}>{typeInfo.label}</Text>
                            </View>
                            <View style={styles.listContainer}>
                                {filtered.map((device, idx) => {
                                    // Trạng thái hoạt động
                                    let statusText = '';
                                    let statusColor = '#888';
                                    if (device.status) {
                                        statusText = 'Hoạt động';
                                        statusColor = '#34C759';
                                    } else {
                                        statusText = 'Tắt';
                                        statusColor = '#FF3B30';
                                    }
                                    return (
                                        <TouchableOpacity
                                            key={device._id || idx}
                                            style={styles.deviceItem}
                                            onPress={() => navigation && navigation.navigate && navigation.navigate('DeviceSetting', {device, roomid, homeid})}
                                        >
                                            {/* <Icon name={typeInfo.icon} size={28} color="#007AFF" style={styles.menuItemIcon} /> */}
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.deviceName}>{device.name || 'Thiết bị không tên'}</Text>
                                                <Text style={{ fontSize: 13, color: statusColor, marginTop: 2 }}>{statusText}</Text>
                                            </View>
                                            <Icon name="chevron-forward" size={18} color="#bbb" />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Popup menu thêm thiết bị */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="none"
                onRequestClose={closeMenu}
            >
                <Pressable style={{ flex: 1 }} onPress={closeMenu}>
                    <Animated.View style={menuStyle}>
                        {/* Mũi tên tam giác trên popup */}
                        <View style={styles.arrowContainer}>
                            <View style={styles.arrowShadow} />
                        </View>
                        {defaultDeviceTypes.map((item, idx) => (
                            <TouchableOpacity
                                key={item.value}
                                style={[styles.menuItem, idx !== defaultDeviceTypes.length - 1 && styles.menuItemBorder]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate('AddDevice', { deviceType: item.value, roomid: roomid, homeid: homeid });
                                }}
                            >
                                <Icon name={item.icon} size={22} color="#222" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}