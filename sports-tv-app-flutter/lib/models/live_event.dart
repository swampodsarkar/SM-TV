class LiveEvent {
  final String id;
  final String type;
  final String team1;
  final String team1Flag;
  final String? team1FlagUrl;
  final String team2;
  final String team2Flag;
  final String? team2FlagUrl;
  final String? score1;
  final String? score2;
  final String status;
  final String statusText;
  final String tournament;
  final String? channelId;
  final List<String>? channelIds;
  final int? startTime;

  LiveEvent({
    required this.id,
    required this.type,
    required this.team1,
    required this.team1Flag,
    this.team1FlagUrl,
    required this.team2,
    required this.team2Flag,
    this.team2FlagUrl,
    this.score1,
    this.score2,
    required this.status,
    required this.statusText,
    required this.tournament,
    this.channelId,
    this.channelIds,
    this.startTime,
  });

  factory LiveEvent.fromJson(Map<String, dynamic> json) {
    return LiveEvent(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'other',
      team1: json['team1']?.toString() ?? '',
      team1Flag: json['team1Flag']?.toString() ?? '',
      team1FlagUrl: json['team1FlagUrl']?.toString(),
      team2: json['team2']?.toString() ?? '',
      team2Flag: json['team2Flag']?.toString() ?? '',
      team2FlagUrl: json['team2FlagUrl']?.toString(),
      score1: json['score1']?.toString(),
      score2: json['score2']?.toString(),
      status: json['status']?.toString() ?? 'upcoming',
      statusText: json['statusText']?.toString() ?? '',
      tournament: json['tournament']?.toString() ?? '',
      channelId: json['channelId']?.toString(),
      channelIds: json['channelIds'] != null
          ? List<String>.from(json['channelIds'].map((e) => e.toString()))
          : null,
      startTime: json['startTime'] != null
          ? int.tryParse(json['startTime'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        if (id.isNotEmpty) 'id': id,
        'type': type,
        'team1': team1,
        'team1Flag': team1Flag,
        if (team1FlagUrl != null) 'team1FlagUrl': team1FlagUrl,
        'team2': team2,
        'team2Flag': team2Flag,
        if (team2FlagUrl != null) 'team2FlagUrl': team2FlagUrl,
        'score1': score1 ?? '0',
        'score2': score2 ?? '0',
        'status': status,
        'statusText': statusText,
        'tournament': tournament,
        if (channelId != null) 'channelId': channelId,
        if (channelIds != null) 'channelIds': channelIds,
        if (startTime != null) 'startTime': startTime,
      };
}
