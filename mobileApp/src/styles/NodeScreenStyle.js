import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c9c9c9ff',
  },
  header: {
    backgroundColor: '#5a6c80ff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffffff',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 85,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    elevation: 4,
  },
  modalBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007bff',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});

export default styles;
