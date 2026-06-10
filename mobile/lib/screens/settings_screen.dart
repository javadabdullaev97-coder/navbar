import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../app_state.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';
import 'onboarding.dart';
import 'role_select.dart';
import 'services_screen.dart';
import 'work_hours_screen.dart';

// Тестовое включение Про — реальная оплата (Payme/Click) придёт позже
// и будет идти через веб-страницу, не через покупки в маркетах.
Future<void> showUpgradeDialog(BuildContext context) async {
  final app = AppState.instance;
  final enable = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      backgroundColor: AppColors.bgCard,
      title: const Text(S.tariffMockTitle),
      content: const Text(S.tariffMockText,
          style: TextStyle(color: AppColors.textSecondary, height: 1.5)),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text(S.cancel,
              style: TextStyle(color: AppColors.textSecondary)),
        ),
        FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.accentMaster,
            foregroundColor: AppColors.bg,
          ),
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text(S.tariffMockEnable),
        ),
      ],
    ),
  );
  if (enable == true) {
    app.isPro = true;
    await app.save();
  }
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final store = MockStore.instance;

  @override
  Widget build(BuildContext context) {
    final app = AppState.instance;
    final pageUrl = 'navbar.uz/${store.masterSlug}';

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
                border: Border.all(
                    color: app.isPro
                        ? AppColors.accentMaster
                        : AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(app.isPro ? S.tariffPro : S.tariffFree,
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: app.isPro
                              ? AppColors.accentMaster
                              : AppColors.text)),
                  const SizedBox(height: 6),
                  Text(
                      '${store.clients.length}/${MockStore.freeClientsLimit} ${S.statClients}',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: app.isPro
                        ? OutlinedButton(
                            onPressed: () async {
                              app.isPro = false;
                              await app.save();
                              setState(() {});
                            },
                            child: const Text(S.tariffDisable,
                                style: TextStyle(
                                    color: AppColors.textSecondary)),
                          )
                        : FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.accentMaster,
                              foregroundColor: AppColors.bg,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                            ),
                            onPressed: () async {
                              await showUpgradeDialog(context);
                              setState(() {});
                            },
                            child: const Text(S.tariffUpgrade,
                                style: TextStyle(
                                    fontWeight: FontWeight.w700)),
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
              subtitle: '${store.masterName} · ${store.masterSpec}',
              onTap: () async {
                await Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) =>
                        const ProfileSetupScreen(editMode: true)));
                setState(() {});
              },
            ),
            _SettingsTile(
              icon: Icons.design_services_outlined,
              title: S.myServices,
              subtitle: '${store.services.length}',
              onTap: () async {
                await Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const ServicesScreen()));
                setState(() {});
              },
            ),
            _SettingsTile(
              icon: Icons.schedule_outlined,
              title: S.workHours,
              subtitle: _scheduleSummary(),
              onTap: () async {
                await Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => const WorkHoursScreen()));
                setState(() {});
              },
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () async {
                await AppState.instance.reset();
                if (!context.mounted) return;
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(
                      builder: (_) => const RoleSelectScreen()),
                  (_) => false,
                );
              },
              child: const Text(S.logout,
                  style: TextStyle(color: AppColors.textTertiary)),
            ),
          ],
        ),
      ),
    );
  }

  String _scheduleSummary() {
    final working =
        store.schedule.where((d) => !d.isDayOff).toList();
    if (working.isEmpty) return S.dayOff;
    final first = working.first;
    return '${S.dows[working.first.dayOfWeek]}–${S.dows[working.last.dayOfWeek]} '
        '${formatMinutes(first.startMin)}–${formatMinutes(first.endMin)}';
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
