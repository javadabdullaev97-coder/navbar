import 'package:flutter/material.dart';

// Дизайн-токены из docs/project-brief.md
class AppColors {
  static const bg = Color(0xFF0A0A0A);
  static const bgCard = Color(0xFF0F0F0F);
  static const accentMaster = Color(0xFFA8FF78);
  static const accentClient = Color(0xFF78B4FF);
  static const text = Color(0xFFFFFFFF);
  static const textSecondary = Color(0x73FFFFFF); // 45%
  static const textTertiary = Color(0x40FFFFFF); // 25%
  static const border = Color(0x17FFFFFF); // ~9%
  static const warning = Color(0xFFFFC850);
}

ThemeData buildTheme() {
  return ThemeData(
    brightness: Brightness.dark,
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
