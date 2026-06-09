import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = MockStore.instance;
    final pageUrl = 'navbar.uz/${store.master.slug}';

    return Scaffold(
      appBar: AppBar(title: const Text(S.navSettings)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(S.tariffFree,
                      style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(
                      '${store.clients.length}/${MockStore.freeClientsLimit} ${S.statClients}',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.accentMaster,
                        foregroundColor: AppColors.bg,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      // TODO: оплата подписки (Payme/Click/Uzum)
                      onPressed: () {},
                      child: const Text(S.tariffUpgrade,
                          style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _SettingsTile(
              icon: Icons.link,
              title: S.myPage,
              subtitle: pageUrl,
              onTap: () {
                Clipboard.setData(ClipboardData(text: 'https://$pageUrl'));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text(S.linkCopied)),
                );
              },
            ),
            _SettingsTile(
              icon: Icons.person_outline,
              title: S.profile,
              subtitle:
                  '${store.master.name} · ${store.master.specialization}',
              onTap: () {},
            ),
            _SettingsTile(
              icon: Icons.design_services_outlined,
              title: S.myServices,
              subtitle: '${store.services.length}',
              onTap: () {},
            ),
            _SettingsTile(
              icon: Icons.schedule_outlined,
              title: S.workHours,
              subtitle: 'пн–пт 9:00–20:00, сб 10:00–18:00',
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsTile({
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
        leading: Icon(icon, color: AppColors.accentMaster),
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
