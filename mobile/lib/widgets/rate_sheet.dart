import 'package:flutter/material.dart';
import '../i18n.dart';
import '../theme.dart';

/// Шторка оценки «как в Яндексе»: крупные звёзды, опциональный текст.
/// Возвращает (звёзды, текст) или null, если закрыли.
Future<(int, String)?> showRateSheet(
  BuildContext context, {
  required String title,
  String? subtitle,
  bool withText = true,
  Color accent = AppColors.accentClient,
}) {
  var stars = 0;
  final text = TextEditingController();
  return showModalBottomSheet<(int, String)?>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.bgCard,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setSheet) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w800)),
            if (subtitle != null) ...[
              const SizedBox(height: 6),
              Text(subtitle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textSecondary)),
            ],
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                5,
                (i) => GestureDetector(
                  onTap: () => setSheet(() => stars = i + 1),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Icon(
                      i < stars ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: AppColors.warning,
                      size: 44,
                    ),
                  ),
                ),
              ),
            ),
            if (withText && stars > 0) ...[
              const SizedBox(height: 16),
              TextField(
                controller: text,
                maxLines: 2,
                decoration: const InputDecoration(
                  hintText: S.notesHint,
                  hintStyle: TextStyle(color: AppColors.textTertiary),
                ),
              ),
            ],
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: accent,
                  foregroundColor: AppColors.bg,
                  disabledBackgroundColor: AppColors.border,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: stars == 0
                    ? null
                    : () => Navigator.pop(ctx, (stars, text.text.trim())),
                child: const Text(S.send,
                    style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text(S.later,
                  style: TextStyle(
                      fontSize: 13, color: AppColors.textTertiary)),
            ),
          ],
        ),
      ),
    ),
  );
}

/// Строка из звёзд для отображения рейтинга
class Stars extends StatelessWidget {
  final double value;
  final double size;
  const Stars({super.key, required this.value, this.size = 14});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, size: size, color: AppColors.warning),
        const SizedBox(width: 2),
        Text(value.toStringAsFixed(1),
            style: TextStyle(
                fontSize: size - 1, fontWeight: FontWeight.w700)),
      ],
    );
  }
}
