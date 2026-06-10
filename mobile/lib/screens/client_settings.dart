import 'package:flutter/material.dart';
import '../app_state.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';
import 'role_select.dart';
import 'settings_screen.dart' show kLangNames, showLanguagePicker;

class ClientSettingsScreen extends StatelessWidget {
  const ClientSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = AppState.instance;

    return Scaffold(
      appBar: AppBar(title: const Text(S.navSettings)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _Tile(
              icon: Icons.person_outline,
              title: S.clientProfile,
              subtitle:
                  '${app.name.isEmpty ? '—' : app.name} · ${app.phone}',
              onTap: () {},
            ),
            _Tile(
              icon: Icons.send_outlined,
              title: S.connectTelegram,
              subtitle: S.connectTelegramDesc,
              onTap: () {
                // TODO: интеграция Telegram-бота (этап внешних подключений)
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text(S.stubExternal)),
                );
              },
            ),
            Builder(builder: (context) {
              // Свой средний балл (анонимные оценки мастеров).
              // В мок-режиме ищем себя по номеру телефона.
              final me = MockStore.instance.clients
                  .where((c) => c.phone == app.phone)
                  .toList();
              final rating = me.isEmpty ? null : me.first.rating;
              return _Tile(
                icon: Icons.star_outline,
                title: S.yourRating,
                subtitle: rating == null
                    ? S.noRatingYet
                    : '★ ${rating.toStringAsFixed(1)} · ${S.yourRatingDesc}',
                onTap: () {},
              );
            }),
            _LangTile(),
            _Tile(
              icon: Icons.swap_horiz,
              title: S.changeRole,
              subtitle: S.roleClient,
              onTap: () async {
                await app.reset();
                if (!context.mounted) return;
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(
                      builder: (_) => const RoleSelectScreen()),
                  (_) => false,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _LangTile extends StatefulWidget {
  @override
  State<_LangTile> createState() => _LangTileState();
}

class _LangTileState extends State<_LangTile> {
  @override
  Widget build(BuildContext context) {
    return _Tile(
      icon: Icons.language,
      title: S.language,
      subtitle: kLangNames[AppState.instance.lang] ?? AppState.instance.lang,
      onTap: () async {
        await showLanguagePicker(context);
        setState(() {});
      },
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _Tile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: AppColors.accentClient),
        title: Text(title,
            style:
                const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle,
            style: const TextStyle(
                fontSize: 13, color: AppColors.textSecondary)),
        trailing:
            const Icon(Icons.chevron_right, color: AppColors.textTertiary),
      ),
    );
  }
}
