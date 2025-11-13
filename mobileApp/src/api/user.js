import apiUrl from './config';

// Lấy thông tin user hiện tại
export async function getCurrentUser(token) {
  const res = await fetch(`${apiUrl}/users/get/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Lấy user theo id
export async function getUserById(id, token) {
  const res = await fetch(`${apiUrl}/users/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Cập nhật thông tin user hiện tại
export async function updateUser(data, token) {
  const res = await fetch(`${apiUrl}/users/update/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Xóa user
export async function deleteUser(id, token) {
  const res = await fetch(`${apiUrl}/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
