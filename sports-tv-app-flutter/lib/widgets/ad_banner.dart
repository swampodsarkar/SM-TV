import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';

class AdBannerWidget extends StatelessWidget {
  const AdBannerWidget({super.key});

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) return const SizedBox.shrink();
    try {
      return const _AdBanner();
    } catch (_) {
      return const SizedBox.shrink();
    }
  }
}

class _AdBanner extends StatefulWidget {
  const _AdBanner();

  @override
  State<_AdBanner> createState() => _AdBannerState();
}

class _AdBannerState extends State<_AdBanner> {
  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
