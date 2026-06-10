import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../theme.dart';
import 'client_card.dart';

class ClientsScreen extends StatefulWidget {
  const ClientsScreen({super.key});

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> {
  final store = MockStore.instance;
  String _query = '';

  Future<void> _addClient() async {
    final name = TextEditingController();
    final phone = TextEditingController(text: '+998 ');
    final added = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: const Text(S.newClient),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: name,
              autofocus: true,
              decoration: const InputDecoration(hintText: S.clientName),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(hintText: S.clientPhone),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text(S.cancel,
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.accentMaster,
              foregroundColor: AppColors.bg,
            ),
            onPressed: () {
              if (name.text.trim().length >= 2) Navigator.pop(ctx, true);
            },
            child: const Text(S.save),
          ),
        ],
      ),
    );
    if (added == true) {
      setState(() => store.getOrCreateClient(
          name.text.trim(), phone.text.replaceAll(' ', '')));
    }
    name.dispose();
    phone.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final q = _query.toLowerCase();
    final filtered = store.clients
        .where(
            (c) => c.name.toLowerCase().contains(q) || c.phone.contains(q))
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text(S.navClients)),
      floatingActionButton: FloatingActionButton(
        onPressed: _addClient,
        child: const Icon(Icons.person_add_alt),
      ),
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
                prefixIcon: Icon(Icons.search, color: AppColors.textTertiary),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
            const SizedBox(height: 12),
            ...filtered.map((c) {
              final days = c.lastVisitAt == null
                  ? null
                  : DateTime.now().difference(c.lastVisitAt!).inDays;
              return GestureDetector(
                onTap: () async {
                  await Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => ClientCardScreen(client: c)));
                  setState(() {});
                },
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
                            Text('${S.lastVisit} $days ${S.daysAgo}',
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textTertiary)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 72),
          ],
        ),
      ),
    );
  }
}
