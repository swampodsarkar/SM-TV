import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/channel.dart';

class ApiService {
  static const String backupM3UUrl = 'https://da.gd/VaAUn';
  static const String serverUrl = 'http://10.0.2.2:3000';

  static Future<List<Channel>> fetchChannels({String? customM3U}) async {
    List<Channel> data = [];

    try {
      final res = await http
          .get(Uri.parse('$serverUrl/api/channels'))
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        final list = (json is List) ? json : (json['channels'] ?? []);
        data = list.map((e) => Channel.fromJson(e)).toList();
      }
    } catch (_) {}

    if (data.isEmpty) {
      try {
        final m3uRes = await http
            .get(Uri.parse(backupM3UUrl))
            .timeout(const Duration(seconds: 15));
        if (m3uRes.statusCode == 200) {
          data = _parseM3U(m3uRes.body);
        }
      } catch (_) {}
    }

    if (customM3U != null && customM3U.trim().isNotEmpty) {
      final parsed = _parseM3U(customM3U);
      if (parsed.isNotEmpty) {
        data = [...parsed, ...data];
      }
    }

    if (data.isEmpty) {
      data = _getDefaultChannels();
    }

    return data;
  }

  static List<Channel> _parseM3U(String m3u) {
    final channels = <Channel>[];
    final lines = m3u.split('\n');
    int id = 0;
    String? currentMeta;

    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.isEmpty) continue;

      if (trimmed.startsWith('#EXTINF:')) {
        currentMeta = trimmed;
      } else if (!trimmed.startsWith('#') && currentMeta != null) {
        id++;
        final extinf = currentMeta;

        String name = 'Channel $id';
        String logo = '';
        String group = 'Uncategorized';
        String tvgId = '';

        final nameMatch = RegExp(r',(.+)$').firstMatch(extinf);
        if (nameMatch != null) name = nameMatch.group(1)!.trim();

        final logoMatch = RegExp(r'tvg-logo="([^"]*)"').firstMatch(extinf);
        if (logoMatch != null) logo = logoMatch.group(1)!;

        final groupMatch =
            RegExp(r'group-title="([^"]*)"').firstMatch(extinf);
        if (groupMatch != null) group = groupMatch.group(1)!;

        final tvgMatch = RegExp(r'tvg-id="([^"]*)"').firstMatch(extinf);
        if (tvgMatch != null) tvgId = tvgMatch.group(1)!;

        channels.add(Channel(
          id: id.toString(),
          name: name,
          logo: logo,
          group: group,
          url: trimmed,
          tvgId: tvgId,
        ));

        currentMeta = null;
      }
    }
    return channels;
  }

  static List<Channel> _getDefaultChannels() {
    return [
      Channel(
          id: '1',
          name: 'Star Sports 1',
          logo: '',
          group: 'Sports',
          url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          tvgId: 'starsports1'),
      Channel(
          id: '2',
          name: 'News 18',
          logo: '',
          group: 'News',
          url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          tvgId: 'news18'),
    ];
  }
}

class ImgbService {
  static const String apiKey = '213fd215f712156cc6a6ab529469da2f';

  static Future<String?> uploadImage(String base64Image) async {
    try {
      final response = await http.post(
        Uri.parse('https://api.imgbb.com/1/upload?key=$apiKey'),
        body: {'image': base64Image},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data']['url'];
      }
    } catch (_) {}
    return null;
  }
}
