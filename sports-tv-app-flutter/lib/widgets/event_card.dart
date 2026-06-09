import 'package:flutter/material.dart';
import '../models/live_event.dart';

class EventCard extends StatelessWidget {
  final LiveEvent event;
  final VoidCallback? onWatch;

  const EventCard({super.key, required this.event, this.onWatch});

  Color _statusColor() {
    switch (event.status) {
      case 'live':
        return Colors.red;
      case 'upcoming':
        return Colors.orange;
      case 'finished':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  IconData _typeIcon() {
    switch (event.type) {
      case 'cricket':
        return Icons.sports_cricket;
      case 'football':
        return Icons.sports_soccer;
      default:
        return Icons.sports;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(_typeIcon(), size: 18, color: theme.colorScheme.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    event.tournament,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor().withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _statusColor().withValues(alpha: 0.5)),
                  ),
                  child: Text(
                    event.statusText.isNotEmpty
                        ? event.statusText
                        : event.status.toUpperCase(),
                    style: TextStyle(
                      color: _statusColor(),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _TeamWidget(
                    flag: event.team1Flag,
                    url: event.team1FlagUrl,
                    name: event.team1,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    event.score1 != null && event.score2 != null
                        ? '${event.score1} - ${event.score2}'
                        : 'VS',
                    style: TextStyle(
                      fontSize: event.score1 != null ? 24 : 16,
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ),
                Expanded(
                  child: _TeamWidget(
                    flag: event.team2Flag,
                    url: event.team2FlagUrl,
                    name: event.team2,
                    alignRight: true,
                  ),
                ),
              ],
            ),
            if (event.status == 'live' && onWatch != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onWatch,
                  icon: const Icon(Icons.play_arrow, size: 20),
                  label: const Text('Watch Live'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TeamWidget extends StatelessWidget {
  final String flag;
  final String? url;
  final String name;
  final bool alignRight;

  const _TeamWidget({
    required this.flag,
    this.url,
    required this.name,
    this.alignRight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.grey[800],
          child: Text(
            flag.isNotEmpty ? flag : name.isNotEmpty ? name[0] : '?',
            style: const TextStyle(fontSize: 24),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          name,
          style: const TextStyle(
            color: Color(0xFFF1F5F9),
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
          textAlign: alignRight ? TextAlign.right : TextAlign.left,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
