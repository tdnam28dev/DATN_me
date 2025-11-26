import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Image } from 'react-native';
import styles from '../../styles/ScheduleDeviceScreenStyle';

import { getSchedulesByUser } from '../../api/schedule';
import { getAuth } from '../../storage/auth';

export default function ScheduleDeviceScreen({ route, navigation }) {
    const { deviceid, roomid, ownerid, nodeid } = route.params || {};
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            (async () => {
                try {
                    const auth = await getAuth();
                    const data = await getSchedulesByUser(auth.token, { device: deviceid });
                    console.log('Fetched schedules for device', deviceid, data);
                    if (isActive) setSchedules(data);
                } catch (err) {
                    if (isActive) setSchedules([]);
                }
            })();
            return () => { isActive = false; };
        }, [deviceid])
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddSchedule', { deviceid, roomid, ownerid, nodeid })}
                    style={styles.addBtn}
                    activeOpacity={0.7}
                >
                    <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, deviceid]);

    function getNowHM() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    }

    function compareHM(a, b) {
        // a, b: "HH:mm"
        const [ha, ma] = a.split(':').map(Number);
        const [hb, mb] = b.split(':').map(Number);
        if (ha < hb) return -1;
        if (ha > hb) return 1;
        if (ma < mb) return -1;
        if (ma > mb) return 1;
        return 0;
    }

    const nowHM = getNowHM();

    function isOngoing(schedule) {
        if (schedule.onTime && schedule.offTime) {
            // Đang diễn ra nếu now nằm giữa onTime và offTime
            return compareHM(schedule.onTime, nowHM) <= 0 && compareHM(nowHM, schedule.offTime) < 0;
        }
        return false;
    }
    function isEnded(schedule) {
        if (schedule.offTime) {
            return compareHM(schedule.offTime, nowHM) <= 0;
        }
        return false;
    }
    const ongoingSchedules = schedules.filter(isOngoing);
    const endedSchedules = schedules.filter(isEnded);
    const upcomingSchedules = schedules.filter(
        sch => !isOngoing(sch) && !isEnded(sch)
    );

    return (
        <View style={styles.container}>
            {schedules.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Image source={require('../../assets/img/emptybox.png')} style={styles.emptyImage} resizeMode="contain" />
                    <Text style={styles.emptyText}>Không có lịch trình</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {ongoingSchedules.length > 0 && (
                        <View>
                            <View style={styles.sectionDivider}>
                                <Text style={[styles.sectionTitle]}>Đang diễn ra</Text>
                            </View>
                            <View style={styles.listContainer}>
                                {ongoingSchedules.map((item, idx) => (
                                    <TouchableOpacity
                                        key={item._id || idx}
                                        style={styles.card}
                                        onPress={() => navigation.navigate('ScheduleSetting', { scheduleId: item._id })}
                                    >
                                        <View style={styles.row}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.time}>{item.onTime + ' - ' + item.offTime}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                                <Text style={item.isActive ? styles.statusOn : styles.statusOff}>{item.isActive ? 'Đang bật' : 'Đã tắt'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                    {upcomingSchedules.length > 0 && (
                        <View>
                            <View style={styles.sectionDivider}>
                                <Text style={[styles.sectionTitle, { color: '#007AFF' }]}>Sắp diễn ra</Text>
                            </View>
                            <View style={styles.listContainer}>
                                {upcomingSchedules.map((item, idx) => (
                                    <TouchableOpacity
                                        key={item._id || idx}
                                        style={styles.card}
                                        onPress={() => navigation.navigate('ScheduleSetting', { scheduleId: item._id })}
                                    >
                                        <View style={styles.row}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.time}>{item.onTime + ' - ' + item.offTime}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                                <Text style={item.isActive ? styles.statusOn : styles.statusOff}>{item.isActive ? 'Đang bật' : 'Đã tắt'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                    {endedSchedules.length > 0 && (
                        <View>
                            <View style={styles.sectionDivider}>
                                <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>Đã kết thúc</Text>
                            </View>
                            <View style={styles.listContainer}>
                                {endedSchedules.map((item, idx) => (
                                    <TouchableOpacity
                                        key={item._id || idx}
                                        style={styles.card}
                                        onPress={() => navigation.navigate('ScheduleSetting', { scheduleId: item._id })}
                                    >
                                        <View style={styles.row}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.time}>{item.onTime + ' - ' + item.offTime}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                                <Text style={item.isActive ? styles.statusOn : styles.statusOff}>{item.isActive ? 'Đang bật' : 'Đã tắt'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

