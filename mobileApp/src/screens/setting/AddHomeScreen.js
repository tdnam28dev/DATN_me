import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/AddHomeScreenStyle';
import {createHome} from '../../api/home';
import { createRoom } from '../../api/room';
import { getAuth } from '../../storage/auth';

const defaultRooms = [
    'Phòng khách',
    'Phòng ngủ chính',
    'Phòng ngủ thứ hai',
    'Phòng ăn',
    'Nhà bếp',
];

export default function AddHomeScreen({ navigation }) {
    const [homeName, setHomeName] = useState('');
    const [location, setLocation] = useState(null);
    const [rooms, setRooms] = useState(defaultRooms);
    const [selectedRooms, setSelectedRooms] = useState([...defaultRooms]);
    const [address, setAddress] = useState('');
    const handleRoomToggle = (room) => {
        setSelectedRooms((prev) =>
            prev.includes(room)
                ? prev.filter((r) => r !== room)
                : [...prev, room]
        );
    };

    const handleAddRoom = () => {
        navigation.navigate('AddRoom', {
            onAddRoom: (newRoom) => {
                if (newRoom && !rooms.includes(newRoom)) {
                    setRooms((prev) => [...prev, newRoom]);
                    setSelectedRooms((prev) => [...prev, newRoom]);
                }
            },
        });
    };

    const handleLocationSelect = () => {
        navigation.navigate('SelectLocation', {
            onSelectLocation: ({ location: loc, address: addr }) => {
                setLocation(loc);
                setAddress(addr);
            },
        });
    };

    const handleSave = async () => {
        try {
            const auth = await getAuth();
            // Tạo home
            const homeData = {
                name: homeName,
                address: address,
                owner: auth.userid
            };
            const newHome = await createHome(homeData, auth.token);
            // Tạo các phòng đã chọn
            for (const roomName of selectedRooms) {
                await createRoom({ name: roomName, home: newHome._id, owner: auth.userid }, auth.token);
            }
            // Quay về màn hình trước hoặc hiển thị thông báo thành công
            navigation.goBack();
        } catch (err) {
            // Xử lý lỗi, có thể hiển thị thông báo
            console.error('Lỗi khi tạo nhà/phòng:', err);
        }
    };

    useLayoutEffect(() => {
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
                    onPress={handleSave}
                    disabled={!homeName.trim()}
                    style={[styles.headerBtn, !homeName.trim() && styles.headerBtnDisabled]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.saveText, !homeName.trim() && styles.saveDisabled]}>
                        Lưu
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, homeName]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.inputCard}>
                    <View style={[styles.inputRow, styles.inputRow1]}>
                        <Text style={styles.label}>Tên Nhà<Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập"
                                value={homeName}
                                onChangeText={setHomeName}
                            />
                            {homeName.length > 0 && (
                                <TouchableOpacity onPress={() => setHomeName('')} style={styles.clearInputBtn} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                    <Icon name="close-circle" size={20} color="#C7C7CC" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.inputRow, styles.inputRow2]}
                        onPress={handleLocationSelect}
                    >
                        <Text style={styles.label}>Vị trí</Text>
                        <View style={styles.locationRow}>
                            <Text style={styles.locationText}>{address ? address : 'Cài đặt'}</Text>
                            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                </View>
                <Text style={styles.sectionTitle}>Phòng:</Text>
                <View style={styles.roomCard}>
                    {rooms.map((room, idx) => (
                        <TouchableOpacity
                            key={room}
                            style={styles.roomRow}
                            onPress={() => handleRoomToggle(room)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.roomName}>{room}</Text>
                            {selectedRooms.includes(room) ? (
                                <Icon name="checkmark-circle" size={28} color="#267AFF" />
                            ) : (
                                <Icon name="ellipse-outline" size={28} color="#C7C7CC" />
                            )}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.addRoomBtn} onPress={handleAddRoom}>
                        <Text style={styles.addRoomText}>Thêm phòng</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}


