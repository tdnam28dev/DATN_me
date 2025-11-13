// Hàm lấy thông tin thời tiết từ OpenWeatherMap sử dụng fetch
export async function getWeather(city = 'Hanoi,vn') {
  try {
    const apiKey = '47cba89d4147ae33f6dde945410ca002'; // API key của bạn
    // Đảm bảo city truyền vào đúng định dạng: "Hanoi,vn" hoặc "London,uk"
    const url = `https://pro.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}&units=metric&lang=vi`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      city: data.name,
      country: data.sys.country,
      temp: data.main.temp,
      main: data.weather[0].main,
      desc: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (err) {
    return null;
  }
}
