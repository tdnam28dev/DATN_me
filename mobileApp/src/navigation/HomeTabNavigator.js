import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../styles/HomeTabNavigatorStyle';

export default function HomeTabNavigator({ index, setIndex, routes, scrollRef, tabRefs }) {
    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBarRow}>

                {/* TAB Favorites */}
                <TouchableOpacity
                    onPress={() => setIndex(0)}
                    style={styles.favTabBtn}
                >
                    <Text style={[
                        styles.tabText,
                        index === 0 ? styles.tabTextActive : styles.tabTextInactive
                    ]}>
                        Favorites
                    </Text>
                </TouchableOpacity>

                {/* TABS ROOMS */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.roomTabScroll}
                >
                    {routes.slice(1).map((route, i) => {
                        const tabIndex = i + 1;

                        return (
                            <TouchableOpacity
                                key={route.key}
                                ref={(el) => (tabRefs.current[i] = el)}
                                onPress={() => setIndex(tabIndex)}
                                style={styles.roomTabBtn}
                            >
                                <Text style={[
                                    styles.tabText,
                                    index === tabIndex ? styles.tabTextActive : styles.tabTextInactive
                                ]}>
                                    {route.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <TouchableOpacity style={styles.menuRow}>
                    <Ionicons name="menu" size={22} style={styles.menuIcon} color="#222" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
