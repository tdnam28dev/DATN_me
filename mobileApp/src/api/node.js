
import apiUrl from './config';

// Tạo node mới
export async function createNode(data, token) {
	const res = await fetch(`${apiUrl}/nodes`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return res.json();
}

// Lấy danh sách nodes theo user hiện tại
export async function getNodesByUser(token) {
  const res = await fetch(`${apiUrl}/nodes/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}


// Lấy node theo id
export async function getNodeById(id, token) {
  const res = await fetch(`${apiUrl}/nodes/me/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Cập nhật node (update/me/:id)
export async function updateNode(id, data, token) {
  const res = await fetch(`${apiUrl}/nodes/update/me/${id}`, {
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
export async function deleteNode(id, token) {
  const res = await fetch(`${apiUrl}/nodes/delete/me/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}