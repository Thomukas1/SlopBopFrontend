import { apiFetch } from './client';

interface AdminCheckResponse {
  isAdmin: boolean;
}

export const checkAdmin = (walletAddress: string) =>
  apiFetch<AdminCheckResponse>(`/slopbop/admin/check`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  }).then(r => r.isAdmin);
