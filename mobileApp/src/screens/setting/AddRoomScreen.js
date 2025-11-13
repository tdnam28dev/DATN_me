import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/AddRoomScreenStyle';

const suggestedRooms = [
    'Phòng khách', 'Phòng ngủ chính', 'Phòng ngủ thứ hai', 'Phòng ăn', 'Nhà bếp',
    'Phòng học', 'Lối vào', 'Ban công', 'Phòng trẻ em', 'Phòng thay đồ'
];

export default function AddRoomScreen({ navigation, route }) {
    const [roomName, setRoomName] = useState('');
    const { onAddRoom } = route.params || {};

    const handleSelectSuggested = (name) => {
        setRoomName(name);
    };

    const handleClearInput = () => {
        setRoomName('');
    };

    const handleOk = () => {
        if (roomName.trim()) {
            if (onAddRoom) onAddRoom(roomName.trim());
            navigation.goBack();
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color="#525252" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleOk}
                    disabled={!roomName.trim()}
                    style={[styles.okBtn, !roomName.trim() && styles.okBtnDisabled]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.okText, !roomName.trim() && styles.okTextDisabled]}>
                        OK
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, roomName]);

    return (
        <View style={styles.container}>
            <View style={styles.inputCard}>
                <View style={styles.inputRow}>
                    <Text style={styles.label}>Tên phòng</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên phòng"
                            value={roomName}
                            onChangeText={setRoomName}
                        />
                        {roomName.length > 0 && (
                            <TouchableOpacity onPress={handleClearInput} style={styles.clearInputBtn}>
                                <Icon name="close-circle" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <Text style={styles.suggestTitle}>Đề xuất</Text>
            <View style={styles.suggestList}>
                {suggestedRooms.map((name) => (
                    <TouchableOpacity
                        key={name}
                        style={[styles.suggestItem, roomName === name && styles.suggestItemActive]}
                        onPress={() => handleSelectSuggested(name)}
                    >
                        <Text style={[styles.suggestText, roomName === name && styles.suggestTextActive]}>{name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
