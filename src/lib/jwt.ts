const JWT_SECRET = process.env.JWT_SECRET || 'emba_connect_secret_token_session_secure_2026_xyz';
const encoder = new TextEncoder();

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  status: string;
  exp?: number;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufferToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    + '='.repeat((4 - (base64url.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Set default expiration to 7 days if not provided
  const expPayload = {
    ...payload,
    exp: payload.exp || Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  const part1 = bufferToBase64Url(encoder.encode(JSON.stringify(header)));
  const part2 = bufferToBase64Url(encoder.encode(JSON.stringify(expPayload)));
  
  const key = await getCryptoKey(JWT_SECRET);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${part1}.${part2}`)
  );
  const part3 = bufferToBase64Url(new Uint8Array(signatureBuffer));
  
  return `${part1}.${part2}.${part3}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [part1, part2, part3] = parts;
    const key = await getCryptoKey(JWT_SECRET);
    
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      new Uint8Array(base64UrlToBuffer(part3)),
      encoder.encode(`${part1}.${part2}`)
    );
    
    if (!verified) return null;
    
    const payloadBytes = new Uint8Array(base64UrlToBuffer(part2));
    const payloadText = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadText) as JWTPayload;
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (e) {
    console.error('JWT WebCrypto verification error:', e);
    return null;
  }
}

export async function getSessionFromToken(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null;
  return verifyToken(token);
}
