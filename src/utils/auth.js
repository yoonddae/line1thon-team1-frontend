// 토큰 저장 방식은 API 명세서(토큰/쿠키 여부) 확인 후 확정합니다.
const TOKEN_KEY = 'accessToken';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => Boolean(getToken());
