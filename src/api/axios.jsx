import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// 로그인 후 토큰이 만료되거나 무효가 되면 토큰을 지우고 로그인 페이지로 보낸다.
// 로그인·가입 요청 자체의 401은 화면에서 메시지로 처리하므로 제외한다.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthRequest = url.startsWith("/auth/");

    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      sessionStorage.getItem("accessToken")
    ) {
      sessionStorage.removeItem("accessToken");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
