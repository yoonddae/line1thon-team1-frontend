import client from './client';

// U1 가입 + 토큰 발급 → { userId, nickname, accessToken }
export const signup = ({ nickname, password }) => client.post('/users', { nickname, password });

// U2 로그인 + 토큰 발급 → { userId, nickname, accessToken }
export const login = ({ nickname, password }) => client.post('/auth/login', { nickname, password });

// U3 내 정보 → { userId, nickname, createdAt }
export const getMe = () => client.get('/users/me');

// U4 닉네임 수정 → { userId, nickname }
export const updateNickname = (nickname) => client.patch('/users/me', { nickname });

// U5 로그아웃 (서버는 하는 일 없음, 프론트가 토큰 삭제)
export const logout = () => client.post('/auth/logout');

// U6 회원 탈퇴
export const withdraw = () => client.delete('/users/me');
