import 'package:flutter/material.dart';
import 'screens/role_select.dart';
import 'theme.dart';

void main() {
  runApp(const NavbarApp());
}

class NavbarApp extends StatelessWidget {
  const NavbarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Navbar',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const RoleSelectScreen(),
    );
  }
}
