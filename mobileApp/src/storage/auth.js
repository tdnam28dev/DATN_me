import EncryptedStorage from 'react-native-encrypted-storage';

export async function saveAuth({ username, password, token, userid }) {
  await EncryptedStorage.setItem('auth', JSON.stringify({ username, password, token, userid }));
}

export async function getAuth() {
  const data = await EncryptedStorage.getItem('auth');
  return data ? JSON.parse(data) : null;
}

export async function removeAuth() {
  await EncryptedStorage.removeItem('auth');
}
