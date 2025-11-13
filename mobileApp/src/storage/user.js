import EncryptedStorage from 'react-native-encrypted-storage';

export async function saveUser({ name, email, phone, country }) {
  await EncryptedStorage.setItem('user', JSON.stringify({ name, email, phone, country }));
}

export async function getUser() {
  const data = await EncryptedStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

export async function removeUser() {
  await EncryptedStorage.removeItem('user');
}