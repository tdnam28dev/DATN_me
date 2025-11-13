import apiUrl from './config';

// Lấy danh sách thiết bị
export async function getDevices(token, roomId) {
  let url = `${apiUrl}/devices`;
  if (roomId) {
    url += `?room=${roomId}`;
  }
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Lấy thiết bị theo id
export async function getDeviceById(id, token) {
  const res = await fetch(`${apiUrl}/devices/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Tạo thiết bị mới
export async function createDevice(data, token) {
  const res = await fetch(`${apiUrl}/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Cập nhật thiết bị
export async function updateDevice(token, id, data) {
  const res = await fetch(`${apiUrl}/devices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Xóa thiết bị
export async function deleteDevice(id, token) {
  const res = await fetch(`${apiUrl}/devices/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
