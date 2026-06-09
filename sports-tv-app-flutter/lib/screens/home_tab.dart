import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../translations/app_translations.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final lang = state.language;
    final theme = Theme.of(context);

    final sportsCategories = [
      {'id': 'all', 'label': 'All', 'emoji': '🏆'},
      {'id': 'football', 'label': 'Football', 'emoji': '⚽'},
      {'id': 'cricket', 'label': 'Cricket', 'emoji': '🏏'},
      {'id': 'tennis', 'label': 'Tennis', 'emoji': '🎾'},
      {'id': 'motorsport', 'label': 'Motorsport', 'emoji': '🏎️'},
      {'id': 'other', 'label': 'Other', 'emoji': '🎯'},
    ];

    final matchFilters = [
      {'id': 'All', 'label': 'All Matches'},
      {'id': 'live', 'label': 'Live Matches'},
      {'id': 'upcoming', 'label': 'Upcoming Matches'},
      {'id': 'finished', 'label': 'Recent Matches'},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Sports categories
          const Text(
            'Sports Categories',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontWeight: FontWeight.w800,
              fontSize: 11,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 72,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: sportsCategories.map((cat) {
                final isSelected = state.sportFilter == cat['id'];
                return GestureDetector(
                  onTap: () => state.setSportFilter(cat['id'] as String),
                  child: Container(
                    width: 70,
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? theme.colorScheme.primary.withValues(alpha: 0.1)
                          : const Color(0xFF1E293B).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? theme.colorScheme.primary.withValues(alpha: 0.4)
                            : const Color(0xFF334155).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? theme.colorScheme.primary.withValues(alpha: 0.2)
                                : const Color(0xFF1E293B).withValues(alpha: 0.5),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              cat['emoji'] as String,
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          cat['label'] as String,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: isSelected
                                ? theme.colorScheme.primary
                                : const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 16),

          // Match filter tabs
          SizedBox(
            height: 32,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: matchFilters.map((mf) {
                final actualFilterId = mf['id'] == 'All' ? 'all' : mf['id'] as String;
                final isActive = state.statusFilter == actualFilterId ||
                    (state.statusFilter == 'all' && mf['id'] == 'All');
                return GestureDetector(
                  onTap: () =>
                      state.setStatusFilter(actualFilterId),
                  child: Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isActive
                          ? theme.colorScheme.primary.withValues(alpha: 0.15)
                          : const Color(0xFF1E293B).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isActive
                            ? theme.colorScheme.primary.withValues(alpha: 0.4)
                            : const Color(0xFF334155).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          mf['label'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isActive
                                ? theme.colorScheme.primary
                                : const Color(0xFF94A3B8),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: isActive
                                ? theme.colorScheme.primary.withValues(alpha: 0.2)
                                : const Color(0xFF334155).withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${state.getMatchCount(mf['id'] as String)}',
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              color: isActive
                                  ? theme.colorScheme.primary
                                  : const Color(0xFF64748B),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 16),

          // Events
          if (state.filteredEvents.isNotEmpty) ...[
            Row(
              children: [
                Icon(Icons.visibility,
                    size: 14, color: theme.colorScheme.primary),
                const SizedBox(width: 6),
                Text(
                  AppTranslations.t(lang, 'home.events'),
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...state.filteredEvents.map((event) => _buildEventCard(
                event, state, theme, lang)),
          ],

          const SizedBox(height: 16),

          // Trending channels
          if (state.trendingChannels.isNotEmpty) ...[
            Row(
              children: [
                Icon(Icons.trending_up,
                    size: 14, color: theme.colorScheme.primary),
                const SizedBox(width: 6),
                Text(
                  AppTranslations.t(lang, 'home.trending'),
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 0.85,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: state.trendingChannels.length,
              itemBuilder: (_, i) {
                final ch = state.trendingChannels[i];
                return GestureDetector(
                  onTap: () {
                    state.checkAdWall(ch);
                    state.setSelectedTab(1);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B).withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFF334155).withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
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
                          child: const Icon(Icons.tv,
                              size: 16, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          ch.name,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Color(0xFFCBD5E1),
                            fontWeight: FontWeight.bold,
                            fontSize: 9,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEventCard(
      dynamic event, AppState state, ThemeData theme, String lang) {
    final isLive = event.status == 'live';
    final isUpcoming = event.status == 'upcoming';
    final showScore = isLive && event.score1 != '0' && event.score2 != '0';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: isLive
            ? LinearGradient(
                colors: [
                  const Color(0xFF1E293B).withValues(alpha: 0.6),
                  const Color(0xFF1E293B).withValues(alpha: 0.3),
                  theme.colorScheme.primary.withValues(alpha: 0.08),
                ],
              )
            : LinearGradient(
                colors: [
                  const Color(0xFF1E293B).withValues(alpha: 0.3),
                  const Color(0xFF1E293B).withValues(alpha: 0.2),
                ],
              ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isLive
              ? theme.colorScheme.primary.withValues(alpha: 0.4)
              : const Color(0xFF334155).withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: const Color(0xFF334155).withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(child: Text('🏆', style: TextStyle(fontSize: 12))),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  event.tournament,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.bold,
                    fontSize: 9,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isLive
                      ? const Color(0xFFF43F5E).withValues(alpha: 0.1)
                      : isUpcoming
                          ? theme.colorScheme.primary.withValues(alpha: 0.1)
                          : const Color(0xFF334155),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isLive
                        ? const Color(0xFFF43F5E).withValues(alpha: 0.2)
                        : isUpcoming
                            ? theme.colorScheme.primary.withValues(alpha: 0.2)
                            : const Color(0xFF334155),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isLive)
                      Container(
                        width: 6,
                        height: 6,
                        margin: const EdgeInsets.only(right: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF43F5E),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF43F5E),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ),
                    Text(
                      isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: isLive
                            ? const Color(0xFFF43F5E)
                            : isUpcoming
                                ? theme.colorScheme.primary
                                : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Teams
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Text(
                      event.team1Flag,
                      style: const TextStyle(fontSize: 20),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        event.team1,
                        style: const TextStyle(
                          color: Color(0xFFF1F5F9),
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F1525),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF334155).withValues(alpha: 0.5),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (showScore || event.status == 'finished') ...[
                      Text(
                        event.score1 ?? '0',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: theme.colorScheme.primary,
                          fontFamily: 'monospace',
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 4),
                        child: Text(
                          ':',
                          style: TextStyle(
                            color: Color(0xFF475569),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Text(
                        event.score2 ?? '0',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: theme.colorScheme.primary,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ] else ...[
                      const Text(
                        'VS',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF64748B),
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Text(
                        event.team2,
                        textAlign: TextAlign.right,
                        style: const TextStyle(
                          color: Color(0xFFF1F5F9),
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      event.team2Flag,
                      style: const TextStyle(fontSize: 20),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Status text
          if (isLive) ...[
            const SizedBox(height: 8),
            Center(
              child: Text(
                event.statusText ?? 'LIVE',
                style: const TextStyle(
                  color: Color(0xFFF43F5E),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          ],

          // Watch button for live events
          if (isLive) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  final ids = (event.channelIds?.isNotEmpty == true
                          ? event.channelIds
                          : (event.channelId != null
                              ? [event.channelId]
                              : []))
                      as List<String>?;
                  if (ids != null && ids.isNotEmpty) {
                    final matchChannels = state.channels
                        .where((c) => ids.contains(c.id))
                        .toList();
                    if (matchChannels.length == 1) {
                      state.checkAdWall(matchChannels.first);
                      state.setSelectedTab(1);
                    } else if (matchChannels.length > 1) {
                      state.setPickerChannels(matchChannels);
                    }
                  } else {
                    state.setCategoryFilter('Sports Live');
                    state.setSelectedTab(1);
                  }
                },
                icon: const Icon(Icons.play_arrow, size: 14),
                label: const Text('Watch Live',
                    style: TextStyle(
                        fontSize: 10, fontWeight: FontWeight.w900)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: const Color(0xFF0A0E1A),
                  padding:
                      const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],

          // Upcoming countdown
          if (isUpcoming && event.startTime != null) ...[
            const SizedBox(height: 8),
            Center(
              child: Text(
                event.statusText ?? 'Scheduled',
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 10,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
