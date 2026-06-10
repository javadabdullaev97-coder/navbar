import 'package:flutter/material.dart';
import 'app_state.dart';
import 'screens/client_home.dart';
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
      home = const ClientHomeScreen();
    } else {
      home = const MasterShell();
    }
    return MaterialApp(
      title: 'Navbar',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: home,
    );
  }
}
