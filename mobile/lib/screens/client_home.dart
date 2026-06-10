import 'package:flutter/material.dart';
import '../app_state.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';
import 'client_booking.dart';

class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  final store = ClientStore.instance;

  Future<void> _openBooking(MasterPublic m) async {
    final booked = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => ClientBookingScreen(master: m)),
    );
    if (booked == true) setState(() {});
  }

  void _confirmCancel(ClientAppointment a) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: const Text(S.cancelBookingQ),
        content: Text(
            '${a.serviceName} · ${formatDate(a.startsAt)} ${formatTime(a.startsAt)}',
            style: const TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(S.keepBooking,
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () {
              setState(() => store.cancel(a));
              Navigator.pop(ctx);
            },
            child: const Text(S.yesCancel,
                style: TextStyle(color: AppColors.warning)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = AppState.instance.name;
    final upcoming = store.upcoming;
    final history = store.history;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              name.isEmpty ? '${S.greeting} 👋' : '${S.greeting}, $name 👋',
              style:
                  const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 20),

            // Ближайшая запись
            const _SectionTitle(S.upcoming),
            if (upcoming == null)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Text(S.noUpcoming,
                    style: TextStyle(
                        color: AppColors.textTertiary, fontSize: 14)),
              )
            else
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.accentClient),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(upcoming.serviceName,
                              style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700)),
                        ),
                        Text(
                            formatPrice(upcoming.price,
                                MockStore.instance.currencySuffix),
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentClient)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _InfoRow(
                        icon: Icons.person_outline,
                        text: upcoming.masterName),
                    _InfoRow(
                        icon: Icons.event,
                        text:
                            '${formatDate(upcoming.startsAt)} · ${formatTime(upcoming.startsAt)}'),
                    _InfoRow(
                        icon: Icons.place_outlined,
                        text: upcoming.masterAddress),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => _confirmCancel(upcoming),
                        child: const Text(S.cancelBooking,
                            style: TextStyle(
                                color: AppColors.textTertiary,
                                fontSize: 13)),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Мои мастера
            const _SectionTitle(S.myMasters),
            ...store.masters.map((m) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor:
                            AppColors.accentClient.withValues(alpha: 0.12),
                        child: Text(m.name.characters.first,
                            style: const TextStyle(
                                fontSize: 18,
                                color: AppColors.accentClient,
                                fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(m.name,
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(m.specialization,
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.accentClient,
                          foregroundColor: AppColors.bg,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => _openBooking(m),
                        child: const Text(S.bookBtn,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                )),
            const SizedBox(height: 24),

            // История
            const _SectionTitle(S.historyTitle),
            if (history.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text(S.noVisits,
                    style: TextStyle(color: AppColors.textTertiary)),
              )
            else
              ...history.map((a) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check,
                            size: 18, color: AppColors.accentClient),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(a.serviceName,
                                  style: const TextStyle(fontSize: 14)),
                              Text(a.masterName,
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        Text(formatDate(a.startsAt),
                            style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary)),
                      ],
                    ),
                  )),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(text.toUpperCase(),
          style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
              color: AppColors.textTertiary)),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text,
                style: const TextStyle(
                    fontSize: 14, color: AppColors.textSecondary)),
          ),
        ],
      ),
    );
  }
}
