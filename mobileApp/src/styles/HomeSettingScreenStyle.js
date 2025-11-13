

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7FA',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
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
    },
    rowRight: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '400',
    },
    value: {
        fontSize: 14,
        color: '#888',
        fontWeight: '400',
    },
    sectionTitle: {
        fontSize: 13,
        color: '#888',
        marginBottom: 6,
        marginLeft: 4,
        fontWeight: '400',
    },
    memberCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    memberRow: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: '50%',
        backgroundColor: '#D32F2F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        color: '#222',
        fontWeight: '400',
        marginBottom: 6,
    },
    memberEmail: {
        fontSize: 13,
        color: '#888',
    },
    role: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: '500',
        marginLeft: 8,
    },
    addMemberBtn: {
        paddingVertical: 16,
        borderTopWidth: 0.5,
        borderColor: '#c2c2c2ff',
    },
    addMemberText: {
        color: '#1976d2',
        fontSize: 15,
        fontWeight: '500',
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
        // paddingHorizontal: 16,
    },
    popupTitle: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 16,
    },
    popupInput: {
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        backgroundColor: '#ebebeb',
    },
    popupBtnRow: {
        display: 'flex',
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#ccc',

    },
    popupBtn: {
        flex: 1,
        padding: 12,
    },
    popupBtnCancel: {
        flex: 1,
        padding: 12,
        borderRightWidth: 0.5,
        borderRightColor: '#ccc',
    },
    popupBtnSave: {
        flex: 1,
        padding: 12,
    },
    popupBtnTextCancel: {
        textAlign: 'center',
        fontSize: 16,
        color: '#808285',
    },
    popupBtnTextSave: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
    },
});
