
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        experimental_backgroundImage: 'linear-gradient(165deg, #dce9ffff 0%, #ffffffff 100%)',
    },
    headerUser: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 36,
        paddingBottom: 18,
        backgroundColor: 'transparent',
    },
    profilePressable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarWrap: {
        marginRight: 14,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#C2185B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#C2185B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600',
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        alignSelf: 'center',
    },
    serviceCenter: {
        padding: 18,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginHorizontal: 16,
        marginBottom: 18,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
    },
    cardMore: {
        color: '#888',
        fontSize: 13,
        marginRight: 2,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    serviceItem: {
        alignItems: 'center',
        flex: 1,
    },
    serviceIcon: {
        width: 36,
        height: 36,
        marginBottom: 4,
        resizeMode: 'contain',
        borderRadius: 10,
        backgroundColor: '#F6F8FB',
    },
    serviceText: {
        fontSize: 13,
        color: '#222',
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 0,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },
    menuArrow: {
        marginLeft: 4,
    },
});

export default styles;
