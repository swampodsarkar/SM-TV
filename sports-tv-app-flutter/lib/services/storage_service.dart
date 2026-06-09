import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const _favoritesKey = 'toffee_favorites';
  static const _historyKey = 'toffee_history';
  static const _languageKey = 'toffee_lang';
  static const _themeKey = 'toffee_accent';
  static const _playerEngineKey = 'toffee_engine';
  static const _bufferModeKey = 'toffee_buffer';
  static const _autoPlayKey = 'toffee_autoplay';
  static const _offlineCacheKey = 'toffee_offline';
  static const _adminKey = 'toffee_admin';
  static const _guestKey = 'toffee_guest';
  static const _guestIdKey = 'guest_id';
  static const _customM3uKey = 'toffee_custom_m3u';
  static const _backupUrlKey = 'toffee_backup_url';
  static const _adWatchKey = 'sm_ad_watch';
  static const _imgbbKey = 'toffee_imgbb_key';

  static Future<SharedPreferences> get _prefs =>
      SharedPreferences.getInstance();

  static Future<Set<String>> getFavorites() async {
    final prefs = await _prefs;
    return prefs.getStringList(_favoritesKey)?.toSet() ?? {};
  }

  static Future<void> toggleFavorite(String channelId) async {
    final prefs = await _prefs;
    final favorites = prefs.getStringList(_favoritesKey) ?? [];
    if (favorites.contains(channelId)) {
      favorites.remove(channelId);
    } else {
      favorites.add(channelId);
    }
    await prefs.setStringList(_favoritesKey, favorites);
  }

  static Future<List<Map<String, dynamic>>> getHistory() async {
    final prefs = await _prefs;
    final data = prefs.getString(_historyKey);
    if (data == null) return [];
    final list = json.decode(data) as List;
    return list.map((e) => Map<String, dynamic>.from(e)).toList();
  }

  static Future<void> addHistoryEntry(Map<String, dynamic> entry) async {
    final prefs = await _prefs;
    final history = await getHistory();
    history.insert(0, entry);
    if (history.length > 20) history.removeLast();
    await prefs.setString(_historyKey, json.encode(history));
  }

  static Future<void> clearHistory() async {
    final prefs = await _prefs;
    await prefs.remove(_historyKey);
  }

  static Future<void> removeHistoryEntry(String channelId) async {
    final prefs = await _prefs;
    final history = await getHistory();
    history.removeWhere((h) => h['channelId'] == channelId);
    await prefs.setString(_historyKey, json.encode(history));
  }

  static Future<String> getLanguage() async {
    final prefs = await _prefs;
    return prefs.getString(_languageKey) ?? 'en';
  }

  static Future<void> setLanguage(String lang) async {
    final prefs = await _prefs;
    await prefs.setString(_languageKey, lang);
  }

  static Future<String> getTheme() async {
    final prefs = await _prefs;
    return prefs.getString(_themeKey) ?? 'cyan';
  }

  static Future<void> setTheme(String theme) async {
    final prefs = await _prefs;
    await prefs.setString(_themeKey, theme);
  }

  static Future<String> getPlayerEngine() async {
    final prefs = await _prefs;
    return prefs.getString(_playerEngineKey) ?? 'HlsJS';
  }

  static Future<void> setPlayerEngine(String engine) async {
    final prefs = await _prefs;
    await prefs.setString(_playerEngineKey, engine);
  }

  static Future<String> getBufferMode() async {
    final prefs = await _prefs;
    return prefs.getString(_bufferModeKey) ?? 'medium';
  }

  static Future<void> setBufferMode(String mode) async {
    final prefs = await _prefs;
    await prefs.setString(_bufferModeKey, mode);
  }

  static Future<bool> getAutoPlay() async {
    final prefs = await _prefs;
    return prefs.getBool(_autoPlayKey) ?? true;
  }

  static Future<void> setAutoPlay(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_autoPlayKey, value);
  }

  static Future<bool> getOfflineCache() async {
    final prefs = await _prefs;
    return prefs.getBool(_offlineCacheKey) ?? true;
  }

  static Future<void> setOfflineCache(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_offlineCacheKey, value);
  }

  static Future<bool> isAdmin() async {
    final prefs = await _prefs;
    return prefs.getBool(_adminKey) ?? false;
  }

  static Future<void> setAdmin(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_adminKey, value);
  }

  static Future<bool> isGuest() async {
    final prefs = await _prefs;
    return prefs.getBool(_guestKey) ?? false;
  }

  static Future<void> setGuest(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool(_guestKey, value);
  }

  static Future<String?> getGuestId() async {
    final prefs = await _prefs;
    return prefs.getString(_guestIdKey);
  }

  static Future<void> setGuestId(String id) async {
    final prefs = await _prefs;
    await prefs.setString(_guestIdKey, id);
  }

  static Future<String?> getCustomM3U() async {
    final prefs = await _prefs;
    return prefs.getString(_customM3uKey);
  }

  static Future<void> setCustomM3U(String m3u) async {
    final prefs = await _prefs;
    await prefs.setString(_customM3uKey, m3u);
  }

  static Future<void> clearCustomM3U() async {
    final prefs = await _prefs;
    await prefs.remove(_customM3uKey);
  }

  static Future<String?> getBackupUrl() async {
    final prefs = await _prefs;
    return prefs.getString(_backupUrlKey);
  }

  static Future<void> setBackupUrl(String url) async {
    final prefs = await _prefs;
    await prefs.setString(_backupUrlKey, url);
  }

  static Future<int> getLastAdWatch() async {
    final prefs = await _prefs;
    return prefs.getInt(_adWatchKey) ?? 0;
  }

  static Future<void> setLastAdWatch(int time) async {
    final prefs = await _prefs;
    await prefs.setInt(_adWatchKey, time);
  }

  static Future<String> getImgbbKey() async {
    final prefs = await _prefs;
    return prefs.getString(_imgbbKey) ?? '213fd215f712156cc6a6ab529469da2f';
  }

  static Future<void> setImgbbKey(String key) async {
    final prefs = await _prefs;
    await prefs.setString(_imgbbKey, key);
  }

  static Future<void> resetAll() async {
    final prefs = await _prefs;
    await prefs.clear();
  }
}
