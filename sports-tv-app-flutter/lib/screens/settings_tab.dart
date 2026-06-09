import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../translations/app_translations.dart';
import '../config/theme.dart';

class SettingsTab extends StatelessWidget {
  const SettingsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final lang = state.language;
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      child: Column(
        children: [
          // Language
          _SectionCard(
            icon: Icons.language,
            title: AppTranslations.t(lang, 'settings.language'),
            child: Row(
              children: [
                _OptionBtn(
                  label: '🇬🇧  English',
                  selected: state.language == 'en',
                  onTap: () => state.setLanguage('en'),
                  theme: theme,
                ),
                const SizedBox(width: 8),
                _OptionBtn(
                  label: '🇧🇩  বাংলা',
                  selected: state.language == 'bn',
                  onTap: () => state.setLanguage('bn'),
                  theme: theme,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Theme colors
          _SectionCard(
            icon: Icons.palette,
            title: AppTranslations.t(lang, 'settings.theme'),
            child: Row(
              children: [
                _ColorOption(
                  color: AppTheme.primaryCyan,
                  label: AppTranslations.t(lang, 'settings.theme.default'),
                  selected: state.theme == 'cyan',
                  onTap: () => state.setTheme('cyan'),
                ),
                const SizedBox(width: 8),
                _ColorOption(
                  color: AppTheme.primaryEmerald,
                  label: AppTranslations.t(lang, 'settings.theme.emerald'),
                  selected: state.theme == 'emerald',
                  onTap: () => state.setTheme('emerald'),
                ),
                const SizedBox(width: 8),
                _ColorOption(
                  color: AppTheme.primaryTeal,
                  label: AppTranslations.t(lang, 'settings.theme.teal'),
                  selected: state.theme == 'teal',
                  onTap: () => state.setTheme('teal'),
                ),
                const SizedBox(width: 8),
                _ColorOption(
                  color: AppTheme.primaryRose,
                  label: AppTranslations.t(lang, 'settings.theme.rose'),
                  selected: state.theme == 'rose',
                  onTap: () => state.setTheme('rose'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Player engine
          _SectionCard(
            icon: Icons.live_tv,
            title: AppTranslations.t(lang, 'settings.player'),
            child: Column(
              children: [
                _EngineOption(
                  label: 'HlsJS',
                  desc: AppTranslations.t(lang, 'settings.player.hlsjs.desc'),
                  selected: state.playerEngine == 'HlsJS',
                  onTap: () => state.setPlayerEngine('HlsJS'),
                  theme: theme,
                ),
                const SizedBox(height: 6),
                _EngineOption(
                  label: 'NativeHLS',
                  desc:
                      AppTranslations.t(lang, 'settings.player.native.desc'),
                  selected: state.playerEngine == 'NativeHLS',
                  onTap: () => state.setPlayerEngine('NativeHLS'),
                  theme: theme,
                ),
                const SizedBox(height: 6),
                _EngineOption(
                  label: 'VLC',
                  desc: AppTranslations.t(lang, 'settings.player.vlc.desc'),
                  selected: state.playerEngine == 'VLC',
                  onTap: () => state.setPlayerEngine('VLC'),
                  theme: theme,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Buffer
          _SectionCard(
            icon: Icons.speed,
            title: AppTranslations.t(lang, 'settings.buffer'),
            child: Row(
              children: [
                _BufferOption(
                  label: AppTranslations.t(lang, 'settings.buffer.low'),
                  sub: AppTranslations.t(lang, 'settings.buffer.low.label'),
                  selected: state.bufferMode == 'low',
                  onTap: () => state.setBufferMode('low'),
                  theme: theme,
                ),
                const SizedBox(width: 6),
                _BufferOption(
                  label: AppTranslations.t(lang, 'settings.buffer.medium'),
                  sub:
                      AppTranslations.t(lang, 'settings.buffer.medium.label'),
                  selected: state.bufferMode == 'medium',
                  onTap: () => state.setBufferMode('medium'),
                  theme: theme,
                ),
                const SizedBox(width: 6),
                _BufferOption(
                  label: AppTranslations.t(lang, 'settings.buffer.high'),
                  sub: AppTranslations.t(lang, 'settings.buffer.high.label'),
                  selected: state.bufferMode == 'high',
                  onTap: () => state.setBufferMode('high'),
                  theme: theme,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Toggles
          _SectionCard(
            icon: Icons.tune,
            title: 'Settings',
            child: Column(
              children: [
                _ToggleRow(
                  label: AppTranslations.t(lang, 'settings.autoplay'),
                  desc: AppTranslations.t(lang, 'settings.autoplay.desc'),
                  value: state.autoPlay,
                  onChanged: (v) => state.setAutoPlay(v),
                  theme: theme,
                ),
                const Divider(color: Color(0xFF1E293B), height: 1),
                _ToggleRow(
                  label: AppTranslations.t(lang, 'settings.offline'),
                  desc: AppTranslations.t(lang, 'settings.offline.desc'),
                  value: state.offlineCache,
                  onChanged: (v) => state.setOfflineCache(v),
                  theme: theme,
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Custom M3U
          _SectionCard(
            icon: Icons.folder,
            title: AppTranslations.t(lang, 'settings.custom.m3u'),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppTranslations.t(lang, 'settings.custom.m3u.desc'),
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 10,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  maxLines: 4,
                  controller: TextEditingController.fromValue(
                    TextEditingValue(
                      text: state.customM3U ?? '',
                    ),
                  ),
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: Color(0xFFCBD5E1),
                  ),
                  decoration: const InputDecoration(
                    hintText:
                        '#EXTM3U\n#EXTINF:-1 tvg-logo="..." group-title="Sports",Channel Name\nhttps://stream-url.m3u8',
                    hintStyle: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      color: Color(0xFF475569),
                    ),
                  ),
                  onChanged: (v) => state.setCustomM3U(v),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (state.customM3U != null &&
                        state.customM3U!.isNotEmpty) ...[
                      GestureDetector(
                        onTap: () {
                          state.clearCustomM3U();
                          state.loadChannels();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: const Color(0xFF334155),
                            ),
                          ),
                          child: const Text(
                            'Clear',
                            style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    GestureDetector(
                      onTap: () {
                        state.loadChannels();
                        state.triggerToast('Playlist refreshed!');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              theme.colorScheme.primary,
                              theme.colorScheme.primary.withValues(alpha: 0.8),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Import',
                          style: TextStyle(
                            color: Color(0xFF0A0E1A),
                            fontWeight: FontWeight.w900,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Reset
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B).withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Reset All Data',
                      style: TextStyle(
                        color: Color(0xFFE2E8F0),
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Clear all preferences and history',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => state.resetAll(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7F1D1D).withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: const Color(0xFF7F1D1D).withValues(alpha: 0.3),
                      ),
                    ),
                    child: const Text(
                      'Reset',
                      style: TextStyle(
                        color: Color(0xFFFB7185),
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const _SectionCard({
    required this.icon,
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: const Color(0xFF06B6D4)),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _OptionBtn extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final ThemeData theme;

  const _OptionBtn({
    required this.label,
    required this.selected,
    required this.onTap,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? theme.colorScheme.primary.withValues(alpha: 0.1)
                : const Color(0xFF0F1525).withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? theme.colorScheme.primary
                  : const Color(0xFF334155),
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: selected
                    ? theme.colorScheme.primary
                    : const Color(0xFFCBD5E1),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ColorOption extends StatelessWidget {
  final Color color;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ColorOption({
    required this.color,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1525).withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? color
                  : const Color(0xFF334155),
            ),
          ),
          child: Column(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  color: selected
                      ? color
                      : const Color(0xFF94A3B8),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EngineOption extends StatelessWidget {
  final String label;
  final String desc;
  final bool selected;
  final VoidCallback onTap;
  final ThemeData theme;

  const _EngineOption({
    required this.label,
    required this.desc,
    required this.selected,
    required this.onTap,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primary.withValues(alpha: 0.1)
              : const Color(0xFF0F1525).withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : const Color(0xFF334155),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      color: selected
                          ? theme.colorScheme.primary
                          : const Color(0xFFE2E8F0),
                      fontWeight: FontWeight.w900,
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    desc,
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 8,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BufferOption extends StatelessWidget {
  final String label;
  final String sub;
  final bool selected;
  final VoidCallback onTap;
  final ThemeData theme;

  const _BufferOption({
    required this.label,
    required this.sub,
    required this.selected,
    required this.onTap,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? theme.colorScheme.primary.withValues(alpha: 0.1)
                : const Color(0xFF0F1525).withValues(alpha: 0.6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? theme.colorScheme.primary
                  : const Color(0xFF334155),
            ),
          ),
          child: Column(
            children: [
              Text(
                label,
                style: TextStyle(
                  color: selected
                      ? theme.colorScheme.primary
                      : const Color(0xFFE2E8F0),
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
              Text(
                sub,
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 8,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ToggleRow extends StatelessWidget {
  final String label;
  final String desc;
  final bool value;
  final ValueChanged<bool> onChanged;
  final ThemeData theme;

  const _ToggleRow({
    required this.label,
    required this.desc,
    required this.value,
    required this.onChanged,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: Color(0xFFE2E8F0),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
              Text(
                desc,
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 9,
                ),
              ),
            ],
          ),
          GestureDetector(
            onTap: () => onChanged(!value),
            child: Container(
              width: 44,
              height: 24,
              decoration: BoxDecoration(
                color: value
                    ? theme.colorScheme.primary
                    : const Color(0xFF334155),
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(2),
              child: AnimatedAlign(
                duration: const Duration(milliseconds: 200),
                alignment:
                    value ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0A0E1A),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
