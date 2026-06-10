import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

class WorkHoursScreen extends StatefulWidget {
  const WorkHoursScreen({super.key});

  @override
  State<WorkHoursScreen> createState() => _WorkHoursScreenState();
}

class _WorkHoursScreenState extends State<WorkHoursScreen> {
  final store = MockStore.instance;

  Future<void> _pickTime(ScheduleDay day, bool isStart) async {
    final initial = isStart ? day.startMin : day.endMin;
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: initial ~/ 60, minute: initial % 60),
    );
    if (picked == null) return;
    setState(() {
      final min = picked.hour * 60 + picked.minute;
      if (isStart) {
        day.startMin = min;
      } else {
        day.endMin = min;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.workHours)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: store.schedule.map((d) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: 110,
                    child: Text(S.dowsFull[d.dayOfWeek],
                        style: const TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w600)),
                  ),
                  Expanded(
                    child: d.isDayOff
                        ? const Text(S.dayOff,
                            style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textTertiary))
                        : Row(
                            children: [
                              _TimeChip(
                                  label: formatMinutes(d.startMin),
                                  onTap: () => _pickTime(d, true)),
                              const Padding(
                                padding:
                                    EdgeInsets.symmetric(horizontal: 6),
                                child: Text('—',
                                    style: TextStyle(
                                        color: AppColors.textTertiary)),
                              ),
                              _TimeChip(
                                  label: formatMinutes(d.endMin),
                                  onTap: () => _pickTime(d, false)),
                            ],
                          ),
                  ),
                  Switch(
                    value: !d.isDayOff,
                    activeThumbColor: AppColors.accentMaster,
                    onChanged: (v) => setState(() {
                      d.isDayOff = !v;
                      if (v && d.startMin == 0 && d.endMin == 0) {
                        d.startMin = 9 * 60;
                        d.endMin = 20 * 60;
                      }
                    }),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _TimeChip({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Text(label,
            style: const TextStyle(
                fontSize: 14, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
