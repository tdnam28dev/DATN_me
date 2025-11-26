import apiUrl from './config';

// Thêm nhà mới
export async function createSchedule(data, token) {
  const res = await fetch(`${apiUrl}/schedules`, {
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


export async function getSchedulesByUser(token, params = {}) {
  // Tạo query string từ object params
  const queryString = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  const res = await fetch(`${apiUrl}/schedules/me${queryString}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}


// Lấy lịch theo id
export async function getScheduleById(id, token) {
  const res = await fetch(`${apiUrl}/schedules/me/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Cập nhật lịch (update/me/:id)
export async function updateSchedule(id, data, token) {
  const res = await fetch(`${apiUrl}/schedules/update/me/${id}`, {
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

// Xóa lịch (me/:id)
export async function deleteSchedule(id, token) {
  const res = await fetch(`${apiUrl}/schedules/delete/me/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
