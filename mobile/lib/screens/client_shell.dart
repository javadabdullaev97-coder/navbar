import 'package:flutter/material.dart';
import '../i18n.dart';
import '../theme.dart';
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
              icon: Icon(Icons.home_outlined), label: 'Navbar'),
          BottomNavigationBarItem(
              icon: Icon(Icons.event_note_outlined), label: S.historyTitle),
          BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined), label: S.navSettings),
        ],
      ),
    );
  }
}
