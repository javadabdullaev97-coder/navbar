import 'package:flutter/material.dart';
import '../i18n.dart';
import 'clients_screen.dart';
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
    final screens = [
      const ScheduleScreen(),
      const ClientsScreen(),
      const SettingsScreen(),
    ];
    return Scaffold(
      body: screens[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined),
              label: S.navSchedule),
          BottomNavigationBarItem(
              icon: Icon(Icons.people_outline), label: S.navClients),
          BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined), label: S.navSettings),
        ],
      ),
    );
  }
}
