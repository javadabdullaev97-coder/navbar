import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';

class ClientsScreen extends StatefulWidget {
  const ClientsScreen({super.key});

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> {
  final store = MockStore.instance;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.toLowerCase();
    final filtered = store.clients
        .where((c) =>
            c.name.toLowerCase().contains(q) || c.phone.contains(q))
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text(S.navClients)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Text(
                      '${store.clients.length}/${MockStore.freeClientsLimit}',
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.accentMaster)),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(S.clientsLimit,
                        style: TextStyle(
                            fontSize: 12, color: AppColors.textSecondary)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(
                hintText: S.searchClients,
                hintStyle: TextStyle(color: AppColors.textTertiary),
                prefixIcon:
                    Icon(Icons.search, color: AppColors.textTertiary),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((c) {
              final days = c.lastVisitAt == null
                  ? null
                  : DateTime.now().difference(c.lastVisitAt!).inDays;
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
                    CircleAvatar(
                      backgroundColor:
                          AppColors.accentMaster.withValues(alpha: 0.12),
                      child: Text(c.name.characters.first,
                          style: const TextStyle(
                              color: AppColors.accentMaster,
                              fontWeight: FontWeight.w700)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.name,
                              style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text(c.phone,
                              style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${c.visitCount} ${S.visits}',
                            style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary)),
                        if (days != null)
                          Text('${S.lastVisit} $days дн. назад',
                              style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textTertiary)),
                      ],
                    ),
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
