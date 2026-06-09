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

  static const _dowLabels = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    _selectedDay = today;
    _days = List.generate(14, (i) => today.add(Duration(days: i)));
  }

  @override
  Widget build(BuildContext context) {
    final todayAppointments = store.appointmentsOn(DateTime.now());
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
            Text(
              '${S.greeting}, ${store.master.name} 👋',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _StatCard(
                    value: '${todayAppointments.length}',
                    label: S.statToday),
                const SizedBox(width: 10),
                _StatCard(
                    value: formatPrice(
                        store.todayRevenue(), store.master.currencySuffix),
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
                          Text(_dowLabels[(d.weekday - 1) % 7],
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
            if (dayAppointments.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: Text(S.noAppointments,
                      style: TextStyle(color: AppColors.textTertiary)),
                ),
              )
            else
              ...dayAppointments.map((a) => _AppointmentCard(a: a)),
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

  const _AppointmentCard({required this.a});

  @override
  Widget build(BuildContext context) {
    final store = MockStore.instance;
    final client = store.clientById(a.clientId);
    final service = store.serviceById(a.serviceId);
    final pending = a.status == AppointmentStatus.pending;

    return Container(
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
              Text('${service.durationMin} ${S.min}',
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
                Text(service.name,
                    style: const TextStyle(
                        fontSize: 13, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(formatPrice(service.price, store.master.currencySuffix),
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.accentMaster)),
              const SizedBox(height: 4),
              Text(pending ? S.statusPending : S.statusConfirmed,
                  style: TextStyle(
                      fontSize: 11,
                      color: pending
                          ? AppColors.warning
                          : AppColors.textTertiary)),
            ],
          ),
        ],
      ),
    );
  }
}
