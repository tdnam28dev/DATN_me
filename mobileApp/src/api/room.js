import apiUrl from './config';

// Lấy danh sách phòng
export async function getRooms(token) {
  const res = await fetch(`${apiUrl}/rooms`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Lấy phòng theo id
export async function getRoomById(id, token) {
  const res = await fetch(`${apiUrl}/rooms/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Tạo phòng mới
export async function createRoom(data, token) {
  const res = await fetch(`${apiUrl}/rooms`, {
    method: 'POST',
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

// Cập nhật phòng
export async function updateRoom(id, data, token) {
  const res = await fetch(`${apiUrl}/rooms/${id}`, {
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

// Xóa phòng
export async function deleteRoom(id, token) {
  const res = await fetch(`${apiUrl}/rooms/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
