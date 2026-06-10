import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:navbar_mobile/app_state.dart';
import 'package:navbar_mobile/i18n.dart';
import 'package:navbar_mobile/main.dart';

void main() {
  testWidgets('онбординг мастера: роль → телефон → код → профиль → кабинет',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    await AppState.instance.load();

    await tester.pumpWidget(const NavbarApp());

    // Выбор роли
    expect(find.text(S.chooseRole), findsOneWidget);
    await tester.tap(find.text(S.roleMaster));
    await tester.pumpAndSettle();

    // Телефон
    expect(find.text(S.phoneTitle), findsOneWidget);
    await tester.enterText(find.byType(TextField), '+998 90 123 45 67');
    await tester.tap(find.text(S.continueBtn));
    await tester.pumpAndSettle();

    // Код подтверждения (тестовый)
    expect(find.text(S.otpTitle), findsOneWidget);
    await tester.enterText(find.byType(TextField), '0000');
    await tester.tap(find.text(S.continueBtn));
    await tester.pumpAndSettle();

    // Профиль
    expect(find.text(S.profileTitle), findsOneWidget);
    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), 'Асрор');
    await tester.enterText(fields.at(1), 'Барбер');
    await tester.tap(find.text(S.start));
    await tester.pumpAndSettle();

    // Кабинет мастера
    expect(find.text(S.navSchedule), findsWidgets);
    expect(find.textContaining(S.greeting), findsOneWidget);
    expect(AppState.instance.onboarded, isTrue);
    expect(AppState.instance.role, 'master');
  });
}
