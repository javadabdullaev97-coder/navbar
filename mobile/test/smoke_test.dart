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

  testWidgets('клиент: онбординг → запись к мастеру → запись на главной',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    await AppState.instance.load();

    await tester.pumpWidget(const NavbarApp());

    // Роль клиента
    await tester.tap(find.text(S.roleClient));
    await tester.pumpAndSettle();

    // Телефон и код
    await tester.enterText(find.byType(TextField), '+998 93 555 44 11');
    await tester.tap(find.text(S.continueBtn));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '0000');
    await tester.tap(find.text(S.continueBtn));
    await tester.pumpAndSettle();

    // Имя
    expect(find.text(S.yourName), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'Тимур');
    await tester.tap(find.text(S.start));
    await tester.pumpAndSettle();

    // Главная клиента
    expect(find.text(S.myMasters.toUpperCase()), findsOneWidget);
    expect(AppState.instance.role, 'client');

    // Записаться к первому мастеру (Асрор)
    await tester.tap(find.text(S.bookBtn).first);
    await tester.pumpAndSettle();
    expect(find.text(S.chooseService.toUpperCase()), findsOneWidget);

    // Услуга
    await tester.ensureVisible(find.text('Мужская стрижка'));
    await tester.tap(find.text('Мужская стрижка'));
    await tester.pumpAndSettle();

    // Дата: берём первый рабочий день со свободными слотами
    bool slotFound = false;
    for (var i = 0; i < 7 && !slotFound; i++) {
      final chip = find.byKey(ValueKey('day-$i'));
      if (chip.evaluate().isEmpty) break;
      await tester.ensureVisible(chip);
      await tester.pumpAndSettle();
      await tester.tap(chip, warnIfMissed: false);
      await tester.pumpAndSettle();
      slotFound = tester
          .widgetList(find.byWidgetPredicate((w) =>
              w is OutlinedButton &&
              (w.key?.toString().contains('slot-') ?? false)))
          .isNotEmpty;
    }
    expect(slotFound, isTrue, reason: 'не нашлось свободных слотов за неделю');

    // Время: первый свободный слот
    final slot = find.byWidgetPredicate((w) =>
        w is OutlinedButton &&
        (w.key?.toString().contains('slot-') ?? false));
    await tester.ensureVisible(slot.first);
    await tester.pumpAndSettle();
    await tester.tap(slot.first);
    await tester.pumpAndSettle();

    // Подтверждение
    await tester.tap(find.byKey(const ValueKey('confirm-booking')));
    await tester.pumpAndSettle();
    expect(find.text(S.booked), findsOneWidget);
    await tester.tap(find.text(S.done));
    await tester.pumpAndSettle();

    // Запись на главной
    expect(find.text('Мужская стрижка'), findsWidgets);
    expect(find.text(S.cancelBooking), findsOneWidget);
  });
}
