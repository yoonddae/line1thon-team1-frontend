// 비밀번호: 숫자 4~6자리. 앞자리 0 보존을 위해 항상 문자열로 다뤄요.
export const sanitizePassword = (value) => value.replace(/\D/g, '').slice(0, 6);

export const validatePassword = (value) => {
  if (!value) return '비밀번호를 입력해 주세요';
  if (!/^\d{4,6}$/.test(value)) return '숫자 4~6자리로 입력해 주세요';
  return '';
};

// 닉네임: 앞뒤 공백을 지운 뒤 2~10자
export const validateNickname = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '닉네임을 입력해 주세요';
  if (trimmed.length < 2 || trimmed.length > 10) return '닉네임은 2~10자로 입력해 주세요';
  return '';
};

// 과목 이름: 1~20자
export const validateSubjectName = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '과목 이름을 입력해 주세요';
  if (trimmed.length > 20) return '과목 이름은 20자까지 쓸 수 있어요';
  return '';
};
