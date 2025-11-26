import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F7FC',
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 22,
    },
    addBtnText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
        marginHorizontal: 18,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 6,
    },
    listContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        elevation: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
    },
    time: {
        fontSize: 15,
        color: '#1976d2',
        fontWeight: '500',
    },
    statusOn: {
        color: '#34C759',
        fontWeight: '500',
        fontSize: 15,
    },
    statusOff: {
        color: '#FF3B30',
        fontWeight: '500',
        fontSize: 15,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#888',
        marginBottom: 8,
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        width: 130,
        height: 130,
    },

    
});
