import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },
  backBtn: {
    paddingLeft: 16,
  },
  okBtn: {
    paddingRight: 16,
    backgroundColor: 'transparent',
  },
  okText: {
    color: '#267AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  okTextDisabled: {
        color: '#C7C7CC',
    },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
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
  label: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  clearInputBtn: {
    marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        height: '100%',
        zIndex: 10,
  },
  suggestTitle: {
    fontSize: 13,
    color: '#222',
    fontWeight: '400',
    marginLeft: 24,
    marginBottom: 8,
  },
  suggestList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
  },
  suggestItem: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#cececeff',
  },
  suggestItemActive: {
    backgroundColor: '#267AFF22',
  },
  suggestText: {
    color: '#222',
    fontSize: 15,
  },
  suggestTextActive: {
    color: '#267AFF',
    fontWeight: '500',
  },
});
