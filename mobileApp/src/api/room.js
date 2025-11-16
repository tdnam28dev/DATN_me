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

// Lấy danh sách phòng theo user hiện tại, hỗ trợ truyền query động
export async function getRoomsByUser(token, params = {}) {
  // Tạo query string từ object params
  const queryString = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  const res = await fetch(`${apiUrl}/rooms/me${queryString}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Lấy danh sách phòng theo user và phòng hiện tại
export async function getRoomByUserAndId(id, token) {
  const res = await fetch(`${apiUrl}/rooms/me/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Cập nhật phòng (update/me/:id)
export async function updateRoomByUser(id, data, token) {
  const res = await fetch(`${apiUrl}/rooms/update/me/${id}`, {
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

// Xóa phòng (me/:id)
export async function deleteRoomByUser(id, token) {
  const res = await fetch(`${apiUrl}/rooms/delete/me/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}