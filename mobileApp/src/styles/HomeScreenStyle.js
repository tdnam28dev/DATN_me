import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: 'linear-gradient(135deg, #e7bbfcff 0%, #b7d0f7ff 100%)',
  },
  weatherContainer: {
    borderBottomWidth: 0.2,
    width: '100%',
    height: 100,
    padding: 14,
  },
  weatherInfo:{
    height:'100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon:{
    marginRight: 12,
    
  },
  weatherText:{

  },
  weatherTemp:{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherLocDesc:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  weatherLoc:{
    fontSize: 16,
    color: '#555',
  },
  weatherDesc:{
    fontSize: 14,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
});