
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F7F6FB',
	},
	section: {
		backgroundColor: '#fff',
		borderRadius: 16,
		marginHorizontal: 16,
		marginBottom: 18,
		paddingHorizontal: 0,
		paddingVertical: 0,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		paddingVertical: 20,
	},
	label: {
		fontSize: 15,
		color: '#222',
		fontWeight: '500',
	},
	value: {
		fontSize: 13,
		color: '#A0A0A0',
		fontWeight: '400',
	},
	subLabel: {
		fontSize: 13,
		color: '#888',
		marginTop: 2,
	},
	sectionTitle: {
		fontSize: 14,
		color: '#888',
		fontWeight: '500',
		marginLeft: 20,
		marginTop: 10,
		marginBottom: 2,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 56,
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
});

export default styles;
