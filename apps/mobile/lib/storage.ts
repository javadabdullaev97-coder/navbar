// Загрузка изображений в Supabase Storage из Expo (без нативных билдов).
// expo-image-picker → base64 → байты → supabase.storage.upload.
import * as ImagePicker from "expo-image-picker";
import { currentUserId } from "./auth";
import { supabase } from "./supabase";

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const LOOKUP = (() => { const u = new Uint8Array(256); for (let i = 0; i < B64.length; i++) u[B64.charCodeAt(i)] = i; return u; })();

function decodeBase64(input: string): Uint8Array {
  const len = input.length;
  let out = Math.floor(len * 0.75);
  if (input[len - 1] === "=") out--;
  if (input[len - 2] === "=") out--;
  const bytes = new Uint8Array(out);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e1 = LOOKUP[input.charCodeAt(i)];
    const e2 = LOOKUP[input.charCodeAt(i + 1)];
    const e3 = LOOKUP[input.charCodeAt(i + 2)];
    const e4 = LOOKUP[input.charCodeAt(i + 3)];
    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < out) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < out) bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

type Picked = { base64: string; mime: string; ext: string };

async function pick(): Promise<Picked | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Нет доступа к галерее. Разрешите доступ к фото.");
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    base64: true,
  });
  if (res.canceled || !res.assets?.[0]?.base64) return null;
  const a = res.assets[0];
  const ext = (a.uri.split(".").pop() || "jpg").toLowerCase() === "png" ? "png" : "jpg";
  return { base64: a.base64!, mime: a.mimeType ?? (ext === "png" ? "image/png" : "image/jpeg"), ext };
}

/** Выбрать фото и загрузить в бакет. Возвращает { path, url } или null (отмена). */
export async function uploadImage(bucket: string): Promise<{ path: string; url: string } | null> {
  const picked = await pick();
  if (!picked) return null;
  const uid = await currentUserId();
  if (!uid) throw new Error("Требуется вход в аккаунт.");
  const path = `${uid}/${Date.now()}.${picked.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, decodeBase64(picked.base64), {
    contentType: picked.mime,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}
