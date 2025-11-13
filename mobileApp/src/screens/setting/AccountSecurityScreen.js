
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/AccountSecurityScreenStyle';

export default function AccountSecurityScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                {/* Khu vực */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Khu vực</Text>
                        <Text style={styles.value}>Vietnam</Text>
                    </View>
                </View>

                {/* Email */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.row}>
                        <View>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.subLabel}>tdn****.dev@gmail.com</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.value}>Linked</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={{ marginLeft: 6 }} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Link Third-Party Accounts */}
                <Text style={styles.sectionTitle}>Link Third-Party Accounts</Text>
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>Google</Text>
                            <Text style={styles.subLabel}>Nam Trần</Text>
                        </View>
                        <Text style={styles.value}>Linked</Text>
                    </View>
                </View>

                {/* Đổi mật khẩu, Face ID, Mở khóa cử chỉ, Multi-Device Login Management */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Thay đổi mật khẩu đăng nhập</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Face ID</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.value}>Out of Sync</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={{ marginLeft: 6 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Mở khóa cử chỉ</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.value}>Không được thiết lập</Text>
                            <Icon name="chevron-forward" size={18} color="#bbb" style={{ marginLeft: 6 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Multi-Device Login Management</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                </View>

                {/* User Code, Vô hiệu hóa tài khoản */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>User Code</Text>
                        <Text style={styles.value}>GaHR6ou</Text>
                    </View>
                    <TouchableOpacity style={styles.row}>
                        <Text style={styles.label}>Vô hiệu hóa tài khoản</Text>
                        <Icon name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
