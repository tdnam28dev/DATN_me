// Lấy apiUrl từ biến môi trường
const apiUrl = process.env.REACT_APP_API_URL || process.env.API_URL || 'http://192.168.1.40:8080/api/v1';
export default apiUrl;