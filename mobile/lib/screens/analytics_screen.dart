import 'package:flutter/material.dart';
import '../app_state.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';
import 'settings_screen.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final store = MockStore.instance;
  int _period = 0; // 0=неделя, 1=месяц, 2=3 месяца

  static const _periodDays = [7, 30, 90];
  static const _periodLabels = [S.periodWeek, S.periodMonth, S.period3Months];

  @override
  Widget build(BuildContext context) {
    if (!AppState.instance.isPro) return _LockedView(onChanged: _refresh);

    final days = _periodDays[_period];
    final revenue = store.revenueByDay(days);
    final total = revenue.fold(0, (a, b) => a + b);
    final breakdown = store.serviceBreakdown(days);

    // Для месяца/квартала группируем дни, чтобы график оставался читаемым
    final groupSize = days <= 7 ? 1 : (days <= 30 ? 5 : 15);
    final bars = <int>[];
    for (var i = 0; i < revenue.length; i += groupSize) {
      bars.add(revenue
          .sublist(i, (i + groupSize).clamp(0, revenue.length))
          .fold(0, (a, b) => a + b));
    }
    final maxBar = bars.fold(1, (a, b) => a > b ? a : b);

    return Scaffold(
      appBar: AppBar(title: const Text(S.navAnalytics)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: List.generate(3, (i) {
                final selected = _period == i;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(_periodLabels[i]),
                    selected: selected,
                    onSelected: (_) => setState(() => _period = i),
                    selectedColor:
                        AppColors.accentMaster.withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                        color: selected
                            ? AppColors.accentMaster
                            : AppColors.textSecondary),
                    backgroundColor: AppColors.bgCard,
                    side: BorderSide(
                        color: selected
                            ? AppColors.accentMaster
                            : AppColors.border),
                  ),
                );
              }),
            ),
            const SizedBox(height: 20),
            const Text(S.revenueFor,
                style: TextStyle(
                    fontSize: 13, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            Text(formatPrice(total, store.currencySuffix),
                style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    color: AppColors.accentMaster)),
            const SizedBox(height: 20),
            Container(
              height: 160,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: bars
                    .map((v) => Expanded(
                          child: Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 3),
                            child: FractionallySizedBox(
                              heightFactor:
                                  (v / maxBar).clamp(0.02, 1.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.accentMaster
                                      .withValues(alpha: 0.8),
                                  borderRadius: const BorderRadius.vertical(
                                      top: Radius.circular(4)),
                                ),
                              ),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 24),
            const Text(S.byServices,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textTertiary)),
            const SizedBox(height: 12),
            ...breakdown.entries.map((e) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(e.key,
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text('${e.value.count} ×',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      Text(
                          formatPrice(
                              e.value.total, store.currencySuffix),
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.accentMaster)),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  void _refresh() => setState(() {});
}

class _LockedView extends StatelessWidget {
  final VoidCallback onChanged;
  const _LockedView({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.navAnalytics)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.accentMaster.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.lock_outline,
                    color: AppColors.accentMaster, size: 32),
              ),
              const SizedBox(height: 20),
              const Text(S.analyticsLocked,
                  textAlign: TextAlign.center,
                  style:
                      TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              const Text(S.analyticsLockedDesc,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5)),
              const SizedBox(height: 24),
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.accentMaster,
                  foregroundColor: AppColors.bg,
                ),
                onPressed: () async {
                  await showUpgradeDialog(context);
                  onChanged();
                },
                child: const Text(S.tariffUpgrade,
                    style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
