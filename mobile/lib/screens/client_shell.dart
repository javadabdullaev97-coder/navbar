import 'package:flutter/material.dart';
import '../client_store.dart';
import '../i18n.dart';
import '../models.dart';
import '../theme.dart';
import '../widgets/rate_sheet.dart';
import 'client_home.dart';
import 'client_records.dart';
import 'client_settings.dart';

class ClientShell extends StatefulWidget {
  const ClientShell({super.key});

  @override
  State<ClientShell> createState() => _ClientShellState();
}

class _ClientShellState extends State<ClientShell> {
  int _index = 0;
  static bool _ratePromptShown = false; // раз за запуск, не назойливо

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybeAskRating());
  }

  // «Как в Яндексе»: после завершённого визита приложение само
  // предлагает поставить оценку (визиты не старше 7 дней)
  Future<void> _maybeAskRating() async {
    if (_ratePromptShown || !mounted) return;
    final store = ClientStore.instance;
    final recent = store.myAppointments.where((a) =>
        a.status == AppointmentStatus.done &&
        !a.reviewed &&
        DateTime.now().difference(a.startsAt).inDays <= 7);
    if (recent.isEmpty) return;
    _ratePromptShown = true;
    final a = recent.first;
    final result = await showRateSheet(
      context,
      title: S.rateVisitTitle,
      subtitle: '${a.serviceName} · ${a.masterName}',
    );
    if (result == null) return;
    final (stars, text) = result;
    store.addReview(
      a.masterSlug,
      Review(author: 'Вы', stars: stars, text: text, at: DateTime.now()),
    );
    a.reviewed = true;
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(S.reviewThanks)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      const ClientHomeScreen(),
      const ClientRecordsScreen(),
      const ClientSettingsScreen(),
    ];
    return Scaffold(
      body: screens[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        selectedItemColor: AppColors.accentClient,
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Navbar'),
          BottomNavigationBarItem(
              icon: Icon(Icons.event_note_outlined),
              activeIcon: Icon(Icons.event_note),
              label: S.historyTitle),
          BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined),
              activeIcon: Icon(Icons.settings),
              label: S.navSettings),
        ],
      ),
    );
  }
}
