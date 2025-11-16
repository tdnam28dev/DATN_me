import apiUrl from './config';

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

// Lấy danh sách Devices theo user hiện tại
export async function getDevicesByUser(token, query = {}) {
  // Tạo chuỗi query string từ object query
  const queryString = Object.keys(query).length
    ? '?' + new URLSearchParams(query).toString()
    : '';
  const res = await fetch(`${apiUrl}/devices/me${queryString}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}


// Lấy device theo id
export async function getDeviceById(id, token) {
  const res = await fetch(`${apiUrl}/devices/me/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Cập nhật device (update/me/:id)
export async function updateDevice(id, data, token) {
  const res = await fetch(`${apiUrl}/devices/update/me/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Xóa node (me/:id)
export async function deleteDevice(id, token) {
  const res = await fetch(`${apiUrl}/devices/delete/me/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
