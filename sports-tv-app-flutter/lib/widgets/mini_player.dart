import 'package:flutter/material.dart';
import '../models/channel.dart';

class MiniPlayer extends StatelessWidget {
  final Channel channel;
  final VoidCallback? onTap;
  final VoidCallback? onClose;

  const MiniPlayer({
    super.key,
    required this.channel,
    this.onTap,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 64,
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.5),
              blurRadius: 12,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 80,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: const BorderRadius.horizontal(
                    left: Radius.circular(12)),
              ),
              child: const Center(
                child: Icon(Icons.play_circle_outline,
                    color: Color(0xFF06B6D4), size: 28),
              ),
            ),
            const SizedBox(width: 12),
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
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Text(
                    'Now Playing',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Color(0xFF94A3B8), size: 20),
              onPressed: onClose,
            ),
          ],
        ),
      ),
    );
  }
}
