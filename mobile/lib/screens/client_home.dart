import 'package:flutter/material.dart';
import '../i18n.dart';
import '../theme.dart';

// Кабинет клиента — Этап 2 (см. docs/project-brief.md).
class ClientHomeScreen extends StatelessWidget {
  const ClientHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.roleClient)),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            S.clientComingSoon,
            textAlign: TextAlign.center,
            style: TextStyle(
                color: AppColors.textSecondary, fontSize: 15, height: 1.6),
          ),
        ),
      ),
    );
  }
}
