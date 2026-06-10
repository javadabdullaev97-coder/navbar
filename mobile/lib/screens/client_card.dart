import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

class ClientCardScreen extends StatefulWidget {
  final Client client;
  const ClientCardScreen({super.key, required this.client});

  @override
  State<ClientCardScreen> createState() => _ClientCardScreenState();
}

class _ClientCardScreenState extends State<ClientCardScreen> {
  final store = MockStore.instance;
  late final _notes = TextEditingController(text: widget.client.notes);

  @override
  void dispose() {
    widget.client.notes = _notes.text;
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.client;
    final visits = store.visitsOf(c.id);

    return Scaffold(
      appBar: AppBar(title: Text(c.name)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor:
                      AppColors.accentMaster.withValues(alpha: 0.12),
                  child: Text(c.name.characters.first,
                      style: const TextStyle(
                          fontSize: 22,
                          color: AppColors.accentMaster,
                          fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c.name,
                        style: const TextStyle(
                            fontSize: 19, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(c.phone,
                        style: const TextStyle(
                            fontSize: 14, color: AppColors.textSecondary)),
                    const SizedBox(height: 2),
                    Text('${c.visitCount} ${S.visits}',
                        style: const TextStyle(
                            fontSize: 13, color: AppColors.textTertiary)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text(S.notes,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textTertiary)),
            const SizedBox(height: 10),
            TextField(
              controller: _notes,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: S.notesHint,
                hintStyle: TextStyle(color: AppColors.textTertiary),
              ),
            ),
            const SizedBox(height: 24),
            const Text(S.visitHistory,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textTertiary)),
            const SizedBox(height: 10),
            if (visits.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Text(S.noVisits,
                      style: TextStyle(color: AppColors.textTertiary)),
                ),
              )
            else
              ...visits.map((a) {
                final service = store.serviceById(a.serviceId);
                final done = a.status == AppointmentStatus.done;
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
                      Icon(done ? Icons.check : Icons.schedule,
                          size: 18,
                          color: done
                              ? AppColors.accentMaster
                              : AppColors.textTertiary),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(service?.name ?? '',
                            style: const TextStyle(fontSize: 14)),
                      ),
                      Text(
                          '${formatDate(a.startsAt)} ${formatTime(a.startsAt)}',
                          style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary)),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
