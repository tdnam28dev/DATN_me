import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/HomeManagerScreenStyle';
import { getAuth } from '../../storage/auth';
import { getHomesByUser } from '../../api/home';

export default function HomeManagerScreen({ navigation }) {
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchHomes = async () => {
                setLoading(true);
                try {
                    const auth = await getAuth();
                    const data = await getHomesByUser(auth.token);
                    console.log('Fetched homes:', data);
                    if (isActive) setHomes(data);
                } catch (err) {
                    if (isActive) setHomes([]);
                } finally {
                    if (isActive) setLoading(false);
                }
            };
            fetchHomes();
            return () => { isActive = false; };
        }, [])
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Danh sách nhà */}
                <View style={styles.section}>
                    {loading ? (
                        <TouchableOpacity style={styles.row}>
                            <ActivityIndicator size={28} color="#8b8b8bff" style={{ marginVertical: 24 }} />
                            <Icon name="chevron-forward" size={20} color="#bbb" />
                        </TouchableOpacity>
                    ) : (
                        homes.length === 0 ? (
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => navigation.navigate('AddHome')}
                            >
                                <Text style={styles.label}>Nhà của tôi</Text>
                                <Icon name="chevron-forward" size={20} color="#bbb" />
                            </TouchableOpacity>
                        ) : (
                            homes.map((home) => (
                                <TouchableOpacity
                                    key={home._id}
                                    style={styles.row}
                                    onPress={() => navigation.navigate('HomeSetting', { home })}
                                >
                                    <Text style={styles.label}>{home.name}</Text>
                                    <Icon name="chevron-forward" size={20} color="#bbb" />
                                </TouchableOpacity>
                            ))
                        )
                    )}
                </View>
                {/* Thêm nhà */}
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation && navigation.navigate && navigation.navigate('AddHome')}>
                    <Text style={styles.addBtnText}>Thêm nhà</Text>
                </TouchableOpacity>
                {/* Join a home */}
                <TouchableOpacity style={styles.addBtn}>
                    <Text style={[styles.addBtnText, { color: '#1976d2' }]}>Join a home</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
