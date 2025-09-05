export type AdminClaims = {
  sub: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  iat: number;
  exp: number;
};

const te = new TextEncoder();
const td = new TextDecoder();
const SECRET = process.env.JWT_SECRET ?? 'dev-secret';

function toHex(u8: Uint8Array): string {
  return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('bad hex');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out as Uint8Array;
}
async function getKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey('raw', te.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign','verify']);
}

export async function createAdminToken(
  claims: { sub: string; role: 'ADMIN' | 'SUPER_ADMIN' }, days = 7
): Promise<string> {
  const now = Math.floor(Date.now()/1000);
  const payload: AdminClaims = { sub: claims.sub, role: claims.role, iat: now, exp: now + days*24*60*60 };
  const data = te.encode(JSON.stringify(payload));
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return `${toHex(new Uint8Array(data))}.${toHex(new Uint8Array(sig))}`;
}

export async function verifyAdminToken(token?: string): Promise<AdminClaims|null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  try {
    const data = hexToBytes(parts[0]); const sig = hexToBytes(parts[1]);
    const key = await getKey();
    // @ts-expect-error - crypto.subtle.verify 타입 호환성 문제 해결
    const ok = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!ok) return null;
    const payload = JSON.parse(td.decode(data)) as AdminClaims;
    const now = Math.floor(Date.now()/1000);
    if (!payload.exp || now > payload.exp) return null;
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') return null;
    return payload;
  } catch { return null; }
}

