import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 0,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    label: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
        color: '#888',
        fontWeight: '400',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '500',
        marginRight: 8,
    },
    statusOn: {
        color: '#34C759',
    },
    statusOff: {
        color: '#FF3B30',
    },
    deleteBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    deleteBtnText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupBox: {
        backgroundColor: '#fff',
        borderRadius: 14,
        width: '85%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    popupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 20,
    },
    popupLabel: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    popupCheckIcon: {
        color: '#1976d2',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
