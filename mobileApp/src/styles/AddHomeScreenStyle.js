import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 1,
        backgroundColor: '#F7F7FA',
    },
    headerBtn: {
        marginHorizontal: 20,
    },
    cancelText: {
        color: '#3d3d3dff',
        fontSize: 17,
        fontWeight: '500',
    },

    saveText: {
        color: '#267AFF',
        fontSize: 17,
        fontWeight: '500',
    },
    saveDisabled: {
        color: '#C7C7CC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    inputCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputRow1: {
        // marginBottom: 16,
        borderRadius: 8,
    },
    inputRow2: {
        borderRadius: 8,
        paddingVertical: 16,
    },
    label: {
        fontSize: 16,
        color: '#222',
        fontWeight: '400',
    },
    inputWithIcon: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0,
        minHeight: 40,
        position: 'relative',
    },
    clearInputBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        height: '100%',
        zIndex: 10,
    },
    required: {
        color: '#FF3B30',
        fontSize: 16,
    },
    input: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: '#222',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e7e7e7ff',
        paddingVertical: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 16,
        color: '#C7C7CC',
        marginRight: 4,
    },
    sectionTitle: {
        fontSize: 13,
        color: '#363636ff',
        marginBottom: 5,
        marginLeft: 16,
    },
    roomCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    roomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    roomName: {
        fontSize: 16,
        color: '#222',
    },
    addRoomBtn: {
        paddingVertical: 16,
        borderTopWidth: 0.5,
        borderTopColor: '#bdbdbdff',
    },
    addRoomText: {
        color: '#267AFF',
        fontSize: 16,
        fontWeight: '500',
    },
});
