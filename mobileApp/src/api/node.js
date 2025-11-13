
import apiUrl from './config';

// Lấy danh sách node
export async function getNodes(token) {
	const res = await fetch(`${apiUrl}/nodes`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return res.json();
}

// Lấy node theo id
export async function getNodeById(id, token) {
	const res = await fetch(`${apiUrl}/nodes/${id}`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return res.json();
}

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

// Cập nhật node
export async function updateNode(id, data, token) {
	const res = await fetch(`${apiUrl}/nodes/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return res.json();
}

// Xóa node
export async function deleteNode(id, token) {
	const res = await fetch(`${apiUrl}/nodes/${id}`, {
		method: 'DELETE',
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return res.json();
}
