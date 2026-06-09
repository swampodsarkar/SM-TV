import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../services/firebase_service.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final lang = state.language;
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      child: state.isAdmin
          ? _AdminPanel(state: state, theme: theme, lang: lang)
          : state.isGuest
              ? _GuestProfile(state: state, theme: theme, lang: lang)
              : _LoginScreen(state: state, theme: theme, lang: lang),
    );
  }
}

class _LoginScreen extends StatelessWidget {
  final AppState state;
  final ThemeData theme;
  final String lang;

  const _LoginScreen({
    required this.state,
    required this.theme,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 32),
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
          ),
          child: const Icon(Icons.person,
              size: 40, color: Color(0xFF0A0E1A)),
        ),
        const SizedBox(height: 16),
        const Text(
          'Welcome',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w900,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Sign in to sync your data across devices',
          style: TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF334155).withValues(alpha: 0.5),
            ),
          ),
          child: Column(
            children: [
              TextField(
                decoration: const InputDecoration(
                  hintText: 'Email',
                  prefixIcon: Icon(Icons.email,
                      size: 18, color: Color(0xFF64748B)),
                ),
                onChanged: state.setAdminEmailInput,
              ),
              const SizedBox(height: 12),
              TextField(
                obscureText: true,
                decoration: const InputDecoration(
                  hintText: 'Password',
                  prefixIcon: Icon(Icons.lock,
                      size: 18, color: Color(0xFF64748B)),
                ),
                onChanged: state.setAdminPassInput,
                onSubmitted: (_) => state.adminLogin(),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => state.adminLogin(),
                  child: const Text('Sign In',
                      style: TextStyle(fontWeight: FontWeight.w900)),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Expanded(
                      child: Divider(color: Color(0xFF334155))),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('OR',
                        style: TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        )),
                  ),
                  const Expanded(
                      child: Divider(color: Color(0xFF334155))),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => state.guestLogin(),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF334155)),
                    foregroundColor: const Color(0xFF94A3B8),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('Continue as Guest',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _GuestProfile extends StatelessWidget {
  final AppState state;
  final ThemeData theme;
  final String lang;

  const _GuestProfile({
    required this.state,
    required this.theme,
    required this.lang,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.primary.withValues(alpha: 0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.person,
                  size: 32, color: Color(0xFF0A0E1A)),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Guest User',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
                Text(
                  'ID: ${state.guestId?.substring(0, 12) ?? 'anonymous'}...',
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 10,
                    fontFamily: 'monospace',
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      ' Active Session',
                      style: TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 10,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF334155).withValues(alpha: 0.5),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '${state.history.length}',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Channels Watched',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF334155).withValues(alpha: 0.5),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '${state.latencyResult ?? 0}ms',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Latency',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF334155).withValues(alpha: 0.5),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.history,
                      size: 16, color: theme.colorScheme.primary),
                  const SizedBox(width: 6),
                  const Text(
                    'Recently Watched',
                    style: TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (state.history.isEmpty)
                const Text(
                  'No watch history yet.',
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 10,
                    fontStyle: FontStyle.italic,
                  ),
                )
              else
                ...state.history.take(5).map((item) {
                  final chName =
                      item['channelName']?.toString() ?? 'Unknown';
                  final chId =
                      item['channelId']?.toString() ?? '';
                  return GestureDetector(
                    onTap: () {
                      final ch = state.channels
                          .where((c) => c.id == chId)
                          .toList();
                      if (ch.isNotEmpty) {
                        state.checkAdWall(ch.first);
                        state.setSelectedTab(1);
                      }
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 4),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F1525)
                            .withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: const Color(0xFF334155)
                              .withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.tv,
                                size: 14, color: Color(0xFF64748B)),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              chName,
                              style: const TextStyle(
                                color: Color(0xFFE2E8F0),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Icon(Icons.play_arrow,
                              size: 14,
                              color: theme.colorScheme.primary),
                        ],
                      ),
                    ),
                  );
                }),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF334155).withValues(alpha: 0.5),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.tune,
                      size: 16, color: theme.colorScheme.primary),
                  const SizedBox(width: 6),
                  const Text(
                    'Quick Settings',
                    style: TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _quickSetting(Icons.palette, 'Theme',
                      state.theme, () => state.setSelectedTab(4)),
                  const SizedBox(width: 8),
                  _quickSetting(Icons.live_tv, 'Player',
                      state.playerEngine, () => state.setSelectedTab(4)),
                  const SizedBox(width: 8),
                  _quickSetting(Icons.language, 'Language',
                      state.language == 'en' ? 'English' : 'বাংলা',
                      () => state.setSelectedTab(4)),
                  const SizedBox(width: 8),
                  _quickSetting(Icons.delete_sweep, 'Reset All',
                      'Clear data', () => state.resetAll()),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _quickSetting(
      IconData icon, String label, String value, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1525).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: const Color(0xFF334155).withValues(alpha: 0.3),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 16, color: const Color(0xFF06B6D4)),
              const SizedBox(height: 6),
              Text(
                label,
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                value,
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

class _AdminPanel extends StatefulWidget {
  final AppState state;
  final ThemeData theme;
  final String lang;

  const _AdminPanel({
    required this.state,
    required this.theme,
    required this.lang,
  });

  @override
  State<_AdminPanel> createState() => _AdminPanelState();
}

class _AdminPanelState extends State<_AdminPanel> {
  final _team1Ctrl = TextEditingController();
  final _team1FlagCtrl = TextEditingController(text: '🇧🇩');
  final _team2Ctrl = TextEditingController();
  final _team2FlagCtrl = TextEditingController(text: '🇮🇳');
  final _score1Ctrl = TextEditingController();
  final _score2Ctrl = TextEditingController();
  final _tournamentCtrl = TextEditingController();
  final _statusTextCtrl = TextEditingController();
  final _startTimeCtrl = TextEditingController();
  final _channelSearchCtrl = TextEditingController();
  final _imgbbKeyCtrl = TextEditingController();
  String _status = 'live';
  String _type = 'cricket';
  List<String> _selectedChannelIds = [];

  @override
  void initState() {
    super.initState();
    _imgbbKeyCtrl.text = widget.state.imgbbKey;
  }

  @override
  void dispose() {
    _team1Ctrl.dispose();
    _team1FlagCtrl.dispose();
    _team2Ctrl.dispose();
    _team2FlagCtrl.dispose();
    _score1Ctrl.dispose();
    _score2Ctrl.dispose();
    _tournamentCtrl.dispose();
    _statusTextCtrl.dispose();
    _startTimeCtrl.dispose();
    _channelSearchCtrl.dispose();
    _imgbbKeyCtrl.dispose();
    super.dispose();
  }

  void _loadEventForEditing(dynamic event) {
    _team1Ctrl.text = event.team1;
    _team1FlagCtrl.text = event.team1Flag;
    _team2Ctrl.text = event.team2;
    _team2FlagCtrl.text = event.team2Flag;
    _score1Ctrl.text = event.score1 ?? '';
    _score2Ctrl.text = event.score2 ?? '';
    _tournamentCtrl.text = event.tournament;
    _statusTextCtrl.text = event.statusText ?? '';
    _selectedChannelIds = (event.channelIds is List
            ? List<String>.from(event.channelIds)
            : (event.channelId != null ? [event.channelId.toString()] : []));
    if (event.startTime != null) {
      final dt =
          DateTime.fromMillisecondsSinceEpoch(event.startTime);
      _startTimeCtrl.text =
          '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}T'
          '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    }
    setState(() {
      _status = event.status;
      _type = event.type;
    });
    widget.state.setEditingEventId(event.id);
  }

  void _saveEvent() {
    if (_team1Ctrl.text.isEmpty ||
        _team2Ctrl.text.isEmpty ||
        _tournamentCtrl.text.isEmpty) {
      widget.state.triggerToast('Fill all fields!');
      return;
    }
    String? startTs;
    if (_startTimeCtrl.text.isNotEmpty) {
      try {
        startTs =
            DateTime.parse(_startTimeCtrl.text)
                .millisecondsSinceEpoch
                .toString();
      } catch (_) {}
    }
    final data = {
      'type': _type,
      'team1': _team1Ctrl.text,
      'team1Flag': _team1FlagCtrl.text,
      'team2': _team2Ctrl.text,
      'team2Flag': _team2FlagCtrl.text,
      'score1': _score1Ctrl.text.isEmpty ? '0' : _score1Ctrl.text,
      'score2': _score2Ctrl.text.isEmpty ? '0' : _score2Ctrl.text,
      'status': _status,
      'statusText': _statusTextCtrl.text.isEmpty
          ? (_status == 'live' ? 'In Progress' : 'Scheduled')
          : _statusTextCtrl.text,
      'tournament': _tournamentCtrl.text,
      'channelIds': _selectedChannelIds,
      if (_selectedChannelIds.isNotEmpty)
        'channelId': _selectedChannelIds.first,
      if (startTs != null) 'startTime': int.parse(startTs),
    };
    if (widget.state.editingEventId != null) {
      FirebaseService.updateEvent(widget.state.editingEventId!, data);
      widget.state.triggerToast('Updated!');
    } else {
      FirebaseService.addEvent(data);
      widget.state.triggerToast('Saved to Firebase!');
    }
    _clearForm();
  }

  void _clearForm() {
    _team1Ctrl.clear();
    _team1FlagCtrl.text = '🇧🇩';
    _team2Ctrl.clear();
    _team2FlagCtrl.text = '🇮🇳';
    _score1Ctrl.clear();
    _score2Ctrl.clear();
    _tournamentCtrl.clear();
    _statusTextCtrl.clear();
    _startTimeCtrl.clear();
    _selectedChannelIds = [];
    widget.state.setEditingEventId(null);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final events = widget.state.events;
    final channels = widget.state.channels;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    widget.theme.colorScheme.primary,
                    widget.theme.colorScheme.primary.withValues(alpha: 0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.settings,
                  size: 24, color: Color(0xFF0A0E1A)),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Admin Panel',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 18,
                  ),
                ),
                Text(
                  'mdswampodsarkar@gmail.com',
                  style: TextStyle(
                    color: widget.theme.colorScheme.primary,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Spacer(),
            GestureDetector(
              onTap: () => widget.state.adminLogout(),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF7F1D1D).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: const Color(0xFF7F1D1D).withValues(alpha: 0.3),
                  ),
                ),
                child: const Text(
                  'Logout',
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
        const SizedBox(height: 16),

        // Events list
        Container(
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
                  Icon(Icons.emoji_events,
                      size: 16,
                      color: widget.theme.colorScheme.primary),
                  const SizedBox(width: 6),
                  const Text(
                    'Live Sports Events',
                    style: TextStyle(
                      color: Color(0xFFCBD5E1),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Events synced to Firebase.',
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 10,
                ),
              ),
              const SizedBox(height: 12),
              if (events.isEmpty)
                const Text(
                  'No events yet.',
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 10,
                    fontStyle: FontStyle.italic,
                  ),
                )
              else
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: ListView(
                    shrinkWrap: true,
                    children: events.map((evt) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1525),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF334155),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${evt.team1Flag} ${evt.team1} vs ${evt.team2} ${evt.team2Flag}',
                                    style: const TextStyle(
                                      color: Color(0xFFE2E8F0),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${evt.tournament} | ${evt.status.toUpperCase()}',
                                    style: TextStyle(
                                      color: evt.status == 'live'
                                          ? const Color(0xFFF43F5E)
                                          : evt.status == 'upcoming'
                                              ? widget.theme
                                                  .colorScheme
                                                  .primary
                                              : const Color(0xFF64748B),
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                GestureDetector(
                                  onTap: () =>
                                      _loadEventForEditing(evt),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: widget.theme.colorScheme.primary
                                          .withValues(alpha: 0.1),
                                      borderRadius:
                                          BorderRadius.circular(8),
                                      border: Border.all(
                                        color: widget.theme.colorScheme.primary
                                            .withValues(alpha: 0.2),
                                      ),
                                    ),
                                    child: Text(
                                      'Edit',
                                      style: TextStyle(
                                        color: widget
                                            .theme.colorScheme.primary,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 4),
                                GestureDetector(
                                  onTap: () {
                                    FirebaseService.removeEvent(
                                        evt.id);
                                    widget.state.triggerToast(
                                        'Deleted!');
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF7F1D1D)
                                          .withValues(alpha: 0.4),
                                      borderRadius:
                                          BorderRadius.circular(8),
                                      border: Border.all(
                                        color: const Color(0xFF7F1D1D)
                                            .withValues(alpha: 0.3),
                                      ),
                                    ),
                                    child: const Text(
                                      'Delete',
                                      style: TextStyle(
                                        color: Color(0xFFFB7185),
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Edit indicator
        if (widget.state.editingEventId != null)
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: widget.theme.colorScheme.primary.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: widget.theme.colorScheme.primary.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Editing event — changes will update existing event',
                    style: TextStyle(
                      color: widget.theme.colorScheme.primary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: _clearForm,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7F1D1D).withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: const Color(0xFF7F1D1D).withValues(alpha: 0.3),
                      ),
                    ),
                    child: const Text(
                      'Cancel',
                      style: TextStyle(
                        color: Color(0xFFFB7185),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        if (widget.state.editingEventId != null)
          const SizedBox(height: 12),

        // imgBB Key
        TextField(
          controller: _imgbbKeyCtrl,
          decoration: InputDecoration(
            hintText: 'imgBB API Key',
            prefixIcon: const Icon(Icons.key,
                size: 18, color: Color(0xFF64748B)),
            labelText: 'imgBB API Key',
          ),
          onChanged: (v) => widget.state.setImgbbKey(v),
        ),
        const SizedBox(height: 12),

        // Form
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _team1Ctrl,
                decoration: const InputDecoration(
                  hintText: 'Team 1 (e.g. Bangladesh)',
                  labelText: 'Team 1',
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _team1FlagCtrl,
                decoration: const InputDecoration(
                  hintText: 'Flag emoji',
                  labelText: 'Flag 1',
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _team2Ctrl,
                decoration: const InputDecoration(
                  hintText: 'Team 2 (e.g. India)',
                  labelText: 'Team 2',
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _team2FlagCtrl,
                decoration: const InputDecoration(
                  hintText: 'Flag emoji',
                  labelText: 'Flag 2',
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _tournamentCtrl,
          decoration: const InputDecoration(
            hintText: 'Tournament (e.g. ICC Champions Trophy)',
            labelText: 'Tournament',
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _score1Ctrl,
                decoration: const InputDecoration(
                  hintText: 'Score 1',
                  labelText: 'Score 1',
                ),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _score2Ctrl,
                decoration: const InputDecoration(
                  hintText: 'Score 2',
                  labelText: 'Score 2',
                ),
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                initialValue: _type,
                decoration: const InputDecoration(labelText: 'Type'),
                dropdownColor: const Color(0xFF1E293B),
                items: ['cricket', 'football', 'other']
                    .map((t) => DropdownMenuItem(
                        value: t,
                        child: Text(t[0].toUpperCase() + t.substring(1),
                            style: const TextStyle(
                                color: Color(0xFFF1F5F9)))))
                    .toList(),
                onChanged: (v) => setState(() => _type = v!),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: DropdownButtonFormField<String>(
                initialValue: _status,
                decoration: const InputDecoration(labelText: 'Status'),
                dropdownColor: const Color(0xFF1E293B),
                items: ['live', 'upcoming', 'finished']
                    .map((s) => DropdownMenuItem(
                        value: s,
                        child: Text(s[0].toUpperCase() + s.substring(1),
                            style: const TextStyle(
                                color: Color(0xFFF1F5F9)))))
                    .toList(),
                onChanged: (v) => setState(() => _status = v!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _statusTextCtrl,
          decoration: const InputDecoration(
            hintText: 'Status text (e.g. "In Progress")',
            labelText: 'Status Text',
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _startTimeCtrl,
          decoration: const InputDecoration(
            hintText: 'YYYY-MM-DDTHH:MM (e.g. 2026-07-15T18:00)',
            labelText: 'Start Time',
          ),
        ),
        const SizedBox(height: 12),

        // Channel multi-select
        TextField(
          controller: _channelSearchCtrl,
          decoration: const InputDecoration(
            hintText: 'Search channels...',
            prefixIcon: Icon(Icons.search,
                size: 18, color: Color(0xFF64748B)),
          ),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 8),
        Container(
          constraints: const BoxConstraints(maxHeight: 120),
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1525),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: SingleChildScrollView(
            child: Wrap(
              spacing: 4,
              runSpacing: 4,
              children: channels
                  .where((c) => _channelSearchCtrl.text.isEmpty ||
                      c.name.toLowerCase().contains(
                          _channelSearchCtrl.text.toLowerCase()))
                  .map((c) {
                final sel = _selectedChannelIds.contains(c.id);
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (sel) {
                        _selectedChannelIds.remove(c.id);
                      } else {
                        _selectedChannelIds.add(c.id);
                      }
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: sel
                          ? widget.theme.colorScheme.primary
                              .withValues(alpha: 0.2)
                          : const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: sel
                            ? widget.theme.colorScheme.primary
                                .withValues(alpha: 0.4)
                            : const Color(0xFF334155),
                      ),
                    ),
                    child: Text(
                      c.name,
                      style: TextStyle(
                        color: sel
                            ? widget.theme.colorScheme.primary
                            : const Color(0xFF94A3B8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Action buttons
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            GestureDetector(
              onTap: _clearForm,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFF334155),
                  ),
                ),
                child: const Text(
                  'Clear',
                  style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _saveEvent,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      widget.theme.colorScheme.primary,
                      widget.theme.colorScheme.primary.withValues(alpha: 0.8),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  widget.state.editingEventId != null
                      ? 'Update Event'
                      : 'Publish to Firebase',
                  style: const TextStyle(
                    color: Color(0xFF0A0E1A),
                    fontWeight: FontWeight.w900,
                    fontSize: 11,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
