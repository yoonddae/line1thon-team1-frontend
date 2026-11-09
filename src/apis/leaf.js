import client from './client';

// L2 잎 상세 (그날 공부 내용, 문제와 내 답, 피드백). imageUrls 는 10분 뒤 만료되니 저장하지 마세요.
export const getLeaf = (leafId) => client.get(`/leaves/${leafId}`);

// A1 광고 표시 여부 { adPlacement } → { adPlacement, count, showAd }
// 광고 확인이 실패해도 흐름을 막지 않도록 실패 시 showAd: false 로 돌려줘요.
export const checkAd = (adPlacement) =>
  client.post('/ads/views', { adPlacement }).catch(() => ({ adPlacement, showAd: false }));
