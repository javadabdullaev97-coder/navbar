import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

class AddAppointmentScreen extends StatefulWidget {
  const AddAppointmentScreen({super.key});

  @override
  State<AddAppointmentScreen> createState() => _AddAppointmentScreenState();
}

class _AddAppointmentScreenState extends State<AddAppointmentScreen> {
  final store = MockStore.instance;
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController(text: '+998 ');
  Service? _service;
  DateTime _date = DateTime.now();
  TimeOfDay _time = const TimeOfDay(hour: 12, minute: 0);

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 60)),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(context: context, initialTime: _time);
    if (picked != null) setState(() => _time = picked);
  }

  void _save() {
    if (_nameCtrl.text.trim().length < 2 || _service == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(S.fillAllFields)),
      );
      return;
    }
    final client = store.getOrCreateClient(
        _nameCtrl.text.trim(), _phoneCtrl.text.replaceAll(' ', ''));
    store.addAppointment(
      client: client,
      service: _service!,
      startsAt: DateTime(
          _date.year, _date.month, _date.day, _time.hour, _time.minute),
    );
    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.newAppointment)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(S.clientName,
              style:
                  const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(controller: _nameCtrl),
          const SizedBox(height: 16),
          Text(S.clientPhone,
              style:
                  const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          TextField(controller: _phoneCtrl, keyboardType: TextInputType.phone),
          const SizedBox(height: 16),
          Text(S.service,
              style:
                  const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          ...store.services.map((s) {
            final selected = _service?.id == s.id;
            return GestureDetector(
              onTap: () => setState(() => _service = s),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: selected
                          ? AppColors.accentMaster
                          : AppColors.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text('${s.name} · ${s.durationMin} ${S.min}',
                          style: const TextStyle(fontSize: 14)),
                    ),
                    Text(
                        formatPrice(s.price, store.currencySuffix),
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: selected
                                ? AppColors.accentMaster
                                : AppColors.textSecondary)),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _PickerTile(
                  label: S.date,
                  value:
                      '${_date.day.toString().padLeft(2, '0')}.${_date.month.toString().padLeft(2, '0')}.${_date.year}',
                  onTap: _pickDate,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _PickerTile(
                  label: S.time,
                  value:
                      '${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}',
                  onTap: _pickTime,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 54,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accentMaster,
                foregroundColor: AppColors.bg,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _save,
              child: const Text(S.save,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}

class _PickerTile extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;

  const _PickerTile(
      {required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 11, color: AppColors.textTertiary)),
            const SizedBox(height: 4),
            Text(value,
                style: const TextStyle(
                    fontSize: 15, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
