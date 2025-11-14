import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/NodeManagerScreenStyle';
import { getAuth } from '../../storage/auth';
import { getNodesByUser } from '../../api/node';

export default function NodeManagerScreen({ route, navigation }) {
    const { nodes: initNodes = [], homeid } = route.params || {};
    const [nodes, setNodes] = useState(initNodes);

    useEffect(() => {
        if (!homeid) {
            (async () => {
                const auth = await getAuth();
                if (!auth || !auth.token) return;
                try {
                    const res = await getNodesByUser(auth.token);
                    if (Array.isArray(res)) setNodes(res);
                } catch (e) { }
            })();
        }
    }, [homeid]);

    const refreshNodes = async () => {
        const auth = await getAuth();
        if (!auth || !auth.token) return;
        try {
            const res = await getNodesByUser(auth.token);
            if (Array.isArray(res)) {
                setNodes(res.filter(n => n.home == homeid || (n.home && n.home._id == homeid)));
            }
        } catch (e) { }
    };

    const handleNodeAdded = () => {
        refreshNodes();
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {nodes.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có node nào</Text>
                    ) : (
                        nodes.map((node, idx) => (
                            <TouchableOpacity
                                key={node._id || idx}
                                style={styles.nodeRow}
                                onPress={() => navigation.navigate('NodeSetting', { node, homeid })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.nodeName}>{node.name || 'Node ' + (idx + 1)}</Text>
                                <Icon name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddNode', { homeid, onNodeAdded: handleNodeAdded })}>
                    <Text style={styles.addBtnText}>Thêm Node</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
