import apiUrl from './config';

// Thêm nhà mới
export async function createHome(data, token) {
  const res = await fetch(`${apiUrl}/homes`, {
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

// Lấy danh sách nhà theo user hiện tại
export async function getHomesByUser(token) {
  const res = await fetch(`${apiUrl}/homes/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}


// Lấy nhà theo id
export async function getHomeById(id, token) {
  const res = await fetch(`${apiUrl}/homes/me/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Cập nhật nhà (update/me/:id)
export async function updateHome(id, data, token) {
  const res = await fetch(`${apiUrl}/homes/update/me/${id}`, {
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

// Xóa nhà (me/:id)
export async function deleteHome(id, token) {
  const res = await fetch(`${apiUrl}/homes/delete/me/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
