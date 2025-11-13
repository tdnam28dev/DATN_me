

import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F7F6FB',
        paddingTop: 5,
    },
    // Modal overlay
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        zIndex: 10,
    },
    // Modal container
    modalContainer: {
        position: 'absolute',
        top: '30%',
        left: 36,
        right: 36,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingTop: 24,
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 20,
    },
    modalTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalInput: {
        width: '100%',
        fontSize: 14,
        color: '#222',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    inputWrap: {
        flex: 1,
        width: '100%',
        height: 46,
        position: 'relative',
        justifyContent: 'center',
        marginBottom: 10,
    },
    inputClear: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        zIndex: 10,
    },
    modalActions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        borderTopWidth: 0.25,
        borderColor: '#bdbdbdff',
    },
    modalButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
    },
    modalCancelButton: {
        borderRightWidth: 0.25,
        borderColor: '#bdbdbdff',
    },
    modalCancel: {
        color: '#888',
        fontSize: 16,
        fontWeight: '400',
    },
    modalConfirm: {
        color: '#111',
        fontSize: 16,
        fontWeight: '600',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        backgroundColor: 'transparent',
        marginTop: Platform.OS === 'ios' ? 40 : 0,
        marginBottom: 8,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        zIndex: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 0,
        paddingVertical: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    label: {
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },
    valueWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 14,
        color: '#A0A0A0',
        marginRight: 8,
        fontWeight: '400',
    },
    avatarWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 20,
        backgroundColor: '#a72056ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#fff',
        fontWeight: '400',
        fontSize: 20,
    },
    chevronIcon: {
        marginLeft: 0,
    },

});

export default styles;
