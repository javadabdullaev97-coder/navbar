import 'package:flutter/material.dart';
import '../i18n.dart';
import '../mock_data.dart';
import '../models.dart';
import 'analytics_screen.dart';
import 'clients_screen.dart';
import 'master_chats.dart';
import 'schedule_screen.dart';
import 'settings_screen.dart';

class MasterShell extends StatefulWidget {
  const MasterShell({super.key});

  @override
  State<MasterShell> createState() => _MasterShellState();
}

class _MasterShellState extends State<MasterShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final pendingCount = MockStore.instance.appointments
        .where((a) =>
            a.status == AppointmentStatus.pending && a.startsAt.isAfter(now))
        .length;
    final screens = [
      const ScheduleScreen(),
      const ClientsScreen(),
      const MasterChatsScreen(),
      const AnalyticsScreen(),
      const SettingsScreen(),
    ];
    return Scaffold(
      body: screens[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: pendingCount > 0,
                label: Text('$pendingCount'),
                child: const Icon(Icons.calendar_today_outlined),
              ),
              activeIcon: Badge(
                isLabelVisible: pendingCount > 0,
                label: Text('$pendingCount'),
                child: const Icon(Icons.calendar_today),
              ),
              label: S.navSchedule),
          const BottomNavigationBarItem(
              icon: Icon(Icons.people_outline),
              activeIcon: Icon(Icons.people),
              label: S.navClients),
          const BottomNavigationBarItem(
              icon: Icon(Icons.chat_bubble_outline),
              activeIcon: Icon(Icons.chat_bubble),
              label: S.navChats),
          const BottomNavigationBarItem(
              icon: Icon(Icons.bar_chart_outlined),
              activeIcon: Icon(Icons.bar_chart),
              label: S.navAnalytics),
          const BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined),
              activeIcon: Icon(Icons.settings),
              label: S.navSettings),
        ],
      ),
    );
  }
}
