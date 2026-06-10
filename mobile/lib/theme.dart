import 'package:flutter/material.dart';
import 'models.dart';
import 'i18n.dart';

// Дизайн-токены из docs/project-brief.md
class AppColors {
  static const bg = Color(0xFF0A0A0A);
  static const bgCard = Color(0xFF0F0F0F);
  static const accentMaster = Color(0xFFA8FF78);
  static const accentClient = Color(0xFF78B4FF);
  static const text = Color(0xFFFFFFFF);
  static const textSecondary = Color(0x8CFFFFFF); // 55% — контраст мелкого текста
  static const textTertiary = Color(0x59FFFFFF); // 35%
  static const border = Color(0x17FFFFFF); // ~9%
  static const warning = Color(0xFFFFC850);

  // Палитра аватаров — цвет стабильно зависит от имени
  static const avatarPalette = [
    Color(0xFFA8FF78),
    Color(0xFF78B4FF),
    Color(0xFFFFC850),
    Color(0xFFFF9E78),
    Color(0xFFCE78FF),
    Color(0xFF78FFD4),
  ];
}

Color avatarColor(String name) =>
    AppColors.avatarPalette[name.hashCode.abs() % AppColors.avatarPalette.length];

ThemeData buildTheme() {
  return ThemeData(
    brightness: Brightness.dark,
    fontFamily: 'Manrope',
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.accentMaster,
      surface: AppColors.bgCard,
      onPrimary: AppColors.bg,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bg,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontFamily: 'Manrope',
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppColors.text,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.bgCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bgCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.accentMaster),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.bgCard,
      selectedItemColor: AppColors.accentMaster,
      unselectedItemColor: AppColors.textTertiary,
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: AppColors.accentMaster,
      foregroundColor: AppColors.bg,
    ),
  );
}

// --- Общие виджеты ---

/// Логотип nav|bar для шапок экранов
class BrandLogo extends StatelessWidget {
  final double size;
  const BrandLogo({super.key, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: size,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.text),
        children: const [
          TextSpan(text: 'nav'),
          TextSpan(
              text: 'bar',
              style: TextStyle(color: AppColors.accentMaster)),
        ],
      ),
    );
  }
}

/// Цветной бейдж статуса записи
class StatusChip extends StatelessWidget {
  final AppointmentStatus status;
  const StatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      AppointmentStatus.pending => (S.statusPending, AppColors.warning),
      AppointmentStatus.confirmed =>
        (S.statusConfirmed, AppColors.accentMaster),
      AppointmentStatus.done => (S.statusDone, AppColors.accentClient),
      AppointmentStatus.cancelled =>
        (S.statusCancelled, AppColors.textTertiary),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: TextStyle(fontSize: 10.5, color: color)),
    );
  }
}

/// Пустое состояние с действием
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String text;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Color accent;

  const EmptyState({
    super.key,
    required this.icon,
    required this.text,
    this.actionLabel,
    this.onAction,
    this.accent = AppColors.accentMaster,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: accent.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: accent.withValues(alpha: 0.7), size: 28),
          ),
          const SizedBox(height: 14),
          Text(text,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.5)),
          if (actionLabel != null) ...[
            const SizedBox(height: 16),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: accent,
                foregroundColor: AppColors.bg,
              ),
              onPressed: onAction,
              child: Text(actionLabel!,
                  style: const TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }
}
