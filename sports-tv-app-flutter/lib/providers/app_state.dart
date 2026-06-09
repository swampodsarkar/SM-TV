import 'dart:async';
import 'package:flutter/material.dart';
import '../models/channel.dart';
import '../models/live_event.dart';
import '../services/api_service.dart';
import '../services/firebase_service.dart';
import '../services/storage_service.dart';

class AppState extends ChangeNotifier {
  List<Channel> _allChannels = [];
  List<Channel> _filteredChannels = [];
  List<LiveEvent> _events = [];
  final List<LiveEvent> _defaultEvents = _createDefaultEvents();
  Set<String> _favorites = {};
  List<Map<String, dynamic>> _history = [];
  String _language = 'en';
  String _theme = 'cyan';
  String _playerEngine = 'HlsJS';
  String _bufferMode = 'medium';
  bool _autoPlay = true;
  bool _offlineCache = true;
  bool _isAdmin = false;
  bool _isGuest = false;
  String? _guestId;
  String? _customM3U;
  Channel? _currentChannel;
  int _selectedTab = 0;
  bool _loading = true;
  String _sportFilter = 'all';
  String _statusFilter = 'all';
  String _categoryFilter = 'All Channels';
  String _searchQuery = '';
  String _appToast = '';
  Timer? _toastTimer;
  bool _showSplash = true;
  bool _showAdWall = false;
  int _adCountdown = 15;
  Channel? _pendingChannel;
  bool _multiScreenActive = false;
  int _multiScreenCount = 2;
  List<Channel?> _gridChannels = [null, null, null, null];
  int _activeGridIndex = 0;
  String? _editingEventId;
  int? _latencyResult;
  String _adminEmailInput = '';
  String _adminPassInput = '';
  String _imgbbKey = '213fd215f712156cc6a6ab529469da2f';
  List<Channel>? _pickerChannels;
  bool _isVoiceSearching = false;
  String? _hoveredChannelId;
  StreamSubscription? _eventsSub;
  final Map<String, String> _loadedFlagUrls = {};

  static List<LiveEvent> _createDefaultEvents() {
    return [
      LiveEvent(id: 'fwc-1', type: 'football', team1: 'Brazil', team1Flag: '🇧🇷', team2: 'Argentina', team2Flag: '🇦🇷', score1: '1', score2: '0', status: 'live', statusText: "32' First Half", tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-2'),
      LiveEvent(id: 'fwc-2', type: 'football', team1: 'Germany', team1Flag: '🇩🇪', team2: 'France', team2Flag: '🇫🇷', score1: '2', score2: '2', status: 'live', statusText: "58' Second Half", tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-3'),
      LiveEvent(id: 'fwc-3', type: 'football', team1: 'England', team1Flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team2: 'Spain', team2Flag: '🇪🇸', score1: '0', score2: '1', status: 'live', statusText: "74' Second Half", tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-4'),
      LiveEvent(id: 'fwc-4', type: 'football', team1: 'Portugal', team1Flag: '🇵🇹', team2: 'Netherlands', team2Flag: '🇳🇱', score1: '3', score2: '1', status: 'live', statusText: "89' Second Half", tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-5'),
      LiveEvent(id: 'fwc-5', type: 'football', team1: 'Italy', team1Flag: '🇮🇹', team2: 'Belgium', team2Flag: '🇧🇪', score1: '0', score2: '0', status: 'upcoming', statusText: 'Starts in 15 min', tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-6'),
      LiveEvent(id: 'fwc-6', type: 'football', team1: 'Croatia', team1Flag: '🇭🇷', team2: 'Morocco', team2Flag: '🇲🇦', score1: '0', score2: '0', status: 'upcoming', statusText: 'Starts in 45 min', tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-7'),
      LiveEvent(id: 'fwc-7', type: 'football', team1: 'Japan', team1Flag: '🇯🇵', team2: 'South Korea', team2Flag: '🇰🇷', score1: '0', score2: '0', status: 'upcoming', statusText: 'Starts in 1h 30m', tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-8'),
      LiveEvent(id: 'fwc-8', type: 'football', team1: 'USA', team1Flag: '🇺🇸', team2: 'Mexico', team2Flag: '🇲🇽', score1: '0', score2: '0', status: 'upcoming', statusText: 'Starts in 2h', tournament: 'FIFA World Cup 2026', channelId: 'footballworldcup2026-9'),
    ];
  }

  // Getters
  List<Channel> get channels => _allChannels;
  List<Channel> get filteredChannels => _filteredChannels;
  List<LiveEvent> get events =>
      _events.isNotEmpty ? _events : _defaultEvents;
  Set<String> get favorites => _favorites;
  List<Map<String, dynamic>> get history => _history;
  String get language => _language;
  String get theme => _theme;
  String get playerEngine => _playerEngine;
  String get bufferMode => _bufferMode;
  bool get autoPlay => _autoPlay;
  bool get offlineCache => _offlineCache;
  bool get isAdmin => _isAdmin;
  bool get isGuest => _isGuest;
  String? get guestId => _guestId;
  String? get customM3U => _customM3U;
  Channel? get currentChannel => _currentChannel;
  int get selectedTab => _selectedTab;
  bool get loading => _loading;
  String get sportFilter => _sportFilter;
  String get statusFilter => _statusFilter;
  String get categoryFilter => _categoryFilter;
  String get searchQuery => _searchQuery;
  String get appToast => _appToast;
  bool get showSplash => _showSplash;
  bool get showAdWall => _showAdWall;
  int get adCountdown => _adCountdown;
  Channel? get pendingChannel => _pendingChannel;
  bool get multiScreenActive => _multiScreenActive;
  int get multiScreenCount => _multiScreenCount;
  List<Channel?> get gridChannels => _gridChannels;
  int get activeGridIndex => _activeGridIndex;
  String? get editingEventId => _editingEventId;
  int? get latencyResult => _latencyResult;
  String get adminEmailInput => _adminEmailInput;
  String get adminPassInput => _adminPassInput;
  String get imgbbKey => _imgbbKey;
  List<Channel>? get pickerChannels => _pickerChannels;
  bool get isVoiceSearching => _isVoiceSearching;
  String? get hoveredChannelId => _hoveredChannelId;
  Map<String, String> get loadedFlagUrls => _loadedFlagUrls;

  List<Channel> get trendingChannels {
    return _allChannels
        .where((c) =>
            c.group.toLowerCase().contains('football') ||
            c.group.toLowerCase().contains('world cup'))
        .take(12)
        .toList();
  }

  List<LiveEvent> get filteredEvents {
    var list = events;
    if (_sportFilter != 'all') {
      list = list.where((e) => e.type == _sportFilter).toList();
    }
    if (_statusFilter != 'all') {
      list = list.where((e) => e.status == _statusFilter).toList();
    }
    return list;
  }

  List<String> get categories {
    return [
      'All Channels',
      'News & Info',
      'Sports Live',
      'Movies Channel',
      'Kids TV',
      'Music Beat',
      'Religious'
    ];
  }

  int getMatchCount(String filterId) {
    if (filterId == 'All') return events.length;
    return events.where((e) => e.status == filterId.toLowerCase()).length;
  }

  Future<void> initialize() async {
    _language = await StorageService.getLanguage();
    _theme = await StorageService.getTheme();
    _playerEngine = await StorageService.getPlayerEngine();
    _bufferMode = await StorageService.getBufferMode();
    _autoPlay = await StorageService.getAutoPlay();
    _offlineCache = await StorageService.getOfflineCache();
    _isAdmin = await StorageService.isAdmin();
    _isGuest = await StorageService.isGuest();
    _guestId = await StorageService.getGuestId();
    _customM3U = await StorageService.getCustomM3U();
    _favorites = await StorageService.getFavorites();
    _history = await StorageService.getHistory();
    _imgbbKey = await StorageService.getImgbbKey();
    _latencyResult = (await StorageService.getLastAdWatch()) % 300;

    _eventsSub = FirebaseService.listenEvents().listen((events) {
      _events = events;
      notifyListeners();
    });

    await loadChannels();

    Future.delayed(const Duration(milliseconds: 500), () {
      _showSplash = false;
      notifyListeners();
    });

    _loading = false;
    notifyListeners();
  }

  Future<void> loadChannels() async {
    _loading = true;
    notifyListeners();
    try {
      final channels = await ApiService.fetchChannels(customM3U: _customM3U);
      _allChannels = channels;
      _applyFilters();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  void setSelectedTab(int index) {
    _selectedTab = index;
    notifyListeners();
  }

  void setCurrentChannel(Channel? channel) {
    _currentChannel = channel;
    if (channel != null) {
      addHistoryEntry({
        'channelId': channel.id,
        'channelName': channel.name,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
    }
    notifyListeners();
  }

  void setSportFilter(String filter) {
    _sportFilter = filter;
    notifyListeners();
  }

  void setStatusFilter(String filter) {
    _statusFilter = filter;
    notifyListeners();
  }

  void setCategoryFilter(String filter) {
    _categoryFilter = filter;
    _applyFilters();
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFilters();
    notifyListeners();
  }

  void _applyFilters() {
    var list = _allChannels;

    if (_searchQuery.isNotEmpty) {
      list = list
          .where((c) =>
              c.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              c.group.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }

    if (_categoryFilter != 'All Channels') {
      final catLower = _categoryFilter.toLowerCase();
      list = list.where((c) {
        final g = c.group.toLowerCase();
        if (catLower.contains('news')) return g.contains('news') || g.contains('info');
        if (catLower.contains('sports')) return g.contains('sport') || g.contains('t-sports') || g.contains('gazi');
        if (catLower.contains('movies')) return g.contains('movie') || g.contains('cinema') || g.contains('action') || g.contains('chomok');
        if (catLower.contains('kids')) return g.contains('kid') || g.contains('cartoon') || g.contains('zoo moo');
        if (catLower.contains('music')) return g.contains('music') || g.contains('song') || g.contains('sangeet');
        if (catLower.contains('religious')) return g.contains('islam') || g.contains('makkah') || g.contains('madinah') || g.contains('religion') || g.contains('peace tv');
        return g.contains(catLower);
      }).toList();
    }

    _filteredChannels = list;
  }

  void selectGridChannel(int gridIndex, Channel channel) {
    _gridChannels[gridIndex] = channel;
    notifyListeners();
  }

  void clearGridSlot(int gridIndex) {
    _gridChannels[gridIndex] = null;
    notifyListeners();
  }

  void setActiveGridIndex(int index) {
    _activeGridIndex = index;
    notifyListeners();
  }

  void setMultiScreenActive(bool value) {
    _multiScreenActive = value;
    if (value) {
      _gridChannels = [_currentChannel, null, null, null];
    }
    notifyListeners();
  }

  void setMultiScreenCount(int count) {
    _multiScreenCount = count;
    notifyListeners();
  }

  void setPickerChannels(List<Channel>? channels) {
    _pickerChannels = channels;
    notifyListeners();
  }

  void setEditingEventId(String? id) {
    _editingEventId = id;
    notifyListeners();
  }

  void setAdminEmailInput(String v) {
    _adminEmailInput = v;
    notifyListeners();
  }

  void setAdminPassInput(String v) {
    _adminPassInput = v;
    notifyListeners();
  }

  void setImgbbKey(String key) {
    _imgbbKey = key;
    StorageService.setImgbbKey(key);
    notifyListeners();
  }

  void setFlagUrl(String team, String url) {
    _loadedFlagUrls[team] = url;
    notifyListeners();
  }

  void setHoveredChannelId(String? id) {
    _hoveredChannelId = id;
    notifyListeners();
  }

  void triggerToast(String msg) {
    _appToast = msg;
    _toastTimer?.cancel();
    _toastTimer = Timer(const Duration(seconds: 2), () {
      _appToast = '';
      notifyListeners();
    });
    notifyListeners();
  }

  Future<void> toggleFavorite(String channelId) async {
    await StorageService.toggleFavorite(channelId);
    _favorites = await StorageService.getFavorites();
    triggerToast(
        _favorites.contains(channelId) ? 'Added to favorites!' : 'Removed from favorites');
    notifyListeners();
  }

  Future<void> addHistoryEntry(Map<String, dynamic> entry) async {
    await StorageService.addHistoryEntry(entry);
    _history = await StorageService.getHistory();
    notifyListeners();
  }

  Future<void> clearHistory() async {
    await StorageService.clearHistory();
    _history = [];
    triggerToast('History cleared');
    notifyListeners();
  }

  Future<void> removeHistoryEntry(String channelId) async {
    await StorageService.removeHistoryEntry(channelId);
    _history = await StorageService.getHistory();
    notifyListeners();
  }

  Future<void> setLanguage(String lang) async {
    _language = lang;
    await StorageService.setLanguage(lang);
    notifyListeners();
  }

  Future<void> setTheme(String theme) async {
    _theme = theme;
    await StorageService.setTheme(theme);
    notifyListeners();
  }

  Future<void> setPlayerEngine(String engine) async {
    _playerEngine = engine;
    await StorageService.setPlayerEngine(engine);
    triggerToast('Engine: $engine');
    notifyListeners();
  }

  Future<void> setBufferMode(String mode) async {
    _bufferMode = mode;
    await StorageService.setBufferMode(mode);
    notifyListeners();
  }

  Future<void> setAutoPlay(bool value) async {
    _autoPlay = value;
    await StorageService.setAutoPlay(value);
    triggerToast(value ? 'Auto-play ON' : 'Auto-play OFF');
    notifyListeners();
  }

  Future<void> setOfflineCache(bool value) async {
    _offlineCache = value;
    await StorageService.setOfflineCache(value);
    notifyListeners();
  }

  Future<void> adminLogin() async {
    if (_adminEmailInput == 'mdswampodsarkar@gmail.com' &&
        _adminPassInput == '123456') {
      _isAdmin = true;
      await StorageService.setAdmin(true);
      triggerToast('Admin logged in!');
    } else {
      triggerToast('Invalid admin credentials!');
    }
    notifyListeners();
  }

  Future<void> adminLogout() async {
    _isAdmin = false;
    await StorageService.setAdmin(false);
    triggerToast('Admin logged out');
    notifyListeners();
  }

  Future<void> guestLogin() async {
    _isGuest = true;
    _guestId = 'guest_${DateTime.now().millisecondsSinceEpoch}';
    await StorageService.setGuest(true);
    await StorageService.setGuestId(_guestId!);
    notifyListeners();
  }

  Future<void> setCustomM3U(String m3u) async {
    _customM3U = m3u;
    await StorageService.setCustomM3U(m3u);
    notifyListeners();
  }

  Future<void> clearCustomM3U() async {
    _customM3U = null;
    await StorageService.clearCustomM3U();
    notifyListeners();
  }

  Future<void> resetAll() async {
    await StorageService.resetAll();
    _favorites = {};
    _history = [];
    _language = 'en';
    _theme = 'cyan';
    _playerEngine = 'HlsJS';
    _bufferMode = 'medium';
    _autoPlay = true;
    _offlineCache = true;
    _isAdmin = false;
    _isGuest = false;
    _guestId = null;
    _customM3U = null;
    triggerToast('Data reset successfully');
    await loadChannels();
    notifyListeners();
  }

  void checkAdWall(Channel channel) {
    final now = DateTime.now().millisecondsSinceEpoch;
    StorageService.getLastAdWatch().then((lastAd) {
      if (now - lastAd > 3600000) {
        _pendingChannel = channel;
        _showAdWall = true;
        _adCountdown = 15;
        notifyListeners();
      } else {
        setCurrentChannel(channel);
      }
    });
  }

  void dismissAdWall() {
    _showAdWall = false;
    StorageService.setLastAdWatch(DateTime.now().millisecondsSinceEpoch);
    if (_pendingChannel != null) {
      setCurrentChannel(_pendingChannel);
      _pendingChannel = null;
    }
    notifyListeners();
  }

  void tickAdCountdown() {
    if (_adCountdown > 0) {
      _adCountdown--;
      if (_adCountdown <= 0) {
        dismissAdWall();
      }
      notifyListeners();
    }
  }

  void setVoiceSearching(bool v) {
    _isVoiceSearching = v;
    notifyListeners();
  }

  void setLatencyResult(int ms) {
    _latencyResult = ms;
    notifyListeners();
  }

  void handlePrevChannel() {
    if (_filteredChannels.isEmpty || _currentChannel == null) return;
    final idx = _filteredChannels.indexWhere((c) => c.id == _currentChannel!.id);
    if (idx > 0) {
      checkAdWall(_filteredChannels[idx - 1]);
    } else {
      checkAdWall(_filteredChannels.last);
    }
  }

  void handleNextChannel() {
    if (_filteredChannels.isEmpty || _currentChannel == null) return;
    final idx = _filteredChannels.indexWhere((c) => c.id == _currentChannel!.id);
    if (idx < _filteredChannels.length - 1) {
      checkAdWall(_filteredChannels[idx + 1]);
    } else {
      checkAdWall(_filteredChannels.first);
    }
  }

  @override
  void dispose() {
    _eventsSub?.cancel();
    _toastTimer?.cancel();
    super.dispose();
  }
}
