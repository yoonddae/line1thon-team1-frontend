import axios from 'axios';
import { getToken, clearToken } from '@/utils/auth';

// 모든 API 는 이 인스턴스를 씁니다.
// - 응답 { success, data, error } 에서 data 만 돌려줘요.
// - 실패하면 { status, code, message } 형태의 ApiError 를 throw 해요.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.30nezog.shop/api/v1',
  timeout: 60000, // AI 호출(S1·S2·S3·R2)이 수십 초 걸릴 수 있어요
});

export class ApiError extends Error {
  constructor({ status, code, message }) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data?.data ?? null,
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;

    if (status === 401 && body?.error?.code !== 'LOGIN_FAILED') {
      clearToken();
      if (window.location.pathname !== '/login') window.location.replace('/login');
    }

    return Promise.reject(
      new ApiError({
        status,
        code: body?.error?.code ?? (error.code === 'ECONNABORTED' ? 'AI_TIMEOUT' : 'NETWORK'),
        message: body?.error?.message ?? error.message,
      }),
    );
  },
);

// 버튼 두 번 눌림으로 생긴 409 REQUEST_IN_PROGRESS 는 화면에서 무시해요.
export const isInProgressError = (error) => error?.code === 'REQUEST_IN_PROGRESS';

export default client;
