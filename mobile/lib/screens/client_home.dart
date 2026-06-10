import 'package:flutter/material.dart';
import '../app_state.dart';
import '../i18n.dart';
import '../theme.dart';
import 'role_select.dart';

// Кабинет клиента — Этап 2 (см. docs/project-brief.md).
class ClientHomeScreen extends StatelessWidget {
  const ClientHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.roleClient)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                S.clientComingSoon,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 15,
                    height: 1.6),
              ),
              const SizedBox(height: 28),
              OutlinedButton.icon(
                icon: const Icon(Icons.swap_horiz,
                    color: AppColors.accentClient),
                label: const Text(S.backToRoleSelect,
                    style: TextStyle(color: AppColors.accentClient)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.accentClient),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 14),
                ),
                onPressed: () async {
                  await AppState.instance.reset();
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
      ),
    );
  }
}
