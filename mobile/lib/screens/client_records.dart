import 'package:flutter/material.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';
import '../widgets/rate_sheet.dart';
import 'master_profile.dart';

// Записи клиента: предстоящие + история с возможностью оставить отзыв.
class ClientRecordsScreen extends StatefulWidget {
  const ClientRecordsScreen({super.key});

  @override
  State<ClientRecordsScreen> createState() => _ClientRecordsScreenState();
}

class _ClientRecordsScreenState extends State<ClientRecordsScreen> {
  final store = ClientStore.instance;

  Future<void> _leaveReview(ClientAppointment a) async {
    final result = await showRateSheet(
      context,
      title: S.rateVisitTitle,
      subtitle: '${a.serviceName} · ${a.masterName}',
    );
    if (result == null) return;
    final (stars, text) = result;
    setState(() {
      store.addReview(
        a.masterSlug,
        Review(author: 'Вы', stars: stars, text: text, at: DateTime.now()),
      );
      a.reviewed = true;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(S.reviewThanks)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final future = store.myAppointments
        .where((a) =>
            a.startsAt.isAfter(now) &&
            a.status != AppointmentStatus.cancelled)
        .toList()
      ..sort((a, b) => a.startsAt.compareTo(b.startsAt));
    final past = store.history;

    return Scaffold(
      appBar: AppBar(title: const Text(S.historyTitle)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (future.isNotEmpty) ...[
              const _Title(S.upcoming),
              ...future.map((a) => _RecordCard(
                    a: a,
                    trailing: StatusChip(status: a.status),
                  )),
              const SizedBox(height: 20),
            ],
            const _Title(S.historyTitle),
            if (past.isEmpty)
              const EmptyState(
                icon: Icons.event_available,
                text: S.noVisitsClient,
                accent: AppColors.accentClient,
              )
            else
              ...past.map((a) => _RecordCard(
                    a: a,
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        a.reviewed
                            ? const Padding(
                                padding: EdgeInsets.all(8),
                                child: Icon(Icons.star,
                                    size: 18, color: AppColors.warning),
                              )
                            : TextButton(
                                onPressed: () => _leaveReview(a),
                                child: const Text(S.leaveReview,
                                    style: TextStyle(
                                        fontSize: 13,
                                        color: AppColors.accentClient)),
                              ),
                        IconButton(
                          tooltip: S.repeatBooking,
                          icon: const Icon(Icons.replay,
                              size: 18, color: AppColors.textSecondary),
                          onPressed: () async {
                            await Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (_) => MasterProfileScreen(
                                        slug: a.masterSlug)));
                            setState(() {});
                          },
                        ),
                      ],
                    ),
                  )),
          ],
        ),
      ),
    );
  }
}

class _RecordCard extends StatelessWidget {
  final ClientAppointment a;
  final Widget trailing;
  const _RecordCard({required this.a, required this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(a.serviceName,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(
                    '${a.masterName} · ${formatDate(a.startsAt)} ${formatTime(a.startsAt)}',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }
}

class _Title extends StatelessWidget {
  final String text;
  const _Title(this.text);

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
