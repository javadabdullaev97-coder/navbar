// Определение языка устройства при первом запуске (CLAUDE.md §12).
// en / ru / uz — поддерживаемые; любой другой язык устройства → en.
import { getLocales } from "expo-localization";
import type { Lang } from "./store";

const SUPPORTED: Lang[] = ["ru", "uz", "en"];

/** Язык устройства, сведённый к поддерживаемому (иначе English). */
export function detectDeviceLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase();
    if (code && (SUPPORTED as string[]).includes(code)) return code as Lang;
  } catch {
    /* getLocales может бросить в редких окружениях — падаем на en */
  }
  return "en";
}
