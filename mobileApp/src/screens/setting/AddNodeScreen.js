import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/AddNodeScreenStyle';
import { getAuth } from '../../storage/auth';
import { createNode } from '../../api/node';

const defaultNodeTypes = [
    { label: 'Ánh sáng', value: 'light' },
    { label: 'Quạt', value: 'fan' },
    { label: 'Cảm biến', value: 'sensor' },
    { label: 'Khác', value: 'other' },
];

export default function AddNodeScreen({ navigation, route }) {
    const {  homeid } = route.params || {};
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(false);
    const [nodeTypes, setNodeTypes] = useState(defaultNodeTypes);

    const handleSelectType = (type) => {
        setSelectedType(type === selectedType ? '' : type);
    };

    const handleAddNodeType = () => {
        // Thêm loại node mới (ví dụ popup nhập tên loại node)
        // Ở đây demo thêm loại "Mới"
        setNodeTypes([...nodeTypes, { label: 'Mới', value: 'new_' + Date.now() }]);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const auth = await getAuth();
            if (!auth || !auth.token || !auth.userid) {
                setLoading(false);
                return;
            }
            const res = await createNode({ name, owner: auth.userid, home: homeid, type: selectedType }, auth.token);
            if (res && res._id) {
                navigation.goBack();
            } else {
            }
        } catch (e) {

        }
        setLoading(false);
    };

    useLayoutEffect(() => {
        const canSave = name.trim() && selectedType;
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
                    disabled={!canSave}
                    style={[styles.headerBtn, !canSave && styles.headerBtnDisabled]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.saveText, !canSave && styles.saveDisabled]}>Lưu</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, name, selectedType]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Tên Node<Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập"
                                value={name}
                                onChangeText={setName}
                            />
                            {!!name && (
                                <TouchableOpacity style={styles.clearIcon} onPress={() => setName('')}>
                                    <Icon name="close-circle" size={22} color="#bbb" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
                <Text style={styles.sectionTitle}>Kiểu node:</Text>
                <View style={styles.typeListCard}>
                    {nodeTypes.map((type, idx) => (
                        <TouchableOpacity
                            key={type.value}
                            style={styles.typeRow}
                            onPress={() => handleSelectType(type.value)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.typeLabel}>{type.label}</Text>
                            {selectedType === type.value ? (
                                <Icon name="checkmark-circle" size={28} color="#267AFF" />
                            ) : (
                                <Icon name="ellipse-outline" size={28} color="#C7C7CC" />
                            )}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.addTypeBtn} onPress={handleAddNodeType}>
                        <Text style={styles.addTypeText}>Thêm kiểu node</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
