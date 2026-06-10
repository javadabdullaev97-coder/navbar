import 'package:flutter/material.dart';
import '../app_state.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';
import 'master_profile.dart';

class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  final store = ClientStore.instance;
  String _query = '';

  Future<void> _openMaster(MasterPublic m) async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => MasterProfileScreen(slug: m.slug)),
    );
    setState(() {});
  }

  void _confirmCancel(ClientAppointment a) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: const Text(S.cancelBookingQ),
        content: Text(
            '${a.serviceName} · ${formatDate(a.startsAt)} ${formatTime(a.startsAt)}',
            style: const TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(S.keepBooking,
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () {
              setState(() => store.cancel(a));
              Navigator.pop(ctx);
            },
            child: const Text(S.yesCancel,
                style: TextStyle(color: AppColors.warning)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = AppState.instance.name;
    final upcoming = store.upcoming;
    final searching = _query.trim().isNotEmpty;
    final results = searching ? store.search(_query) : <MasterPublic>[];

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              name.isEmpty ? '${S.greeting} 👋' : '${S.greeting}, $name 👋',
              style:
                  const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 16),

            // Поиск по имени мастера или номеру
            TextField(
              decoration: const InputDecoration(
                hintText: S.searchMasters,
                hintStyle: TextStyle(color: AppColors.textTertiary),
                prefixIcon:
                    Icon(Icons.search, color: AppColors.textTertiary),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
            const SizedBox(height: 20),

            if (searching) ...[
              if (results.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(
                    child: Text(S.nothingFound,
                        style: TextStyle(color: AppColors.textTertiary)),
                  ),
                )
              else
                ...results.map((m) =>
                    _MasterListCard(m: m, onTap: () => _openMaster(m))),
            ] else ...[
              // Ближайшая запись
              if (upcoming != null) ...[
                const _SectionTitle(S.upcoming),
                _UpcomingCard(
                    a: upcoming, onCancel: () => _confirmCancel(upcoming)),
                const SizedBox(height: 24),
              ],

              // Каталог: интересные категории первыми
              ...store.orderedCategories().expand((cat) {
                final tops = store.topByCategory(cat);
                if (tops.isEmpty) return <Widget>[];
                return [
                  _SectionTitle(cat),
                  SizedBox(
                    height: 150,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: tops.length,
                      separatorBuilder: (_, _) => const SizedBox(width: 10),
                      itemBuilder: (_, i) => _MasterTopCard(
                          m: tops[i], onTap: () => _openMaster(tops[i])),
                    ),
                  ),
                  const SizedBox(height: 20),
                ];
              }),
            ],
          ],
        ),
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  final ClientAppointment a;
  final VoidCallback onCancel;
  const _UpcomingCard({required this.a, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    final pending = a.status == AppointmentStatus.pending;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accentClient),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(a.serviceName,
                    style: const TextStyle(
                        fontSize: 17, fontWeight: FontWeight.w700)),
              ),
              Text(formatPrice(a.price, MockStore.instance.currencySuffix),
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.accentClient)),
            ],
          ),
          const SizedBox(height: 10),
          _InfoRow(icon: Icons.person_outline, text: a.masterName),
          _InfoRow(
              icon: Icons.event,
              text:
                  '${formatDate(a.startsAt)} · ${formatTime(a.startsAt)}'),
          _InfoRow(icon: Icons.place_outlined, text: a.masterAddress),
          if (pending)
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Row(
                children: [
                  Icon(Icons.hourglass_top,
                      size: 14, color: AppColors.warning),
                  SizedBox(width: 6),
                  Text(S.pendingConfirm,
                      style: TextStyle(
                          fontSize: 12, color: AppColors.warning)),
                ],
              ),
            ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: onCancel,
              child: const Text(S.cancelBooking,
                  style: TextStyle(
                      color: AppColors.textTertiary, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }
}

class _MasterTopCard extends StatelessWidget {
  final MasterPublic m;
  final VoidCallback onTap;
  const _MasterTopCard({required this.m, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final minPrice = m.services.isEmpty
        ? 0
        : m.services.map((s) => s.price).reduce((a, b) => a < b ? a : b);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 150,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor:
                      AppColors.accentClient.withValues(alpha: 0.12),
                  child: Text(m.name.characters.first,
                      style: const TextStyle(
                          fontSize: 15,
                          color: AppColors.accentClient,
                          fontWeight: FontWeight.w700)),
                ),
                const Spacer(),
                const Icon(Icons.star,
                    size: 14, color: AppColors.warning),
                const SizedBox(width: 2),
                Text(m.rating.toStringAsFixed(1),
                    style: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 10),
            Text(m.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w600)),
            Text(m.specialization,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontSize: 12, color: AppColors.textSecondary)),
            const Spacer(),
            Text('от ${formatPriceShort(minPrice)}',
                style: const TextStyle(
                    fontSize: 12, color: AppColors.accentClient)),
          ],
        ),
      ),
    );
  }
}

class _MasterListCard extends StatelessWidget {
  final MasterPublic m;
  final VoidCallback onTap;
  const _MasterListCard({required this.m, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
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
            CircleAvatar(
              radius: 22,
              backgroundColor:
                  AppColors.accentClient.withValues(alpha: 0.12),
              child: Text(m.name.characters.first,
                  style: const TextStyle(
                      color: AppColors.accentClient,
                      fontWeight: FontWeight.w700)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(m.name,
                      style: const TextStyle(
                          fontSize: 15, fontWeight: FontWeight.w600)),
                  Text('${m.specialization} · ${m.phone}',
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            ),
            const Icon(Icons.star, size: 14, color: AppColors.warning),
            const SizedBox(width: 2),
            Text(m.rating.toStringAsFixed(1),
                style: const TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

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

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text,
                style: const TextStyle(
                    fontSize: 14, color: AppColors.textSecondary)),
          ),
        ],
      ),
    );
  }
}
