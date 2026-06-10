import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import '../theme.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final store = MockStore.instance;

  Future<void> _edit([Service? service]) async {
    final name = TextEditingController(text: service?.name ?? '');
    final duration =
        TextEditingController(text: service?.durationMin.toString() ?? '60');
    final price =
        TextEditingController(text: service?.price.toString() ?? '');

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(service == null ? S.newService : S.editService,
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            TextField(
              controller: name,
              autofocus: service == null,
              decoration: const InputDecoration(hintText: S.serviceName),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: duration,
                    keyboardType: TextInputType.number,
                    decoration:
                        const InputDecoration(hintText: S.durationMin),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: price,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(hintText: S.price),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                if (service != null)
                  TextButton(
                    onPressed: () {
                      setState(() => store.deleteService(service));
                      Navigator.pop(ctx);
                    },
                    child: const Text(S.delete,
                        style: TextStyle(color: AppColors.warning)),
                  ),
                const Spacer(),
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.accentMaster,
                    foregroundColor: AppColors.bg,
                  ),
                  onPressed: () {
                    final n = name.text.trim();
                    final d = int.tryParse(duration.text) ?? 0;
                    final p = int.tryParse(price.text) ?? 0;
                    if (n.isEmpty || d <= 0 || p <= 0) return;
                    setState(() {
                      if (service == null) {
                        store.addService(n, d, p);
                      } else {
                        service.name = n;
                        service.durationMin = d;
                        service.price = p;
                      }
                    });
                    Navigator.pop(ctx);
                  },
                  child: const Text(S.save),
                ),
              ],
            ),
          ],
        ),
      ),
    );
    name.dispose();
    duration.dispose();
    price.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(S.myServices)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _edit(),
        child: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ...store.services.map((s) => GestureDetector(
                  onTap: () => _edit(s),
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
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(s.name,
                                  style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600)),
                              const SizedBox(height: 2),
                              Text('${s.durationMin} ${S.min}',
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        Text(formatPrice(s.price, store.currencySuffix),
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentMaster)),
                        const SizedBox(width: 8),
                        const Icon(Icons.chevron_right,
                            color: AppColors.textTertiary),
                      ],
                    ),
                  ),
                )),
            const SizedBox(height: 72),
          ],
        ),
      ),
    );
  }
}
