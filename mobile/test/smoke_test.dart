import 'package:flutter_test/flutter_test.dart';
import 'package:navbar_mobile/i18n.dart';
import 'package:navbar_mobile/main.dart';

void main() {
  testWidgets('выбор роли открывает кабинет мастера', (tester) async {
    await tester.pumpWidget(const NavbarApp());

    expect(find.text(S.chooseRole), findsOneWidget);
    expect(find.text(S.roleMaster), findsOneWidget);

    await tester.tap(find.text(S.roleMaster));
    await tester.pumpAndSettle();

    expect(find.text(S.navSchedule), findsWidgets);
    expect(find.textContaining(S.greeting), findsOneWidget);
  });
}
