import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
let token: string | null = null;
export const hasSession = () => Boolean(token);
export async function restoreSession() {
  token = Platform.OS === 'web' ? null : await SecureStore.getItemAsync('ivme-session');
  return token;
}
export async function saveToken(value: string | null) {
  if (Platform.OS !== 'web') {
    if (value) await SecureStore.setItemAsync('ivme-session', value);
    else await SecureStore.deleteItemAsync('ivme-session');
  }
  token = value;
}
export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (!__DEV__ && !API_URL.startsWith('https://')) throw new Error('Dağıtım sürümü için HTTPS sunucu adresi gerekiyor.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/${path}`, {
      method, credentials: 'omit', signal: AbortSignal.timeout(20000),
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch { throw new Error('Bağlantı kurulamadı. Seçimin korunuyor; bağlantını ve sunucu adresini kontrol edip yeniden dene.'); }
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) await saveToken(null);
    throw new Error(data.error || 'İşlem tamamlanamadı.');
  }
  return data;
}
export const mediaSource = (id: string) => ({ uri: `${API_URL}/api/media/${id}`, headers: { Authorization: `Bearer ${token}` } });
