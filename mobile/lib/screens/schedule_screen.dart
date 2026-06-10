import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';
import 'add_appointment.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  final store = MockStore.instance;
  late DateTime _selectedDay;
  late List<DateTime> _days;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    _selectedDay = today;
    _days = List.generate(14, (i) => today.add(Duration(days: i)));
  }

  void _openActions(Appointment a) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final client = store.clientById(a.clientId);
        final service = store.serviceById(a.serviceId);
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 16),
              Text('${client.name} · ${service?.name ?? ''}',
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
              Text('${formatTime(a.startsAt)}, ${formatDate(a.startsAt)}',
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              if (a.status == AppointmentStatus.pending)
                ListTile(
                  leading: const Icon(Icons.check_circle_outline,
                      color: AppColors.accentMaster),
                  title: const Text(S.actionConfirm),
                  onTap: () {
                    setState(() =>
                        store.setStatus(a, AppointmentStatus.confirmed));
                    Navigator.pop(ctx);
                  },
                ),
              if (a.status == AppointmentStatus.pending ||
                  a.status == AppointmentStatus.confirmed) ...[
                ListTile(
                  leading: const Icon(Icons.task_alt,
                      color: AppColors.accentMaster),
                  title: const Text(S.actionDone),
                  onTap: () {
                    setState(
                        () => store.setStatus(a, AppointmentStatus.done));
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading:
                      const Icon(Icons.close, color: AppColors.warning),
                  title: const Text(S.actionCancel),
                  onTap: () {
                    setState(() =>
                        store.setStatus(a, AppointmentStatus.cancelled));
                    Navigator.pop(ctx);
                  },
                ),
              ],
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  // Мастер блокирует время под свои дела — клиенты эти слоты не видят
  Future<void> _blockSlotDialog() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDay,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 60)),
    );
    if (date == null || !mounted) return;
    final start = await showTimePicker(
        context: context, initialTime: const TimeOfDay(hour: 13, minute: 0));
    if (start == null || !mounted) return;
    final end = await showTimePicker(
        context: context, initialTime: const TimeOfDay(hour: 14, minute: 0));
    if (end == null) return;
    setState(() {
      store.blockSlot(
          date, start.hour * 60 + start.minute, end.hour * 60 + end.minute);
    });
  }

  @override
  Widget build(BuildContext context) {
    final blocked = store.blockedOn(_selectedDay);
    final todayAppointments = store
        .appointmentsOn(DateTime.now())
        .where((a) => a.status != AppointmentStatus.cancelled)
        .toList();
    final dayAppointments = store.appointmentsOn(_selectedDay);

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final added = await Navigator.of(context).push<bool>(
            MaterialPageRoute(builder: (_) => const AddAppointmentScreen()),
          );
          if (added == true) setState(() {});
        },
        child: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${S.greeting}, ${store.masterName} 👋',
                    style: const TextStyle(
                        fontSize: 24, fontWeight: FontWeight.w800),
                  ),
                ),
                IconButton(
                  tooltip: S.blockSlotTitle,
                  onPressed: _blockSlotDialog,
                  icon: const Icon(Icons.lock_clock,
                      color: AppColors.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _StatCard(
                    value: '${todayAppointments.length}', label: S.statToday),
                const SizedBox(width: 10),
                _StatCard(
                    value:
                        formatPrice(store.todayRevenue(), store.currencySuffix),
                    label: S.statRevenue),
                const SizedBox(width: 10),
                _StatCard(
                    value: '${store.clients.length}', label: S.statClients),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 68,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _days.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final d = _days[i];
                  final selected = d == _selectedDay;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDay = d),
                    child: Container(
                      width: 56,
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: selected
                                ? AppColors.accentMaster
                                : AppColors.border),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(S.dows[(d.weekday - 1) % 7],
                              style: TextStyle(
                                  fontSize: 11,
                                  color: selected
                                      ? AppColors.accentMaster
                                      : AppColors.textTertiary)),
                          const SizedBox(height: 4),
                          Text('${d.day}',
                              style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: selected
                                      ? AppColors.accentMaster
                                      : AppColors.text)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            ...blocked.map((b) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: AppColors.warning.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.lock_clock,
                          size: 18, color: AppColors.warning),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                            '${S.blockedLabel} · ${formatMinutes(b.startMin)}–${formatMinutes(b.endMin)}',
                            style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary)),
                      ),
                      TextButton(
                        onPressed: () =>
                            setState(() => store.unblockSlot(b)),
                        child: const Text(S.unblock,
                            style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textTertiary)),
                      ),
                    ],
                  ),
                )),
            if (dayAppointments.isEmpty && blocked.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: Text(S.noAppointments,
                      style: TextStyle(color: AppColors.textTertiary)),
                ),
              )
            else
              ...dayAppointments.map((a) => _AppointmentCard(
                  a: a, onTap: () => _openActions(a))),
            const SizedBox(height: 72),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;

  const _StatCard({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            FittedBox(
              child: Text(value,
                  style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.accentMaster)),
            ),
            const SizedBox(height: 4),
            Text(label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 10, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final Appointment a;
  final VoidCallback onTap;

  const _AppointmentCard({required this.a, required this.onTap});

  (String, Color) get _statusView => switch (a.status) {
        AppointmentStatus.pending => (S.statusPending, AppColors.warning),
        AppointmentStatus.confirmed =>
          (S.statusConfirmed, AppColors.textTertiary),
        AppointmentStatus.done => (S.statusDone, AppColors.accentMaster),
        AppointmentStatus.cancelled =>
          (S.statusCancelled, AppColors.textTertiary),
      };

  @override
  Widget build(BuildContext context) {
    final store = MockStore.instance;
    final client = store.clientById(a.clientId);
    final service = store.serviceById(a.serviceId);
    final cancelled = a.status == AppointmentStatus.cancelled;
    final (statusLabel, statusColor) = _statusView;

    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: cancelled ? 0.45 : 1,
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Column(
                children: [
                  Text(formatTime(a.startsAt),
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                  Text('${service?.durationMin ?? 0} ${S.min}',
                      style: const TextStyle(
                          fontSize: 11, color: AppColors.textTertiary)),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(client.name,
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(service?.name ?? '',
                        style: const TextStyle(
                            fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                      formatPrice(
                          service?.price ?? 0, store.currencySuffix),
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accentMaster)),
                  const SizedBox(height: 4),
                  Text(statusLabel,
                      style: TextStyle(fontSize: 11, color: statusColor)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
