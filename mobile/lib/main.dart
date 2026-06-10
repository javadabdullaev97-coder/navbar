import 'package:flutter/material.dart';
import 'app_state.dart';
import 'screens/client_shell.dart';
import 'screens/master_shell.dart';
import 'screens/role_select.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppState.instance.load();
  runApp(const NavbarApp());
}

class NavbarApp extends StatelessWidget {
  const NavbarApp({super.key});

  @override
  Widget build(BuildContext context) {
    final app = AppState.instance;
    final Widget home;
    if (!app.onboarded) {
      home = const RoleSelectScreen();
    } else if (app.role == 'client') {
      home = const ClientShell();
    } else {
      home = const MasterShell();
    }
    return MaterialApp(
      title: 'Navbar',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      scrollBehavior: const _NoStretchScrollBehavior(),
      home: home,
    );
  }
}

// Android 12+ по умолчанию растягивает контент при перетягивании списка —
// на тёмном UI выглядит плохо. Убираем эффект, pull-to-refresh сохраняется.
class _NoStretchScrollBehavior extends MaterialScrollBehavior {
  const _NoStretchScrollBehavior();

  @override
  Widget buildOverscrollIndicator(
          BuildContext context, Widget child, ScrollableDetails details) =>
      child;
}
