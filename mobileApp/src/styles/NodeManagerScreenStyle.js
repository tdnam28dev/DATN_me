import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#222',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 32,
        fontSize: 16,
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
    nodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 18,
    },
    nodeName: {
        fontSize: 16,
        color: '#222',
    },
    addBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    addBtnText: {
        color: '#267AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    createGroupBtn: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 0,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e6e6e6',
    },
    createGroupText: {
        color: '#267AFF',
        fontSize: 16,
        fontWeight: '500',
    },
});
