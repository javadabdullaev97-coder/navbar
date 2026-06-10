import 'package:flutter/material.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

// Записи клиента: предстоящие + история с возможностью оставить отзыв.
class ClientRecordsScreen extends StatefulWidget {
  const ClientRecordsScreen({super.key});

  @override
  State<ClientRecordsScreen> createState() => _ClientRecordsScreenState();
}

class _ClientRecordsScreenState extends State<ClientRecordsScreen> {
  final store = ClientStore.instance;

  Future<void> _leaveReview(ClientAppointment a) async {
    var stars = 5;
    final text = TextEditingController();
    final sent = await showModalBottomSheet<bool>(
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
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${S.yourReview} · ${a.masterName}',
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 14),
              Row(
                children: List.generate(
                  5,
                  (i) => IconButton(
                    onPressed: () => setSheet(() => stars = i + 1),
                    icon: Icon(
                      i < stars ? Icons.star : Icons.star_border,
                      color: AppColors.warning,
                      size: 30,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: text,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: S.notesHint,
                  hintStyle: TextStyle(color: AppColors.textTertiary),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.accentClient,
                    foregroundColor: AppColors.bg,
                  ),
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text(S.send,
                      style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
    if (sent == true) {
      setState(() {
        store.addReview(
          a.masterSlug,
          Review(
            author: _authorName(),
            stars: stars,
            text: text.text.trim(),
            at: DateTime.now(),
          ),
        );
        a.reviewed = true;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(S.reviewThanks)),
        );
      }
    }
    text.dispose();
  }

  String _authorName() {
    final n = ClientStore.instance.myAppointments.isEmpty ? '' : '';
    return n.isEmpty ? 'Вы' : n;
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
                    trailing: a.status == AppointmentStatus.pending
                        ? const Text(S.statusPending,
                            style: TextStyle(
                                fontSize: 11, color: AppColors.warning))
                        : const Text(S.statusConfirmed,
                            style: TextStyle(
                                fontSize: 11,
                                color: AppColors.accentClient)),
                  )),
              const SizedBox(height: 20),
            ],
            const _Title(S.historyTitle),
            if (past.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Text(S.noVisits,
                      style: TextStyle(color: AppColors.textTertiary)),
                ),
              )
            else
              ...past.map((a) => _RecordCard(
                    a: a,
                    trailing: a.reviewed
                        ? const Icon(Icons.star,
                            size: 18, color: AppColors.warning)
                        : TextButton(
                            onPressed: () => _leaveReview(a),
                            child: const Text(S.leaveReview,
                                style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.accentClient)),
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
