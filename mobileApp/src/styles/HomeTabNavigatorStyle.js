import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    tabBarContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    tabBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favTabBtn: {
        marginRight: 10,
    },
    roomTabScroll: {
        paddingLeft: 10,
    },
    roomTabBtn: {
        marginRight: 20,
    },
    tabText: {
        fontSize: 20,
    },
    tabTextActive: {
        fontWeight: '600',
        color: '#000',
    },
    tabTextInactive: {
        fontWeight: '400',
        color: '#9A9A9A',
    },
    menuRow: {
        marginLeft: 10,
    },
});

export default styles;