import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/app_state.dart';
import 'config/theme.dart';
import 'translations/app_translations.dart';
import 'screens/home_tab.dart';
import 'screens/live_tv_tab.dart';
import 'screens/history_tab.dart';
import 'screens/profile_tab.dart';
import 'screens/settings_tab.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: 'AIzaSyDemoKey',
        appId: '1:123456789:web:abc123',
        messagingSenderId: '123456789',
        projectId: 'minerx-market',
        authDomain: 'minerx-market.firebaseapp.com',
        databaseURL: 'https://minerx-market-default-rtdb.firebaseio.com',
        storageBucket: 'minerx-market.firebasestorage.app',
      ),
    );
  } catch (_) {}
  runApp(const SmTvApp());
}

class SmTvApp extends StatelessWidget {
  const SmTvApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState()..initialize(),
      child: Consumer<AppState>(
        builder: (context, state, _) {
          return MaterialApp(
            title: 'SM TV',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.darkTheme(
              AppTheme.accentFromName(state.theme),
            ),
            home: const MainShell(),
          );
        },
      ),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with TickerProviderStateMixin {
  Timer? _adTimer;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _adTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _startAdCountdown(AppState state) {
    _adTimer?.cancel();
    _adTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      state.tickAdCountdown();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final lang = state.language;
    final theme = Theme.of(context);

    return Stack(
      children: [
        // Main scaffold
        Scaffold(
          backgroundColor: AppTheme.bgDark,
          body: Stack(
            children: [
              // Ambient glow
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 500,
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment.topCenter,
                      radius: 1.5,
                      colors: [
                        theme.colorScheme.primary.withValues(alpha: 0.08),
                        AppTheme.bgDark,
                      ],
                    ),
                  ),
                ),
              ),

              // Main content
              Column(
                children: [
                  // Header
                  _buildHeader(state, theme, lang),

                  // Update banner
                  _buildUpdateBanner(theme, lang),

                  // Tab content
                  Expanded(
                    child: IndexedStack(
                      index: state.selectedTab >= 0 && state.selectedTab < 5
                          ? state.selectedTab
                          : 0,
                      children: const [
                        HomeTab(),
                        LiveTvTab(),
                        HistoryTab(),
                        ProfileTab(),
                        SettingsTab(),
                      ],
                    ),
                  ),
                ],
              ),

              // Mini player
              if (state.currentChannel != null && state.selectedTab != 1)
                Positioned(
                  bottom: 80,
                  right: 16,
                  left: 16,
                  child: _buildMiniPlayer(state, theme, lang),
                ),
            ],
          ),

          // Bottom navigation
          bottomNavigationBar: _buildBottomNav(state, theme, lang),
        ),

        // Splash screen
        if (state.showSplash) _buildSplash(theme),

        // Ad wall overlay
        if (state.showAdWall)
          _buildAdWall(state, theme, lang),

        // Voice search modal
        if (state.isVoiceSearching)
          _buildVoiceSearch(state, theme, lang),

        // Toast notification
        if (state.appToast.isNotEmpty)
          _buildToast(state, theme),

        // Channel picker modal
        if (state.pickerChannels != null)
          _buildChannelPicker(state, theme, lang),
      ],
    );
  }

  Widget _buildHeader(AppState state, ThemeData theme, String lang) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 48, 16, 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
      ),
      child: Row(
        children: [
          // Logo
          GestureDetector(
            onTap: () {
              // 7-tap admin trigger
            },
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        theme.colorScheme.primary,
                        theme.colorScheme.primary.withValues(alpha: 0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.tv, size: 18, color: Color(0xFF0A0E1A)),
                ),
                const SizedBox(width: 8),
                Text(
                  '${AppTranslations.t(lang, 'app.name')} ',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
                Text(
                  AppTranslations.t(lang, 'app.badge'),
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          // Bell
          _headerBtn(Icons.notifications_outlined, theme, () {}),
          // Star
          _headerBtn(Icons.star_border, theme, () {}),
          // Refresh
          _headerBtn(
            state.loading ? Icons.sync : Icons.refresh,
            theme,
            () => state.loadChannels(),
          ),
          // Search
          _headerBtn(Icons.search, theme, () {
            state.setSelectedTab(1);
          }),
        ],
      ),
    );
  }

  Widget _headerBtn(IconData icon, ThemeData theme, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(left: 2),
      child: IconButton(
        icon: Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
        onPressed: onTap,
        splashRadius: 20,
      ),
    );
  }

  Widget _buildUpdateBanner(ThemeData theme, String lang) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            theme.colorScheme.primary.withValues(alpha: 0.05),
            const Color(0xFF1E293B).withValues(alpha: 0.4),
            theme.colorScheme.primary.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.bolt,
                size: 14, color: theme.colorScheme.primary),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                text: '${AppTranslations.t(lang, 'update.banner')} ',
                style: const TextStyle(
                    color: Color(0xFFE2E8F0),
                    fontWeight: FontWeight.bold,
                    fontSize: 11),
                children: [
                  TextSpan(
                    text: AppTranslations.t(lang, 'update.badge'),
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                  TextSpan(
                    text: ' — ${AppTranslations.t(lang, 'update.desc')}',
                    style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.normal,
                        fontSize: 10),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: theme.colorScheme.primary.withValues(alpha: 0.2),
              ),
            ),
            child: Text(
              AppTranslations.t(lang, 'update.btn'),
              style: TextStyle(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w900,
                fontSize: 9,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav(AppState state, ThemeData theme, String lang) {
    final items = [
      {'icon': Icons.home, 'label': AppTranslations.t(lang, 'nav.home'), 'id': 0},
      {'icon': Icons.live_tv, 'label': AppTranslations.t(lang, 'nav.livetv'), 'id': 1},
      {'icon': Icons.history, 'label': AppTranslations.t(lang, 'nav.history'), 'id': 2},
      {'icon': Icons.person, 'label': AppTranslations.t(lang, 'nav.profile'), 'id': 3},
      {'icon': Icons.settings, 'label': AppTranslations.t(lang, 'nav.profile'), 'id': 4},
    ];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: items.asMap().entries.map((entry) {
          final i = entry.value;
          final idx = entry.key;
          final isSelected = state.selectedTab == idx;
          return Expanded(
            child: GestureDetector(
              onTap: () => state.setSelectedTab(idx),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      i['icon'] as IconData,
                      size: 18,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : const Color(0xFF64748B),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      i['label'] as String,
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: isSelected
                            ? theme.colorScheme.primary
                            : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSplash(ThemeData theme) {
    return Container(
      color: AppTheme.bgDark,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.primary.withValues(alpha: 0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: theme.colorScheme.primary.withValues(alpha: 0.3),
                    blurRadius: 30,
                  ),
                ],
              ),
              child: const Icon(Icons.tv, size: 40, color: Color(0xFF0A0E1A)),
            ),
            const SizedBox(height: 20),
            const Text(
              'SM TV',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'LIVE IPTV & SPORTS',
              style: TextStyle(
                fontSize: 10,
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.w900,
                letterSpacing: 3,
              ),
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) {
                return Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: AnimatedBuilder(
                    animation: _pulseController,
                    builder: (_, child) {
                      return Transform.scale(
                        scale: 1.0 -
                            (_pulseController.value * 0.5) +
                            (i * 0.15),
                        child: child,
                      );
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdWall(AppState state, ThemeData theme, String lang) {
    if (state.showAdWall) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startAdCountdown(state);
      });
    }
    return Container(
      color: AppTheme.bgDark.withValues(alpha: 0.95),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('📺', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 16),
            Text(
              AppTranslations.t(lang, 'ad.title'),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              AppTranslations.t(lang, 'ad.desc'),
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  '${state.adCountdown}',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  AppTranslations.t(lang, 'ad.seconds'),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                AppTranslations.t(lang, 'ad.hint'),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 10,
                  color: Color(0xFF475569),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVoiceSearch(AppState state, ThemeData theme, String lang) {
    return Container(
      color: Colors.black.withValues(alpha: 0.95),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(
                  color: theme.colorScheme.primary.withValues(alpha: 0.25),
                ),
              ),
              child: Icon(Icons.mic,
                  size: 40,
                  color: theme.colorScheme.primary),
            ),
            const SizedBox(height: 24),
            const Text(
              'Voice Search',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 16,
                color: Color(0xFFF1F5F9),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Say a channel name',
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.symmetric(horizontal: 48),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: const Text(
                '"Sports channel", "News", "Movies"',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFF94A3B8),
                  fontFamily: 'monospace',
                ),
              ),
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: () => state.setVoiceSearching(false),
              child: Text(
                AppTranslations.t(lang, 'search.voice.cancel'),
                style: const TextStyle(color: Color(0xFF94A3B8)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToast(AppState state, ThemeData theme) {
    return Positioned(
      bottom: 100,
      left: 0,
      right: 0,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: theme.colorScheme.primary.withValues(alpha: 0.3),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle,
                  size: 14, color: theme.colorScheme.primary),
              const SizedBox(width: 8),
              Text(
                state.appToast,
                style: TextStyle(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMiniPlayer(AppState state, ThemeData theme, String lang) {
    final channel = state.currentChannel!;
    return GestureDetector(
      onTap: () => state.setSelectedTab(1),
      child: Container(
        height: 64,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B).withValues(alpha: 0.95),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Icon(Icons.play_circle_outline,
                    size: 24, color: theme.colorScheme.primary),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    channel.name,
                    style: const TextStyle(
                      color: Color(0xFFF1F5F9),
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Text(
                    'Now Playing',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, size: 18,
                  color: Color(0xFF94A3B8)),
              onPressed: () => state.setCurrentChannel(null),
              splashRadius: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChannelPicker(
      AppState state, ThemeData theme, String lang) {
    return GestureDetector(
      onTap: () => state.setPickerChannels(null),
      child: Container(
        color: Colors.black54,
        child: Center(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 32),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Select Channel',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                        color: Color(0xFF94A3B8),
                        letterSpacing: 1,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => state.setPickerChannels(null),
                      child: const Icon(Icons.close,
                          size: 16, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ...state.pickerChannels!.map((ch) => Container(
                      margin: const EdgeInsets.only(bottom: 4),
                      child: MaterialButton(
                        onPressed: () {
                          state.checkAdWall(ch);
                          state.setPickerChannels(null);
                          state.setSelectedTab(1);
                        },
                        color: const Color(0xFF0F1525),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        child: Row(
                          children: [
                            Text(
                              ch.name,
                              style: const TextStyle(
                                color: Color(0xFFF1F5F9),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )),
              ],
            ),
          ),
        ),
      ),
    );
  }
}


