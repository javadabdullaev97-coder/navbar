import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:navbar_mobile/app_state.dart';
import 'package:navbar_mobile/client_store.dart';
import 'package:navbar_mobile/i18n.dart';
import 'package:navbar_mobile/main.dart';

void main() {
  testWidgets('онбординг мастера: роль → телефон → код → профиль → кабинет',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    await AppState.instance.load();

    await tester.pumpWidget(const NavbarApp());

    expect(find.text(S.chooseRole), findsOneWidget);
    await tester.tap(find.text(S.roleMaster));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), '+998 90 123 45 67');
    await tester.tap(find.text(S.continueBtn));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), '0000');
    await tester.tap(find.text(S.continueBtn));
    await tester.pumpAndSettle();

    expect(find.text(S.profileTitle), findsOneWidget);
    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), 'Асрор');
    await tester.enterText(fields.at(1), 'Барбер');
    await tester.tap(find.text(S.start));
    await tester.pumpAndSettle();

    expect(find.text(S.navSchedule), findsWidgets);
    expect(find.textContaining(S.greeting), findsOneWidget);
    expect(AppState.instance.role, 'master');
  });

  testWidgets(
      'клиент: онбординг с интересами → каталог → мультиуслуги → календарь → запись',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    await AppState.instance.load();

    await tester.pumpWidget(const NavbarApp());

    // Роль, телефон (международный), код
    await tester.tap(find.text(S.roleClient));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '+7 905 123 45 67');
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

    // Интересы
    expect(find.text(S.interestsTitle), findsOneWidget);
    await tester.tap(find.text('Барберы'));
    await tester.tap(find.text(S.start));
    await tester.pumpAndSettle();

    // Каталог: категория интереса первая, мастера с рейтингом
    expect(AppState.instance.interests, contains('Барберы'));
    expect(find.text('Асрор Каримов'), findsWidgets);

    // Поиск по номеру
    await tester.enterText(find.byType(TextField).first, '90555');
    await tester.pumpAndSettle();
    expect(find.text('Умид Назаров'), findsOneWidget);
    await tester.enterText(find.byType(TextField).first, '');
    await tester.pumpAndSettle();

    // Профиль мастера
    await tester.tap(find.text('Асрор Каримов').first);
    await tester.pumpAndSettle();
    expect(find.text(S.portfolioTitle.toUpperCase()), findsOneWidget);

    // Мультивыбор: две услуги
    await tester.ensureVisible(find.text('Мужская стрижка'));
    await tester.tap(find.text('Мужская стрижка'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Оформление бороды'));
    await tester.tap(find.text('Оформление бороды'));
    await tester.pumpAndSettle();

    // К календарю
    await tester.tap(find.byKey(const ValueKey('choose-time')));
    await tester.pumpAndSettle();

    // Календарь: ищем первый свободный день со слотами
    bool slotFound = false;
    for (var d = 1; d <= 31 && !slotFound; d++) {
      final cell = find.byKey(ValueKey('cal-$d'));
      if (cell.evaluate().isEmpty) continue;
      final widget = tester.widget<GestureDetector>(cell);
      if (widget.onTap == null) continue; // прошлое/выходной/занято
      await tester.ensureVisible(cell);
      await tester.pumpAndSettle();
      await tester.tap(cell, warnIfMissed: false);
      await tester.pumpAndSettle();
      slotFound = tester
          .widgetList(find.byWidgetPredicate((w) =>
              w is OutlinedButton &&
              (w.key?.toString().contains('slot-') ?? false)))
          .isNotEmpty;
    }
    expect(slotFound, isTrue, reason: 'не нашлось свободного дня в месяце');

    // Слот и подтверждение
    final slot = find.byWidgetPredicate((w) =>
        w is OutlinedButton &&
        (w.key?.toString().contains('slot-') ?? false));
    await tester.ensureVisible(slot.first);
    await tester.pumpAndSettle();
    await tester.tap(slot.first);
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('confirm-booking')));
    await tester.pumpAndSettle();

    // Заявка создана и ждёт подтверждения мастера
    expect(find.text(S.booked), findsOneWidget);
    expect(find.text(S.pendingConfirm), findsWidgets);
    await tester.tap(find.text(S.done));
    await tester.pumpAndSettle();

    // На главной — ближайшая запись с двумя услугами
    expect(find.textContaining('Мужская стрижка + Оформление бороды'),
        findsWidgets);
  });

  test('конфликт записей: клиент не может быть у двух мастеров сразу', () {
    final store = ClientStore.instance;
    final masters = store.masters;
    final day = DateTime.now().add(const Duration(days: 40));
    final start = DateTime(day.year, day.month, day.day, 12, 0);

    final servicesA = [masters[1].services.first];
    store.book(masters[1], servicesA, start);

    // Пересечение по времени у другого мастера
    final conflict = store.conflictWithMine(
        start.add(const Duration(minutes: 15)), 60);
    expect(conflict, isNotNull);
    expect(conflict!.masterSlug, masters[1].slug);

    // А через два часа — свободно
    final ok = store.conflictWithMine(
        start.add(const Duration(hours: 2)), 60);
    expect(ok, isNull);
  });
}
