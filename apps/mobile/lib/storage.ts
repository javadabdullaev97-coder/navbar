// Загрузка изображений/документов в Supabase Storage из Expo (без нативных билдов).
// Фото: expo-image-picker (PHPicker — на iOS разрешение не нужно).
// Документы: expo-document-picker (PDF/Word/любой файл) + expo-file-system → байты.
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { currentUserId } from "./auth";
import { supabase } from "./supabase";

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const LOOKUP = (() => { const u = new Uint8Array(256); for (let i = 0; i < B64.length; i++) u[B64.charCodeAt(i)] = i; return u; })();

function decodeBase64(input: string): Uint8Array {
  const clean = input.replace(/[^A-Za-z0-9+/=]/g, "");
  const len = clean.length;
  let out = Math.floor(len * 0.75);
  if (clean[len - 1] === "=") out--;
  if (clean[len - 2] === "=") out--;
  const bytes = new Uint8Array(out);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e1 = LOOKUP[clean.charCodeAt(i)];
    const e2 = LOOKUP[clean.charCodeAt(i + 1)];
    const e3 = LOOKUP[clean.charCodeAt(i + 2)];
    const e4 = LOOKUP[clean.charCodeAt(i + 3)];
    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < out) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < out) bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

type Picked = { base64: string; mime: string; ext: string };

async function pick(square: boolean): Promise<Picked | null> {
  // На iOS системный PHPicker разрешений не требует, поэтому не запрашиваем заранее
  // (иначе при отказе получали ошибку вместо самого выбора фото).
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: square,          // квадратная обрезка для аватара/портфолио
    aspect: square ? [1, 1] : undefined,
    quality: 0.7,
    base64: true,
  });
  if (res.canceled || !res.assets?.[0]?.base64) return null;
  const a = res.assets[0];
  const ext = (a.uri.split(".").pop() || "jpg").toLowerCase() === "png" ? "png" : "jpg";
  return { base64: a.base64!, mime: a.mimeType ?? (ext === "png" ? "image/png" : "image/jpeg"), ext };
}

async function put(bucket: string, ext: string, mime: string, bytes: Uint8Array): Promise<{ path: string; url: string }> {
  const uid = await currentUserId();
  if (!uid) throw new Error("Требуется вход в аккаунт.");
  const path = `${uid}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType: mime, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** Выбрать фото из галереи и загрузить. Аватар/портфолио режем квадратом. */
export async function uploadImage(bucket: string): Promise<{ path: string; url: string } | null> {
  const square = bucket === "avatars" || bucket === "portfolio";
  const picked = await pick(square);
  if (!picked) return null;
  return put(bucket, picked.ext, picked.mime, decodeBase64(picked.base64));
}

/** Выбрать документ (PDF/Word/изображение — любой файл) и загрузить. */
export async function uploadDocument(bucket: string): Promise<{ path: string; url: string } | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  const b64 = await FileSystem.readAsStringAsync(a.uri, { encoding: "base64" });
  const ext = (a.name?.split(".").pop() || "bin").toLowerCase();
  return put(bucket, ext, a.mimeType ?? "application/octet-stream", decodeBase64(b64));
}

/** Диплом/сертификат: спросить источник — галерея или файлы — и загрузить. */
export function chooseDiploma(
  bucket: string,
  t: (k: string) => string,
): Promise<{ path: string; url: string } | null> {
  return new Promise((resolve, reject) => {
    Alert.alert(t("Загрузить документ"), t("Откуда выбрать файл?"), [
      { text: t("Из галереи"), onPress: () => uploadImage(bucket).then(resolve, reject) },
      { text: t("Из файлов"), onPress: () => uploadDocument(bucket).then(resolve, reject) },
      { text: t("Отмена"), style: "cancel", onPress: () => resolve(null) },
    ]);
  });
}
