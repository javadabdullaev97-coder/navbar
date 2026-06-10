import 'package:shared_preferences/shared_preferences.dart';

// Локальное состояние онбординга и профиля. После подключения Supabase
// здесь останется только кэш сессии, источником правды станет БД.
class AppState {
  AppState._();
  static final AppState instance = AppState._();

  late SharedPreferences _prefs;

  bool onboarded = false;
  String role = ''; // 'master' | 'client'
  String phone = '';
  String name = '';
  String specialization = '';
  String address = '';
  String slug = '';
  bool isPro = false;
  List<String> interests = []; // категории, интересные клиенту
  String lang = 'ru'; // 'ru' | 'uz' | 'en' | 'es'

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    onboarded = _prefs.getBool('onboarded') ?? false;
    role = _prefs.getString('role') ?? '';
    phone = _prefs.getString('phone') ?? '';
    name = _prefs.getString('name') ?? '';
    specialization = _prefs.getString('specialization') ?? '';
    address = _prefs.getString('address') ?? '';
    slug = _prefs.getString('slug') ?? '';
    isPro = _prefs.getBool('isPro') ?? false;
    interests = _prefs.getStringList('interests') ?? [];
    lang = _prefs.getString('lang') ?? 'ru';
  }

  Future<void> save() async {
    await _prefs.setBool('onboarded', onboarded);
    await _prefs.setString('role', role);
    await _prefs.setString('phone', phone);
    await _prefs.setString('name', name);
    await _prefs.setString('specialization', specialization);
    await _prefs.setString('address', address);
    await _prefs.setString('slug', slug);
    await _prefs.setBool('isPro', isPro);
    await _prefs.setStringList('interests', interests);
    await _prefs.setString('lang', lang);
  }

  Future<void> reset() async {
    await _prefs.clear();
    onboarded = false;
    role = '';
    phone = '';
    name = '';
    specialization = '';
    address = '';
    slug = '';
    isPro = false;
    interests = [];
    lang = 'ru';
  }
}
