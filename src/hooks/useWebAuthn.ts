/**
 * useWebAuthn – lightweight WebAuthn (Passkey / Fingerprint) helper.
 *
 * Strategy:
 *  • Registration  → triggered once after a successful password login.
 *    Stores the credential ID in localStorage so it survives page refreshes.
 *  • Authentication → uses navigator.credentials.get() with the stored ID.
 *    On success the hook returns `true`; the caller then reads the saved
 *    Basic-Auth token from sessionStorage and logs the user in.
 *
 * No server-side ceremony is needed because the actual backend credentials
 * (Basic Auth token) are already stored in sessionStorage from the first
 * password login – fingerprint just re-authorises access to that token
 * on the same trusted device.
 */

const RP_ID   = window.location.hostname;   // e.g. "localhost" or your domain
const RP_NAME = 'LibOn-M Library System';
const USER_ID_KEY  = 'webauthn_user_id';
const CRED_ID_KEY  = 'webauthn_cred_id';

// ─── helpers ────────────────────────────────────────────────────────────────

function bufferToBase64(buf: ArrayBuffer | ArrayBufferView): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function randomBytes(len: number): Uint8Array<ArrayBuffer> {
  const arr = new Uint8Array(new ArrayBuffer(len));
  crypto.getRandomValues(arr);
  return arr;
}

// ─── public API ─────────────────────────────────────────────────────────────

/** Returns true if a passkey credential has been registered on this device. */
export function hasPasskey(): boolean {
  return !!localStorage.getItem(CRED_ID_KEY);
}

/** Returns true if the browser supports WebAuthn. */
export function isWebAuthnSupported(): boolean {
  return !!(window.PublicKeyCredential);
}

/**
 * Register a new passkey (fingerprint / Windows Hello / Face ID).
 * Call this after a successful password login.
 * Returns true on success, throws on failure.
 */
export async function registerPasskey(): Promise<boolean> {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn not supported in this browser.');

  // Stable user handle – reuse existing or create new
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = bufferToBase64(randomBytes(16));
    localStorage.setItem(USER_ID_KEY, userId);
  }

  const challenge = randomBytes(32);

  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { id: RP_ID, name: RP_NAME },
      user: {
        id: base64ToBuffer(userId),
        name: 'admin',
        displayName: 'Library Admin',
      },
      challenge,
      pubKeyCredParams: [
        { type: 'public-key', alg: -7  },   // ES256
        { type: 'public-key', alg: -257 },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',   // device biometric
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  }) as PublicKeyCredential | null;

  if (!credential) throw new Error('No credential returned.');

  // Store the credential ID so we can use it for future logins
  localStorage.setItem(CRED_ID_KEY, bufferToBase64(credential.rawId));
  return true;
}

/**
 * Authenticate with a registered passkey.
 * Returns true if the user verified successfully.
 */
export async function authenticateWithPasskey(): Promise<boolean> {
  if (!isWebAuthnSupported()) throw new Error('WebAuthn not supported.');

  const storedId = localStorage.getItem(CRED_ID_KEY);
  if (!storedId) throw new Error('No passkey registered on this device.');

  const challenge = randomBytes(32);

  const assertion = await navigator.credentials.get({
    publicKey: {
      rpId: RP_ID,
      challenge,
      allowCredentials: [
        { type: 'public-key', id: base64ToBuffer(storedId) },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  }) as PublicKeyCredential | null;

  // If the browser resolved without throwing the user verified successfully
  return !!assertion;
}

/** Remove the stored passkey (e.g. from Settings). */
export function removePasskey(): void {
  localStorage.removeItem(CRED_ID_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
