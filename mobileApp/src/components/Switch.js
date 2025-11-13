import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

export default function Switch({ isOn, onPress }) {
    return (
        <TouchableOpacity
            style={[
                styles.toggle,
                {
                    backgroundColor: isOn ? '#ff6600' : '#ccc',
                    justifyContent: isOn ? 'flex-end' : 'flex-start'
                }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View
                style={[
                    styles.circle,
                ]}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    toggle: {
        width: 45,
        padding: 3,
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 12,
    },
    circle: {
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#fff',
    },
});