import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../translations/app_translations.dart';

class LiveTvTab extends StatefulWidget {
  const LiveTvTab({super.key});

  @override
  State<LiveTvTab> createState() => _LiveTvTabState();
}

class _LiveTvTabState extends State<LiveTvTab> {
  final TextEditingController _searchCtrl = TextEditingController();
  Timer? _hoverTimer;

  @override
  void dispose() {
    _searchCtrl.dispose();
    _hoverTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final lang = state.language;
    final theme = Theme.of(context);
    final channels = state.filteredChannels;
    final cats = state.categories;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 100),
      child: Column(
        children: [
          // Video player or multi-screen
          if (state.currentChannel != null) ...[
            if (state.multiScreenActive) ...[
              _buildMultiScreenBar(state, theme, lang),
              const SizedBox(height: 8),
              _buildMultiScreenGrid(state, theme, lang),
              const SizedBox(height: 8),
            ] else
              _buildSimplePlayer(state, theme, lang),
          ],

          const SizedBox(height: 12),

          // Channel directory
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F1525).withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFF1E293B),
              ),
            ),
            child: Column(
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.grid_view,
                            size: 16, color: theme.colorScheme.primary),
                        const SizedBox(width: 6),
                        Text(
                          '${AppTranslations.t(lang, 'live.directory')} (${channels.length})',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    GestureDetector(
                      onTap: () {
                        state.setMultiScreenActive(!state.multiScreenActive);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: state.multiScreenActive
                              ? theme.colorScheme.primary.withValues(alpha: 0.1)
                              : const Color(0xFF0F1525),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: state.multiScreenActive
                                ? theme.colorScheme.primary.withValues(alpha: 0.4)
                                : const Color(0xFF334155),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.layers,
                                size: 12,
                                color: state.multiScreenActive
                                    ? theme.colorScheme.primary
                                    : const Color(0xFF94A3B8)),
                            const SizedBox(width: 4),
                            Text(
                              'Arena Multi-Screen',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: state.multiScreenActive
                                    ? theme.colorScheme.primary
                                    : const Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Search
                TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: AppTranslations.t(lang, 'search.placeholder'),
                    prefixIcon: const Icon(Icons.search,
                        size: 18, color: Color(0xFF64748B)),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear,
                                size: 16, color: Color(0xFF64748B)),
                            onPressed: () {
                              _searchCtrl.clear();
                              state.setSearchQuery('');
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                  ),
                  onChanged: state.setSearchQuery,
                ),
                const SizedBox(height: 8),

                // Category chips
                SizedBox(
                  height: 32,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: cats.map((cat) {
                      final isSelected =
                          state.categoryFilter == cat;
                      return GestureDetector(
                        onTap: () => state.setCategoryFilter(cat),
                        child: Container(
                          margin: const EdgeInsets.only(right: 4),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? theme.colorScheme.primary
                                : const Color(0xFF0F1525),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected
                                  ? theme.colorScheme.primary
                                  : const Color(0xFF334155),
                            ),
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? const Color(0xFF0A0E1A)
                                  : const Color(0xFF94A3B8),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Loading state
          if (state.loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  children: [
                    CircularProgressIndicator(
                        color: Color(0xFF06B6D4)),
                    SizedBox(height: 12),
                    Text(
                      'Loading channels...',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      'fetching from server',
                      style: TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 9,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Channel list
          if (!state.loading)
            ...channels.asMap().entries.map((entry) {
              final idx = entry.key;
              final ch = entry.value;
              final isSelected = state.currentChannel?.id == ch.id;
              final isFaved = state.favorites.contains(ch.id);

              return GestureDetector(
                onTap: () {
                  if (state.multiScreenActive) {
                    state.selectGridChannel(
                        state.activeGridIndex, ch);
                  } else {
                    state.checkAdWall(ch);
                  }
                },
                onLongPressStart: (_) {
                  _hoverTimer =
                      Timer(const Duration(milliseconds: 600), () {
                    state.setHoveredChannelId(ch.id);
                  });
                },
                onLongPressEnd: (_) {
                  _hoverTimer?.cancel();
                  state.setHoveredChannelId(null);
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 4),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF1E293B)
                        : const Color(0xFF0F1525).withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? theme.colorScheme.primary.withValues(alpha: 0.5)
                          : const Color(0xFF1E293B),
                    ),
                  ),
                  child: Row(
                    children: [
                      // Index
                      SizedBox(
                        width: 20,
                        child: isSelected
                            ? Icon(Icons.radio,
                                size: 12,
                                color: theme.colorScheme.primary)
                            : Text(
                                '#${idx + 1}',
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                      const SizedBox(width: 8),

                      // Logo
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1525),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: const Color(0xFF334155).withValues(alpha: 0.5),
                          ),
                        ),
                        child: Center(
                          child: ch.logo.isNotEmpty
                              ? Image.network(ch.logo,
                                  width: 28,
                                  height: 28,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) =>
                                      const Icon(Icons.tv,
                                          size: 16,
                                          color: Color(0xFF64748B)))
                              : const Icon(Icons.tv,
                                  size: 16, color: Color(0xFF64748B)),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: ch.healthy
                                        ? const Color(0xFF10B981)
                                        : const Color(0xFFF43F5E),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    ch.name,
                                    style: TextStyle(
                                      color: isSelected
                                          ? theme.colorScheme.primary
                                          : const Color(0xFFE2E8F0),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F1525),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: const Color(0xFF1E293B),
                                ),
                              ),
                              child: Text(
                                ch.group,
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 8,
                                  fontFamily: 'monospace',
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Favorite star
                      GestureDetector(
                        onTap: () => state.toggleFavorite(ch.id),
                        child: Icon(
                          isFaved
                              ? Icons.star
                              : Icons.star_border,
                          size: 16,
                          color: isFaved
                              ? const Color(0xFFFBBF24)
                              : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildMultiScreenBar(
      AppState state, ThemeData theme, String lang) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF334155).withValues(alpha: 0.5),
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.layers,
              size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Text(
            'Arena Multi-Screen',
            style: TextStyle(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
          const Spacer(),
          _multiBtn('2', state.multiScreenCount == 2, () {
            state.setMultiScreenCount(2);
          }, theme),
          const SizedBox(width: 4),
          _multiBtn('4', state.multiScreenCount == 4, () {
            state.setMultiScreenCount(4);
          }, theme),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: () => state.setMultiScreenActive(false),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF7F1D1D).withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: const Color(0xFF7F1D1D).withValues(alpha: 0.3),
                ),
              ),
              child: const Text(
                'Close',
                style: TextStyle(
                  color: Color(0xFFFB7185),
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _multiBtn(String label, bool active, VoidCallback onTap,
      ThemeData theme) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: active
              ? theme.colorScheme.primary
              : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active
                ? theme.colorScheme.primary
                : const Color(0xFF334155),
          ),
        ),
        child: Text(
          '$label-Screen',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: active
                ? const Color(0xFF0A0E1A)
                : const Color(0xFF94A3B8),
          ),
        ),
      ),
    );
  }

  Widget _buildMultiScreenGrid(
      AppState state, ThemeData theme, String lang) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: state.multiScreenCount == 2 ? 2 : 2,
        childAspectRatio: 1.6,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: state.multiScreenCount,
      itemBuilder: (_, idx) {
        final slotChannel = state.gridChannels.length > idx
            ? state.gridChannels[idx]
            : null;
        final isActive = state.activeGridIndex == idx;

        return GestureDetector(
          onTap: () => state.setActiveGridIndex(idx),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isActive
                    ? theme.colorScheme.primary
                    : const Color(0xFF0F1525),
                width: isActive ? 2 : 1,
              ),
            ),
            child: Stack(
              children: [
                if (slotChannel != null)
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.play_circle_outline,
                            size: 32,
                            color: Color(0xFF06B6D4)),
                        const SizedBox(height: 4),
                        Text(
                          slotChannel.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  )
                else
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.add,
                            size: 24, color: Color(0xFF475569)),
                        const SizedBox(height: 4),
                        Text(
                          'Slot ${idx + 1}',
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Text(
                          'Select a channel',
                          style: TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 8,
                          ),
                        ),
                      ],
                    ),
                  ),
                if (slotChannel != null)
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () =>
                          state.clearGridSlot(idx),
                      child: Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close,
                            size: 12, color: Colors.white70),
                      ),
                    ),
                  ),
                if (slotChannel != null)
                  Positioned(
                    bottom: 4,
                    left: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Slot ${idx + 1}: ${slotChannel.name}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                if (isActive && slotChannel == null)
                  Positioned(
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: theme.colorScheme.primary
                              .withValues(alpha: 0.5),
                          width: 2,
                        ),
                        color:
                            theme.colorScheme.primary.withValues(alpha: 0.05),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSimplePlayer(
      AppState state, ThemeData theme, String lang) {
    final ch = state.currentChannel!;
    return Container(
      height: 200,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Stack(
        children: [
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.play_circle_fill,
                    size: 48, color: theme.colorScheme.primary),
                const SizedBox(height: 8),
                Text(
                  ch.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: theme.colorScheme.primary
                          .withValues(alpha: 0.3),
                    ),
                  ),
                  child: Text(
                    ch.group,
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontSize: 9,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _playerBtn(Icons.skip_previous, () {
                      state.handlePrevChannel();
                    }),
                    _playerBtn(Icons.play_arrow, () {}),
                    _playerBtn(Icons.skip_next, () {
                      state.handleNextChannel();
                    }),
                  ],
                ),
              ],
            ),
          ),
          // Top bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black54, Colors.transparent],
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.favorite_border,
                      size: 14, color: Colors.white70),
                  const Spacer(),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF43F5E),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'LIVE',
                    style: TextStyle(
                      color: Color(0xFFF43F5E),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _playerBtn(IconData icon, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      child: IconButton(
        icon: Icon(icon, color: Colors.white, size: 28),
        onPressed: onTap,
      ),
    );
  }
}
