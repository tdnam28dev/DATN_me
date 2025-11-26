import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Pressable, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TabView } from 'react-native-tab-view';
import HomeTabNavigator from '../../navigation/HomeTabNavigator';
import styles from '../../styles/HomeScreenStyle';
import { getAuth } from '../../storage/auth';
import { getHomesByUser } from '../../api/home';
import { updateDevice } from '../../api/device';
import { Image } from 'react-native';
import io from 'socket.io-client';


const initialLayout = { width: Dimensions.get('window').width };

export default function HomeScreen({ navigation }) {
    const [homes, setHomes] = useState([]);
    const [selectedHome, setSelectedHome] = useState(null);
    const [routes, setRoutes] = useState([{ key: 'fav', title: 'Favorites' }]);
    const [index, setIndex] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showHomeModal, setShowHomeModal] = useState(false);
    const tabRefs = useRef([]);
    const scrollRef = useRef(null);
    const socketRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const menuAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            (async () => {
                setLoading(true);
                try {
                    const auth = await getAuth();
                    const res = await getHomesByUser(auth.token);
                    console.log('Fetched homes:', res);
                    if (res && Array.isArray(res)) {
                        setHomes(res);
                        if (res.length > 0) {
                            setSelectedHome(res[0]);
                            const roomTabs = (res[0].rooms || []).map((room) => ({
                                key: room._id,
                                title: room.name || 'Phòng',
                            }));
                            setRoutes([{ key: 'fav', title: 'Favorites' }, ...roomTabs]);
                        }
                    }
                } catch (e) {
                    setHomes([]);
                }
                setLoading(false);
            })();
            return () => { isActive = false; };
        }, [])
    );

    useEffect(() => {
        if (!socketRef.current && !loading) {
            socketRef.current = io("http://192.168.1.40:8080");
            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                if (selectedHome && Array.isArray(selectedHome.nodes)) {
                    selectedHome.nodes.forEach(node => {
                        if (node._id) {
                            socketRef.current.emit('joinRoom', node._id);
                        }
                    });
                }
            });
            socketRef.current.on('sendUpdateToApp', (device) => {
                console.log('Received serverMessage:', device);
                setHomes(prevHomes => {
                    const newHomes = prevHomes.map(home => {
                        if (!home.rooms) return home;
                        return {
                            ...home,
                            rooms: home.rooms.map(room => {
                                if (room._id !== device.room._id) return room;
                                return {
                                    ...room,
                                    devices: room.devices.map(d => d._id === device._id ? device : d)
                                };
                            })
                        };
                    });
                    if (selectedHome) {
                        const updatedHome = newHomes.find(h => h._id === selectedHome._id);
                        if (updatedHome) setSelectedHome(updatedHome);
                    }
                    return newHomes;
                });

            });
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [loading]);

    const DeviceTypes = [
        { value: 'light', icon: 'bulb-outline' },
        { value: 'door', icon: 'lock-closed-outline' },
        { value: 'fan', icon: 'aperture-outline' },
        { value: 'sensor', icon: 'analytics-outline' },
        { value: 'other', icon: 'ellipsis-horizontal-outline' },
    ];

    // Hàm lấy thông tin phòng đang mở tab
    const getCurrentRoomDetail = () => {
        const currentRoute = routes[index];
        if (!selectedHome || !currentRoute || currentRoute.key === 'fav') return null;
        return selectedHome.rooms?.find(r => r._id === currentRoute.key);
    };

    // Danh sách chức năng popup menu
    const menuItems = [
        {
            label: 'Add Device',
            icon: 'tv-outline',
            action: () => {
                const roomDetail = getCurrentRoomDetail();
                if (roomDetail) {
                    navigation.navigate('DeviceManager', {
                        devices: roomDetail.devices,
                        roomid: roomDetail._id,
                        homeid: selectedHome._id
                    });
                }
            }
        },
        { label: 'Create Scene', icon: 'checkbox-outline', action: () => navigation.navigate('CreateScene') },
        { label: 'Add Favorite Cards', icon: 'star-outline', action: () => navigation.navigate('AddFavoriteCards') },
        { label: 'Quét', icon: 'scan-outline', action: () => navigation.navigate('ScanDevice') },
    ];

    // Hiệu ứng mở/đóng popup menu
    const openMenu = () => {
        setMenuVisible(true);
        Animated.timing(menuAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
        }).start();
    };
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
                { scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                { translateX: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                { translateY: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
            ],
            opacity: menuAnim,
        },
    ];

    // Hàm lấy icon theo loại thiết bị
    const getDeviceIcon = (type) => {
        const found = DeviceTypes.find(dt => dt.value === type);
        return found ? found.icon : 'ellipsis-horizontal-outline';
    };

    // Hàm cập nhật trạng thái thiết bị
    const handleUpdateStatus = async (device, roomId) => {
        try {
            if (device.type === 'door' && device.status === true) return;
            const auth = await getAuth();
            const updated = await updateDevice(device._id, { status: !device.status }, auth.token);
            console.log('Updated device:', updated);
            setHomes(prevHomes => {
                const newHomes = prevHomes.map(home => {
                    if (!home.rooms) return home;
                    return {
                        ...home,
                        rooms: home.rooms.map(room => {
                            if (room._id !== roomId) return room;
                            return {
                                ...room,
                                devices: room.devices.map(d => d._id === device._id ? updated : d)
                            };
                        })
                    };
                });
                if (selectedHome) {
                    const updatedHome = newHomes.find(h => h._id === selectedHome._id);
                    if (updatedHome) setSelectedHome(updatedHome);
                }
                return newHomes;
            });
        } catch (err) {
            console.log('Lỗi cập nhật trạng thái thiết bị:', err.message);
        }
    };

    // Khi đổi nhà, cập nhật routes
    useEffect(() => {
        if (selectedHome) {
            const roomTabs = (selectedHome.rooms || []).map((room) => ({
                key: room._id,
                title: room.name || 'Phòng',
            }));
            setRoutes([{ key: 'fav', title: 'Favorites' }, ...roomTabs]);
            // Không reset tab về index 1, giữ nguyên tab hiện tại
        }
    }, [selectedHome]);

    const scrollToActiveTab = (activeIndex) => {
        if (activeIndex === 0) return;
        const tabIndex = activeIndex - 1;
        tabRefs.current[tabIndex]?.measureLayout(
            scrollRef.current,
            (x, y, width) => {
                const screenCenter = 115;
                const scrollToX = x - screenCenter + width / 2;
                scrollRef.current.scrollTo({
                    x: Math.max(scrollToX, 0),
                    animated: true,
                });
            }
        );
    };

    // Hiển thị lưới thiết bị cho từng phòng
    const renderDevicesGrid = (room, homeid) => {
        if (!room || !room.devices || room.devices.length === 0) {
            return (
                <View style={styles.emptyBox}>
                    <Image source={require('../../assets/img/emptybox.png')} style={styles.emptyImage} resizeMode="contain" />
                    <Text style={styles.emptyText}>Không có thiết bị</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation && navigation.navigate && navigation.navigate('RoomSetting', { room, homeid })}>
                        <Text style={styles.emptyBtnText}>{room?.name || 'Phòng'} – Settings</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        // Hiển thị dạng lưới 2 cột
        return (
            <ScrollView style={styles.section} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                <View style={styles.deviceGrid}>
                    {room.devices.map((device, idx) => {
                        const iconName = getDeviceIcon(device.type);
                        const isOn = device.status;
                        return (
                            <View key={device._id || idx} style={styles.deviceCard}>
                                {/* Icon thiết bị, đổi màu nền và icon theo trạng thái */}
                                {device.type !== 'door' && (
                                    <View style={[styles.deviceIconBox, isOn ? { backgroundColor: '#fffbe6' } : { backgroundColor: '#f3f7fa' }]}>
                                        <Ionicons name={iconName} size={32} color={isOn ? '#FFD600' : '#222'} />
                                    </View>)}
                                {device.type === 'door' && (
                                    <View style={[styles.deviceIconBox, isOn ? { backgroundColor: '#fffbe6' } : { backgroundColor: '#f3f7fa' }]}>
                                        <Ionicons name={device.status ? 'lock-open' : iconName} size={32} color={isOn ? '#FFD600' : '#222'} />
                                    </View>)}
                                <Text style={styles.deviceName}>{device.name || 'Device'}</Text>
                                {device.type !== 'door' && (
                                    <Text style={[styles.deviceRoom, { color: device.status ? '#00d084' : '#727272', fontWeight: '500' }]}>
                                        {device.status ? 'On' : 'Off'}
                                    </Text>)}
                                {device.type === 'door' && (
                                    <Text style={[styles.deviceRoom, { color: !device.status ? '#00d084' : '#bb1a1aff', fontWeight: '500' }]}>
                                        {device.status ? 'Mở' : 'Đóng'}
                                    </Text>)}
                                <TouchableOpacity
                                    style={[styles.devicePowerBtn, isOn ? { backgroundColor: '#00d08422' } : { backgroundColor: '#e4e4e4ff' }]}
                                    onPress={() => handleUpdateStatus(device, room._id)}>
                                    <Ionicons name="power" size={24} color={isOn ? '#00d084' : '#929292'} />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        );
    };

    // Nội dung từng tab
    const renderScene = ({ route }) => {
        if (route.key === 'fav') {
            // Giao diện giống ảnh Favorites
            return (
                <ScrollView style={styles.section} contentContainerStyle={styles.sectionContent} showsVerticalScrollIndicator={false}>
                    {/* ...giữ nguyên phần Favorites... */}
                    <View style={styles.cardRow}>
                        <View style={styles.weatherCard}>
                            <Text style={styles.weatherTemp}>21<Text style={{ fontSize: 18 }}>°C</Text></Text>
                            <Text style={styles.weatherDesc}>PM2.5 ngoài trời: Tệ{"\n"}Chất lượng không khí... Tệ</Text>
                        </View>
                        <View style={[styles.card, styles.cardLast]}>
                            <Text style={styles.cardTitle}>Do-Not-Disturb (DND)</Text>
                            <Text style={styles.cardValue}>Tắt</Text>
                        </View>
                    </View>

                </ScrollView>
            );
        }
        // Tab phòng: hiển thị thiết bị
        const room = selectedHome?.rooms?.find(r => r._id === route.key);
        if (room) {
            return renderDevicesGrid(room, selectedHome._id);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.homeRow} onPress={() => setShowHomeModal(true)}>
                    <Ionicons name="home" size={22} style={styles.homeIcon} color="#222" />
                    <Text style={styles.homeName}>{selectedHome ? selectedHome.name : '...'}</Text>
                </Pressable>
                <View style={styles.headerRightRow}>
                    <TouchableOpacity style={styles.headerRightBtn}>
                        <Ionicons name="color-palette" size={28} color="#5ad6ff" style={{}} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerRightBtn} onPress={openMenu}>
                        <Ionicons name="add" size={28} color="#222" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* TabView */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={(i) => {
                    setIndex(i);
                    scrollToActiveTab(i);
                }}
                renderTabBar={() => (
                    <HomeTabNavigator
                        index={index}
                        setIndex={(i) => {
                            setIndex(i);
                            scrollToActiveTab(i);
                        }}
                        routes={routes}
                        scrollRef={scrollRef}
                        tabRefs={tabRefs}
                    />
                )}
                swipeEnabled
                initialLayout={initialLayout}
            />
            {/* Popup chọn nhà */}
            <Modal
                visible={showHomeModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowHomeModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowHomeModal(false)}>
                    <View style={styles.popupOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.popupContainer}>
                                {homes.map((home, idx) => (
                                    <TouchableOpacity
                                        key={home._id || idx}
                                        style={styles.popupHomeRow}
                                        onPress={() => {
                                            setSelectedHome(home);
                                            setShowHomeModal(false);
                                        }}
                                    >
                                        {selectedHome && selectedHome._id === home._id ? (
                                            <Ionicons name="checkmark" size={22} color="#2196f3" style={styles.popupCheckIcon} />
                                        ) : (
                                            <View style={styles.popupCheckIconEmpty} />
                                        )}
                                        <Text style={styles.popupHomeName}>{home.name}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.popupManageBtn}
                                    onPress={() => {
                                        setShowHomeModal(false);
                                        navigation && navigation.navigate && navigation.navigate('HomeManager')
                                    }}
                                >
                                    <Ionicons name="home" size={20} color="#000000" style={styles.popupManageIcon} />
                                    <Text style={styles.popupManageText}>Quản lý Nhà</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
                        {menuItems.map((item, idx) => (
                            <TouchableOpacity
                                key={item.label}
                                style={[styles.menuItem, idx !== menuItems.length - 1 && styles.menuItemBorder]}
                                activeOpacity={0.7}
                                onPress={() => { closeMenu(); item.action(); }}
                            >
                                <Ionicons name={item.icon} size={22} color="#222" style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}
