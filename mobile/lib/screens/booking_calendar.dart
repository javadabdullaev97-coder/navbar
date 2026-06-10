import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

// Календарь месяца: прошедшие дни и выходные неактивны,
// полностью занятые дни (под суммарную длительность услуг) — жёлтым.
class BookingCalendarScreen extends StatefulWidget {
  final String slug;
  final List<Service> services;
  const BookingCalendarScreen(
      {super.key, required this.slug, required this.services});

  @override
  State<BookingCalendarScreen> createState() => _BookingCalendarScreenState();
}

class _BookingCalendarScreenState extends State<BookingCalendarScreen> {
  final store = ClientStore.instance;
  late DateTime _month; // первый день показанного месяца
  DateTime? _day;
  int? _slot;

  MasterPublic get m => store.bySlug(widget.slug);
  int get _totalMin =>
      widget.services.fold(0, (a, s) => a + s.durationMin);
  int get _totalPrice => widget.services.fold(0, (a, s) => a + s.price);

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month, 1);
  }

  bool get _canGoPrev {
    final now = DateTime.now();
    return _month.isAfter(DateTime(now.year, now.month, 1));
  }

  void _shiftMonth(int delta) {
    setState(() {
      _month = DateTime(_month.year, _month.month + delta, 1);
      _day = null;
      _slot = null;
    });
  }

  Future<void> _confirm() async {
    if (_day == null || _slot == null) return;
    final startsAt = DateTime(
        _day!.year, _day!.month, _day!.day, _slot! ~/ 60, _slot! % 60);

    // Клиент не может быть у двух мастеров одновременно
    final conflict = store.conflictWithMine(startsAt, _totalMin);
    if (conflict != null) {
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.bgCard,
          title: const Text(S.conflictTitle),
          content: Text(
            S.conflictText.replaceAll('{что}',
                '${conflict.masterName}, ${formatDate(conflict.startsAt)} ${formatTime(conflict.startsAt)}'),
            style: const TextStyle(
                color: AppColors.textSecondary, height: 1.5),
          ),
          actions: [
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accentClient,
                foregroundColor: AppColors.bg,
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text(S.ok),
            ),
          ],
        ),
      );
      return;
    }

    store.book(m, widget.services, startsAt);
    HapticFeedback.mediumImpact();
    if (!mounted) return;
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
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.4, end: 1),
                duration: const Duration(milliseconds: 450),
                curve: Curves.elasticOut,
                builder: (_, v, child) =>
                    Transform.scale(scale: v, child: child),
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.accentClient.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.hourglass_top,
                      color: AppColors.accentClient, size: 30),
                ),
              ),
              const SizedBox(height: 16),
              const Text(S.booked,
                  style:
                      TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                '${widget.services.map((s) => s.name).join(' + ')}\n${formatDate(startsAt)} · ${formatTime(startsAt)}\n${m.name}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.6),
              ),
              const SizedBox(height: 10),
              const Text(S.pendingConfirm,
                  style:
                      TextStyle(fontSize: 12, color: AppColors.warning)),
              const SizedBox(height: 6),
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

  List<Widget> _slotGroups(List<int> slots) {
    final groups = <(String, List<int>)>[
      (S.slotMorning, slots.where((t) => t < 12 * 60).toList()),
      (S.slotDay,
          slots.where((t) => t >= 12 * 60 && t < 17 * 60).toList()),
      (S.slotEvening, slots.where((t) => t >= 17 * 60).toList()),
    ];
    final widgets = <Widget>[];
    for (final (label, group) in groups) {
      if (group.isEmpty) continue;
      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 8, top: 4),
        child: Text(label,
            style: const TextStyle(
                fontSize: 12, color: AppColors.textTertiary)),
      ));
      widgets.add(GridView.count(
        crossAxisCount: 4,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 2.1,
        children: group.map((t) {
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
            onPressed: () {
              HapticFeedback.selectionClick();
              setState(() => _slot = t);
            },
            child: Text(formatMinutes(t),
                style: TextStyle(
                    fontSize: 14,
                    fontWeight:
                        selected ? FontWeight.w700 : FontWeight.w400,
                    color: selected
                        ? AppColors.accentClient
                        : AppColors.text)),
          );
        }).toList(),
      ));
      widgets.add(const SizedBox(height: 8));
    }
    return widgets;
  }

  @override
  Widget build(BuildContext context) {
    final slots =
        _day == null ? <int>[] : store.freeSlots(m, _totalMin, _day!);
    final monthLabel =
        '${_monthNames[_month.month - 1]} ${_month.year}';

    // Сетка месяца: понедельник — первый столбец
    final firstDow = (_month.weekday - 1) % 7;
    final daysInMonth =
        DateTime(_month.year, _month.month + 1, 0).day;
    // Свободные слоты по дням — и для статуса, и для счётчика
    final freeByDay = <int, int>{};
    for (var i = 1; i <= daysInMonth; i++) {
      final d = DateTime(_month.year, _month.month, i);
      if (store.dayState(m, _totalMin, d) == DayState.free) {
        freeByDay[i] = store.freeSlots(m, _totalMin, d).length;
      }
    }

    return Scaffold(
      appBar: AppBar(title: Text(m.name)),
      bottomNavigationBar: (_day != null && _slot != null)
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
                    onPressed: _confirm,
                    child: Text(
                        '${S.bookFor} · ${formatMinutes(_slot!)} · ${formatPrice(_totalPrice, MockStore.instance.currencySuffix)}',
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
            // Выбранные услуги
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                        widget.services.map((s) => s.name).join(' + '),
                        style: const TextStyle(fontSize: 14)),
                  ),
                  Text('$_totalMin ${S.min}',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.accentClient)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Навигация по месяцам
            Row(
              children: [
                IconButton(
                  onPressed: _canGoPrev ? () => _shiftMonth(-1) : null,
                  icon: Icon(Icons.chevron_left,
                      color: _canGoPrev
                          ? AppColors.text
                          : AppColors.textTertiary),
                ),
                Expanded(
                  child: Text(monthLabel,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                ),
                IconButton(
                  onPressed: () => _shiftMonth(1),
                  icon: const Icon(Icons.chevron_right),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Дни недели
            Row(
              children: S.dows
                  .map((d) => Expanded(
                        child: Center(
                          child: Text(d,
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textTertiary)),
                        ),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 8),

            // Сетка дней
            GridView.count(
              crossAxisCount: 7,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              children: [
                ...List.generate(firstDow, (_) => const SizedBox()),
                ...List.generate(daysInMonth, (i) {
                  final d =
                      DateTime(_month.year, _month.month, i + 1);
                  final state = store.dayState(m, _totalMin, d);
                  final selected = _day != null &&
                      _day!.day == d.day &&
                      _day!.month == d.month;

                  Color border = AppColors.border;
                  Color fg = AppColors.text;
                  Color bg = AppColors.bgCard;
                  VoidCallback? onTap;

                  switch (state) {
                    case DayState.past:
                    case DayState.dayOff:
                      fg = AppColors.textTertiary;
                      bg = Colors.transparent;
                    case DayState.full:
                      // День забит — другой цвет, записаться нельзя
                      fg = AppColors.warning.withValues(alpha: 0.7);
                      border = AppColors.warning.withValues(alpha: 0.25);
                    case DayState.free:
                      onTap = () {
                        HapticFeedback.selectionClick();
                        setState(() {
                          _day = d;
                          _slot = null;
                        });
                      };
                  }
                  if (selected) {
                    border = AppColors.accentClient;
                    fg = AppColors.accentClient;
                  }

                  return GestureDetector(
                    key: ValueKey('cal-${i + 1}'),
                    onTap: onTap,
                    child: Container(
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: border),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('${i + 1}',
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: selected
                                      ? FontWeight.w800
                                      : FontWeight.w500,
                                  color: fg)),
                          if (freeByDay.containsKey(i + 1))
                            Text('${freeByDay[i + 1]}',
                                style: TextStyle(
                                    fontSize: 8.5,
                                    color: selected
                                        ? AppColors.accentClient
                                        : AppColors.textTertiary)),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
            const SizedBox(height: 12),

            // Легенда
            Row(
              children: [
                _LegendDot(color: AppColors.warning.withValues(alpha: 0.7)),
                const Text(' занято   ',
                    style: TextStyle(
                        fontSize: 11, color: AppColors.textTertiary)),
                const _LegendDot(color: AppColors.textTertiary),
                const Text(' недоступно',
                    style: TextStyle(
                        fontSize: 11, color: AppColors.textTertiary)),
              ],
            ),

            // Слоты
            if (_day != null) ...[
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
                ..._slotGroups(slots),
              const SizedBox(height: 80),
            ],
          ],
        ),
      ),
    );
  }
}

const _monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

class _LegendDot extends StatelessWidget {
  final Color color;
  const _LegendDot({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 2),
      ),
    );
  }
}
