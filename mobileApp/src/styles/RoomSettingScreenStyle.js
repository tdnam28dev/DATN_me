import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7FA',
        // backgroundColor: '#d7d7f5ff',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
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
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#888',
        fontWeight: '400',
    },
    subLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    deleteBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteText: {
        color: '#D32F2F',
        fontSize: 16,
        fontWeight: '500',
    },
    popupContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '85%',
        padding: 20,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 18,
    },
    popupInput: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
    },
    popupBtnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    popupBtnCancel: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
    },
    popupBtnSave: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    popupBtnText: {
        textAlign: 'center',
        fontSize: 16,
    },
});
