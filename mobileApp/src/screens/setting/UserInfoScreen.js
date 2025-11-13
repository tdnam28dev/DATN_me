

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/UserInfoScreenStyle';
import { updateUser } from '../../api/user';
import { getUser } from '../../storage/user';
import { getAuth } from '../../storage/auth';


export default function UserInfoScreen() {
    const [user, setUser] = useState(null);
    const [auth, setAuth] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [tempNickname, setTempNickname] = useState('');
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const authData = await getAuth();
            setAuth(authData);
            const userData = await getUser();
            setUser(userData);
        };
        fetchData();
    }, []);

    const openEditModal = () => {
        if (user && user.name) setTempNickname(user.name);
        else setTempNickname('');
        setModalVisible(true);
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 200);
    };

    const closeModal = () => {
        setModalVisible(false);
        Keyboard.dismiss();
    };

    const confirmEdit = async () => {
        if (!user || !auth) return;
        const newName = tempNickname.trim() ? tempNickname : (user.name || '');
        if (newName === user.name) {
            setModalVisible(false);
            Keyboard.dismiss();
            return;
        }
        setLoading(true);
        try {
            const updated = await updateUser({ ...user, name: newName }, auth.token);
            setUser({ ...user, name: newName });
        } catch (e) {
            // Có thể thêm thông báo lỗi ở đây
        }
        setLoading(false);
        setModalVisible(false);
        Keyboard.dismiss();
    };

    return (
        <View style={styles.screen}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                bounces={true}
                alwaysBounceVertical={true}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
            >
                {/* Box 1: Ảnh hồ sơ & Biệt danh */}
                <View style={styles.box}>
                    {/* Ảnh hồ sơ */}
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Ảnh hồ sơ</Text>
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>N</Text>
                            </View>
                            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.chevronIcon} />
                        </View>
                    </TouchableOpacity>
                    {/* Biệt danh */}
                    <TouchableOpacity style={styles.row} onPress={openEditModal}>
                        <Text style={styles.label}>Biệt danh</Text>
                        <View style={styles.valueWrap}>
                            <Text style={styles.valueText}>{user && user.name ? user.name : ''}</Text>
                            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.chevronIcon} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Box 2: Múi giờ */}
                <View style={styles.box}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Múi giờ</Text>
                        <View style={styles.valueWrap}>
                            <Text style={styles.valueText}>Ho Chi Minh</Text>
                            <Icon name="chevron-forward" size={20} color="#bbb" style={styles.chevronIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Popup chỉnh sửa biệt danh */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Chỉnh sửa Biệt Danh</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            ref={inputRef}
                            style={styles.modalInput}
                            value={tempNickname}
                            onChangeText={setTempNickname}
                            placeholder="Nhập biệt danh"
                            placeholderTextColor="#bbb"
                            autoFocus={true}
                            returnKeyType="done"
                            onSubmitEditing={confirmEdit}
                            editable={!loading}
                        />
                        {tempNickname.length > 0 && (
                            <TouchableOpacity style={styles.inputClear} onPress={() => setTempNickname("")}>
                                <Icon name="close-circle" size={18} color="#bbb" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={closeModal}>
                            <Text style={styles.modalCancel}>Huỷ bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={confirmEdit} disabled={loading}>
                            <Text style={styles.modalConfirm}>{loading ? 'Đang lưu...' : 'Confirm'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}