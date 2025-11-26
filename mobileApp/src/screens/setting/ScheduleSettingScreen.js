import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../../styles/ScheduleSettingScreenStyle';
import { getScheduleById, updateSchedule, deleteSchedule } from '../../api/schedule';
import { getAuth } from '../../storage/auth';

const REPEAT_OPTIONS = [
    { label: 'Chỉ một lần', value: 'once' },
    { label: 'Hàng ngày', value: 'daily' },
    { label: 'Hàng tuần', value: 'weekly' },
    { label: 'Hàng tháng', value: 'monthly' },
];

export default function ScheduleSettingScreen({ route, navigation }) {
    const { scheduleId } = route.params || {};
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [showRepeatPopup, setShowRepeatPopup] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerType, setPickerType] = useState('on'); // 'on' hoặc 'off'
    const [tempTime, setTempTime] = useState(new Date());
    const [selectedRepeat, setSelectedRepeat] = useState('once');

    useEffect(() => {
        (async () => {
            try {
                const auth = await getAuth();
                const data = await getScheduleById(scheduleId, auth.token);
                setSchedule(data);
                setIsActive(data.isActive);
                setSelectedRepeat(data.repeat || 'once');
            } catch (err) {
                Alert.alert('Lỗi', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [scheduleId]);

    const handleToggleActive = async () => {
        try {
            const auth = await getAuth();
            const updated = await updateSchedule(schedule._id, { isActive: !isActive }, auth.token);
            setIsActive(updated.isActive);
            setSchedule(updated);
        } catch (err) {
            Alert.alert('Lỗi', err.message);
        }
    };

    // Hàm chuyển đổi chuỗi giờ phút sang Date
    const parseTime = (timeStr) => {
        if (!timeStr) return new Date();
        const [hour, minute] = timeStr.split(':').map(Number);
        const now = new Date();
        now.setHours(hour);
        now.setMinutes(minute);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    };

    // Hàm chuyển đổi Date sang chuỗi giờ phút
    const formatTime = (date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    // Xử lý lưu thời gian bật/tắt
    const handleConfirmTime = async (date) => {
        setShowPicker(false);
        const newTime = formatTime(date);
        try {
            const auth = await getAuth();
            let updateObj = {};
            if (pickerType === 'on') {
                updateObj.onTime = newTime;
            } else {
                updateObj.offTime = newTime;
            }
            const updated = await updateSchedule(schedule._id, updateObj, auth.token);
            setSchedule(updated);
        } catch (err) {
            Alert.alert('Lỗi', err.message);
        }
    };

    // Xử lý cập nhật kiểu lặp lại
    const handleSelectRepeat = async (repeatValue) => {
        setShowRepeatPopup(false);
        setSelectedRepeat(repeatValue);
        try {
            const auth = await getAuth();
            const updated = await updateSchedule(schedule._id, { repeat: repeatValue }, auth.token);
            setSchedule(updated);
        } catch (err) {
            Alert.alert('Lỗi', err.message);
        }
    };

    const handleDelete = async () => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa lịch này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        const auth = await getAuth();
                        await deleteSchedule(schedule._id, auth.token);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Lỗi', err.message);
                    }
                }
            }
        ]);
    };

    if (loading || !schedule) {
        return (
            <View style={styles.loadingBox}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tên thiết bị</Text>
                        <Text style={styles.value}>{schedule.device?.name || 'Thiết bị'}</Text>
                    </View>
                </View>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => { setPickerType('on'); setTempTime(parseTime(schedule.onTime)); setShowPicker(true); }}>
                        <Text style={styles.label}>Thời gian bật</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{schedule.onTime}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => { setPickerType('off'); setTempTime(parseTime(schedule.offTime)); setShowPicker(true); }}>
                        <Text style={styles.label}>Thời gian tắt</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{schedule.offTime}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setShowRepeatPopup(true)}>
                        <Text style={styles.label}>Lặp lại</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{REPEAT_OPTIONS.find(opt => opt.value === selectedRepeat)?.label || 'Chỉ một lần'}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Trạng thái</Text>
                        <View style={styles.rowRight}>
                            <Text style={[styles.statusText, isActive ? styles.statusOn : styles.statusOff]}>{isActive ? 'Đang bật' : 'Đã tắt'}</Text>
                            <Switch
                                value={isActive}
                                onValueChange={handleToggleActive}
                                thumbColor={isActive ? '#34C759' : '#ccc'}
                                trackColor={{ false: '#ccc', true: '#34C759' }}
                            />
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>Xóa lịch</Text>
                </TouchableOpacity>
                {/* DateTimePickerModal chọn thời gian bật/tắt */}
                <DateTimePickerModal
                    isVisible={showPicker}
                    mode="time"
                    date={tempTime}
                    onConfirm={handleConfirmTime}
                    onCancel={() => setShowPicker(false)}
                    headerTextIOS={pickerType === 'on' ? 'Chọn thời gian bật' : 'Chọn thời gian tắt'}
                    cancelTextIOS="Hủy"
                    confirmTextIOS="OK"
                />
                {/* Popup chọn lặp lại */}
                <Modal
                    visible={showRepeatPopup}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowRepeatPopup(false)}
                >
                    <Pressable style={styles.popupOverlay} onPress={() => setShowRepeatPopup(false)}>
                        <View style={styles.popupBox}>
                            {REPEAT_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={styles.popupRow}
                                    onPress={() => handleSelectRepeat(opt.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.popupLabel}>{opt.label}</Text>
                                    {selectedRepeat === opt.value && (
                                        <Icon name="checkmark" size={22} color="#1976d2" style={styles.popupCheckIcon} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            </ScrollView>
        </View>
    );
}
