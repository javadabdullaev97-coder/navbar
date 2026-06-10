import 'package:flutter/material.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

// Флоу записи: услуга → дата → время → подтверждение.
class ClientBookingScreen extends StatefulWidget {
  final MasterPublic master;
  const ClientBookingScreen({super.key, required this.master});

  @override
  State<ClientBookingScreen> createState() => _ClientBookingScreenState();
}

class _ClientBookingScreenState extends State<ClientBookingScreen> {
  final store = ClientStore.instance;
  late final List<DateTime> _days;
  Service? _service;
  DateTime? _day;
  int? _slot;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    _days = List.generate(14, (i) => today.add(Duration(days: i)));
  }

  Future<void> _book() async {
    if (_service == null || _day == null || _slot == null) return;
    final startsAt = DateTime(
        _day!.year, _day!.month, _day!.day, _slot! ~/ 60, _slot! % 60);
    store.book(widget.master, _service!, startsAt);

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: AppColors.bgCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.accentClient.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check,
                    color: AppColors.accentClient, size: 32),
              ),
              const SizedBox(height: 16),
              const Text(S.booked,
                  style:
                      TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                '${_service!.name}\n${formatDate(startsAt)} · ${formatTime(startsAt)}\n${widget.master.name}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.6),
              ),
              const SizedBox(height: 12),
              const Text(S.bookedReminder,
                  style: TextStyle(
                      fontSize: 12, color: AppColors.textTertiary)),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.accentClient,
                    foregroundColor: AppColors.bg,
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text(S.done,
                      style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
    if (mounted) Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final m = widget.master;
    final slots = (_service != null && _day != null)
        ? store.freeSlots(m, _service!, _day!)
        : <int>[];

    return Scaffold(
      appBar: AppBar(title: Text(m.name)),
      bottomNavigationBar: (_service != null && _day != null && _slot != null)
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 54,
                  child: FilledButton(
                    key: const ValueKey('confirm-booking'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.accentClient,
                      foregroundColor: AppColors.bg,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _book,
                    child: Text(
                        '${S.bookFor} · ${formatMinutes(_slot!)}, ${formatDate(_day!)}',
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ),
              ),
            )
          : null,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Шапка мастера
            Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor:
                      AppColors.accentClient.withValues(alpha: 0.12),
                  child: Text(m.name.characters.first,
                      style: const TextStyle(
                          fontSize: 20,
                          color: AppColors.accentClient,
                          fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m.specialization,
                          style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary)),
                      Text(m.address,
                          style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textTertiary)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Услуги
            Text(S.chooseService.toUpperCase(),
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                    color: AppColors.textTertiary)),
            const SizedBox(height: 10),
            ...m.services.map((s) {
              final selected = _service?.id == s.id;
              return GestureDetector(
                onTap: () => setState(() {
                  _service = s;
                  _slot = null;
                }),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: selected
                            ? AppColors.accentClient
                            : AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.name,
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600)),
                            Text('${s.durationMin} ${S.min}',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      Text(
                          formatPrice(s.price,
                              MockStore.instance.currencySuffix),
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: selected
                                  ? AppColors.accentClient
                                  : AppColors.textSecondary)),
                    ],
                  ),
                ),
              );
            }),

            // Дата
            if (_service != null) ...[
              const SizedBox(height: 16),
              Text(S.chooseDate.toUpperCase(),
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1,
                      color: AppColors.textTertiary)),
              const SizedBox(height: 10),
              SizedBox(
                height: 68,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _days.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (context, i) {
                    final d = _days[i];
                    final off =
                        m.schedule[(d.weekday - 1) % 7].isDayOff;
                    final selected = _day == d;
                    return GestureDetector(
                      key: ValueKey('day-$i'),
                      onTap: off
                          ? null
                          : () => setState(() {
                                _day = d;
                                _slot = null;
                              }),
                      child: Container(
                        width: 56,
                        decoration: BoxDecoration(
                          color: AppColors.bgCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: selected
                                  ? AppColors.accentClient
                                  : AppColors.border),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(S.dows[(d.weekday - 1) % 7],
                                style: TextStyle(
                                    fontSize: 11,
                                    color: off
                                        ? AppColors.textTertiary
                                        : selected
                                            ? AppColors.accentClient
                                            : AppColors.textTertiary)),
                            const SizedBox(height: 4),
                            Text('${d.day}',
                                style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: off
                                        ? AppColors.textTertiary
                                        : selected
                                            ? AppColors.accentClient
                                            : AppColors.text)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],

            // Время
            if (_service != null && _day != null) ...[
              const SizedBox(height: 16),
              Text(S.chooseTime.toUpperCase(),
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1,
                      color: AppColors.textTertiary)),
              const SizedBox(height: 10),
              if (slots.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text(S.noSlots,
                      style: TextStyle(color: AppColors.textTertiary)),
                )
              else
                GridView.count(
                  crossAxisCount: 4,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 2.1,
                  children: slots.map((t) {
                    final selected = _slot == t;
                    return OutlinedButton(
                      key: ValueKey('slot-$t'),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        backgroundColor: AppColors.bgCard,
                        side: BorderSide(
                            color: selected
                                ? AppColors.accentClient
                                : AppColors.border),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => setState(() => _slot = t),
                      child: Text(formatMinutes(t),
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: selected
                                  ? FontWeight.w700
                                  : FontWeight.w400,
                              color: selected
                                  ? AppColors.accentClient
                                  : AppColors.text)),
                    );
                  }).toList(),
                ),
              const SizedBox(height: 80),
            ],
          ],
        ),
      ),
    );
  }
}
