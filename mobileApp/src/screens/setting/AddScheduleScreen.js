import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../../styles/AddScheduleScreenStyle';
import { createSchedule } from '../../api/schedule';
import { getAuth } from '../../storage/auth';

const TIME_POINTS = [
    { label: 'Điểm thời gian chỉ định', value: 'fixed' },
    { label: 'Mặt trời mọc', value: 'sunrise' },
    { label: 'Hoàng hôn', value: 'sunset' },
];

const REPEAT_OPTIONS = [
    { label: 'Chỉ một lần', value: 'once' },
    { label: 'Hàng ngày', value: 'daily' },
    { label: 'Hàng tuần', value: 'weekly' },
    { label: 'Hàng tháng', value: 'monthly' },
];

export default function AddScheduleScreen({ route, navigation }) {
    const { deviceid, roomid, ownerid, nodeid } = route.params || {};
    const [selectedTimePoint, setSelectedTimePoint] = useState('fixed');
    const [selectedRepeat, setSelectedRepeat] = useState('');
    const [onTime, setOnTime] = useState('00:00');
    const [offTime, setOffTime] = useState('00:00');
    const [showPicker, setShowPicker] = useState(false);
    const [pickerType, setPickerType] = useState(null); // 'on' | 'off'
    const [tempTime, setTempTime] = useState(new Date());
    const [showRepeatPopup, setShowRepeatPopup] = useState(false);

    // Helper: parse "HH:mm" to Date
    const parseTime = (str) => {
        const [h, m] = str.split(':');
        const d = new Date();
        d.setHours(Number(h));
        d.setMinutes(Number(m));
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    };

    // Điều kiện cho phép lưu
    const canSave = (onTime || offTime) && selectedRepeat;

    // Hàm lưu lịch trình (theo đúng model)
    const handleSave = async () => {
        if (!canSave) return;
        try {
            const auth = await getAuth();
            const data = {
                device: deviceid,
                room: roomid,
                owner: ownerid,
                node: nodeid,
                repeat: selectedRepeat,
                onTime: onTime || undefined,
                offTime: offTime || undefined,
                createdBy: auth.userid,
            };
            const result = await createSchedule(data, auth.token);
            console.log('Created schedule:', result);
            navigation.goBack();
        } catch (err) {
            alert(err.message);
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
                    style={[styles.headerBtn, !canSave && styles.headerBtnDisabled]}
                    activeOpacity={canSave ? 0.7 : 1}
                    disabled={!canSave}
                    onPress={handleSave}
                >
                    <Text style={[styles.saveText, !canSave && styles.saveDisabled]}>Lưu</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, canSave, onTime, offTime, selectedRepeat, selectedTimePoint]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {TIME_POINTS.map(tp => (
                        <TouchableOpacity
                            key={tp.value}
                            style={styles.row}
                            onPress={() => setSelectedTimePoint(tp.value)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.label}>{tp.label}</Text>
                            {selectedTimePoint === tp.value && (
                                <Icon name="checkmark" size={22} color="#1976d2" style={styles.checkIcon} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => { setPickerType('on'); setTempTime(parseTime(onTime)); setShowPicker(true); }}>
                        <Text style={styles.label}>Thời gian bật</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{onTime}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => { setPickerType('off'); setTempTime(parseTime(offTime)); setShowPicker(true); }}>
                        <Text style={styles.label}>Thời gian tắt</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{offTime}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => setShowRepeatPopup(true)}>
                        <Text style={styles.label}>Lặp lại</Text>
                        <View style={styles.rowRight}>
                            <Text style={styles.value}>{REPEAT_OPTIONS.find(r => r.value === selectedRepeat)?.label}</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={styles.arrowIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
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
                                    onPress={() => { setSelectedRepeat(opt.value); setShowRepeatPopup(false); }}
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
            <DateTimePickerModal
                isVisible={showPicker}
                mode="time"
                date={tempTime}
                onConfirm={date => {
                    const h = date.getHours().toString().padStart(2, '0');
                    const m = date.getMinutes().toString().padStart(2, '0');
                    if (pickerType === 'on') setOnTime(`${h}:${m}`);
                    if (pickerType === 'off') setOffTime(`${h}:${m}`);
                    setShowPicker(false);
                }}
                onCancel={() => setShowPicker(false)}
                headerTextIOS={pickerType === 'on' ? 'Chọn thời gian bật' : 'Chọn thời gian tắt'}
                cancelTextIOS="Hủy"
                confirmTextIOS="Xác nhận"
                is24Hour={true}
                locale="vi"
            />
        </View>
    );
}
