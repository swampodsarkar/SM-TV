class Channel {
  final String id;
  final String name;
  final String logo;
  final String group;
  final String url;
  final String tvgId;
  bool healthy;
  int? latencyMs;

  Channel({
    required this.id,
    required this.name,
    required this.logo,
    required this.group,
    required this.url,
    required this.tvgId,
    this.healthy = false,
    this.latencyMs,
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      logo: json['logo']?.toString() ?? '',
      group: json['group']?.toString() ?? 'Uncategorized',
      url: json['url']?.toString() ?? '',
      tvgId: json['tvgId']?.toString() ?? '',
      healthy: json['healthy'] == true,
      latencyMs: int.tryParse(json['latencyMs']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'logo': logo,
        'group': group,
        'url': url,
        'tvgId': tvgId,
        'healthy': healthy,
        'latencyMs': latencyMs,
      };
}
