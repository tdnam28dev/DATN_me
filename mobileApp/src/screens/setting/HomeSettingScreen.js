import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, TextInput } from 'react-native';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/HomeSettingScreenStyle';
import { getAuth } from '../../storage/auth';
import { getHomeById, updateHome, deleteHome } from '../../api/home';

export default function HomeSettingScreen({ route, navigation }) {
    const { home } = route.params;
    const [homeDetail, setHomeDetail] = useState(home);
    const [loading, setLoading] = useState(true);
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [savingName, setSavingName] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchDetail = async () => {
            try {
                const auth = await getAuth();
                const data = await getHomeById(home._id, auth.token);
                setHomeDetail(data);
                console.log('Home detail:', data);
            } catch (err) {
                setHomeDetail(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        }, [])
    );

    const handleDelete = async () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa nhà này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        const auth = await getAuth();
                        await deleteHome(home._id, auth.token);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Lỗi', 'Không thể xóa nhà.');
                    }
                }
            }
        ]);
    };

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSavingName(true);
        try {
            const auth = await getAuth();
            await updateHome(homeDetail._id, { name: newName }, auth.token);
            setHomeDetail({ ...homeDetail, name: newName });
            setEditNameVisible(false);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể cập nhật tên nhà');
        } finally {
            setSavingName(false);
        }
    };

    if (!homeDetail) {
        return (
            <View style={styles.container}><Text>Không tìm thấy thông tin nhà.</Text></View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} onPress={() => {
                        setNewName(homeDetail.name);
                        setEditNameVisible(true);
                    }}>
                        <Text style={styles.label}>Tên Nhà</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{loading ? '_' : (homeDetail.name || '_')}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} onPress={() => navigation && navigation.navigate && navigation.navigate('RoomManager', { rooms: homeDetail.rooms, homeid: homeDetail._id })}>
                        <Text style={styles.label}>Quản lý phòng</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{loading ? '_' : (homeDetail.rooms ? homeDetail.rooms.length + ' Phòng' : '0 Phòng')}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} onPress={() => navigation && navigation.navigate && navigation.navigate('NodeManager', { nodes: homeDetail.nodes, homeid: homeDetail._id })}>
                        <Text style={styles.label}>Quản lý node</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{loading ? '_' : (homeDetail.nodes ? homeDetail.nodes.length + ' Node' : '0 Node')}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SelectLocation', { homeId: homeDetail._id })}>
                        <Text style={styles.label}>Vị trí</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{loading ? '_' : (homeDetail.address || 'Chưa đặt')}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Manage Permissions</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.sectionTitle}>Thành viên trong nhà</Text>
                <View style={styles.memberCard}>
                    <TouchableOpacity style={styles.memberRow} onPress={() => navigation.navigate('MemberDetail', { member: homeDetail.owner })}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>
                            {homeDetail.owner.name ? homeDetail.owner.name.charAt(0).toUpperCase() : '?'}
                        </Text></View>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{loading ? '_' : (homeDetail.owner.name || '_')}</Text>
                            <Text style={styles.memberEmail}>{loading ? '_' : (homeDetail.owner.email || '_')}</Text>
                        </View>
                        <Text style={styles.role}>Chủ Nhà</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    {!loading && homeDetail.members && homeDetail.members.length > 0 && (
                        homeDetail.members.map((member, idx) => (
                            <TouchableOpacity
                                key={member._id || idx}
                                style={styles.memberRow}
                                onPress={() => navigation.navigate('MemberDetail', { member })}
                            >
                                <View style={styles.avatar}><Text style={styles.avatarText}>{member.name ? member.name[0].toUpperCase() : '?'}</Text></View>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.name || 'Chưa đặt tên'}</Text>
                                    <Text style={styles.memberEmail}>{member.email || ''}</Text>
                                </View>
                                <Text style={styles.role}>{member.role === 'owner' ? 'Chủ Nhà' : 'Thành viên'}</Text>
                                <Icon name="chevron-forward" size={18} color="#bbb" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        ))
                    )}
                    <TouchableOpacity style={styles.addMemberBtn}>
                        <Text style={styles.addMemberText}>Thêm thành viên</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Xóa Nhà</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* Popup sửa tên nhà */}
            <Modal
                visible={editNameVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setEditNameVisible(false)}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popupBox}>
                        <Text style={styles.popupTitle}>Tên Nhà</Text>
                        <TextInput
                            style={styles.popupInput}
                            placeholder="Nhập tên nhà mới"
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
                                <Text style={styles.popupBtnTextCancel}>Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.popupBtnSave}
                                onPress={handleSaveName}
                                disabled={savingName || !newName.trim()}
                            >
                                <Text style={styles.popupBtnTextSave}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}