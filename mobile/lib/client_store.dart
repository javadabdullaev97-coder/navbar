import 'app_state.dart';
import 'mock_data.dart';
import 'models.dart';

// Мок-хранилище клиентской стороны. При подключении Supabase заменяется
// запросами к общей БД — интерфейс сохранится.
class ClientStore {
  ClientStore._();
  static final ClientStore instance = ClientStore._();

  // Асрор использует живые данные MockStore: если в роли мастера
  // поменять услуги или график — клиент это увидит (демо общей базы).
  List<MasterPublic> get masters => [
        MasterPublic(
          slug: 'asror',
          name: 'Асрор Каримов',
          specialization: MockStore.instance.masterSpec,
          address: 'Ташкент, Чиланзар, ул. Бунёдкор 12',
          bio: 'Мужские стрижки и оформление бороды. Опыт 7 лет.',
          services: MockStore.instance.services,
          schedule: MockStore.instance.schedule,
        ),
        MasterPublic(
          slug: 'dilnoza',
          name: 'Дильноза Юсупова',
          specialization: 'Колорист, парикмахер',
          address: 'Ташкент, Юнусабад, ул. Амира Темура 88',
          bio: 'Окрашивание, уход, женские стрижки.',
          services: _dilnozaServices,
          schedule: _defaultSchedule,
        ),
        MasterPublic(
          slug: 'sardor',
          name: 'Сардор Алиев',
          specialization: 'Барбер',
          address: 'Ташкент, Мирзо-Улугбек, ул. Буюк Ипак Йули 45',
          bio: 'Классические и современные мужские стрижки.',
          services: _sardorServices,
          schedule: _defaultSchedule,
        ),
      ];

  static final _dilnozaServices = [
    Service(id: 'd1', name: 'Женская стрижка', durationMin: 60, price: 150000),
    Service(id: 'd2', name: 'Окрашивание', durationMin: 180, price: 450000),
    Service(id: 'd3', name: 'Укладка', durationMin: 45, price: 100000),
  ];

  static final _sardorServices = [
    Service(id: 'r1', name: 'Стрижка', durationMin: 45, price: 70000),
    Service(id: 'r2', name: 'Стрижка + борода', durationMin: 75, price: 110000),
  ];

  static final _defaultSchedule = [
    ScheduleDay(dayOfWeek: 0, startMin: 10 * 60, endMin: 19 * 60),
    ScheduleDay(dayOfWeek: 1, startMin: 10 * 60, endMin: 19 * 60),
    ScheduleDay(dayOfWeek: 2, startMin: 10 * 60, endMin: 19 * 60),
    ScheduleDay(dayOfWeek: 3, startMin: 10 * 60, endMin: 19 * 60),
    ScheduleDay(dayOfWeek: 4, startMin: 10 * 60, endMin: 19 * 60),
    ScheduleDay(dayOfWeek: 5, startMin: 10 * 60, endMin: 16 * 60),
    ScheduleDay(dayOfWeek: 6, startMin: 0, endMin: 0, isDayOff: true),
  ];

  late final List<ClientAppointment> myAppointments = [
    ClientAppointment(
      id: 'm1',
      masterSlug: 'asror',
      masterName: 'Асрор Каримов',
      masterAddress: 'Ташкент, Чиланзар, ул. Бунёдкор 12',
      serviceName: 'Мужская стрижка',
      durationMin: 60,
      price: 80000,
      startsAt: DateTime.now().subtract(const Duration(days: 14, hours: 2)),
      status: AppointmentStatus.done,
    ),
  ];

  ClientAppointment? get upcoming {
    final now = DateTime.now();
    final future = myAppointments
        .where((a) =>
            a.startsAt.isAfter(now) &&
            a.status != AppointmentStatus.cancelled)
        .toList()
      ..sort((a, b) => a.startsAt.compareTo(b.startsAt));
    return future.isEmpty ? null : future.first;
  }

  List<ClientAppointment> get history {
    final now = DateTime.now();
    final past = myAppointments
        .where((a) =>
            !a.startsAt.isAfter(now) || a.status == AppointmentStatus.done)
        .toList()
      ..sort((a, b) => b.startsAt.compareTo(a.startsAt));
    return past;
  }

  // Детерминированная имитация занятости чужими клиентами
  bool _seedBusy(DateTime day, int slotMin) {
    final seed = day.day * 31 + slotMin;
    return seed % 7 == 0 || seed % 11 == 0;
  }

  bool _overlapsMine(MasterPublic master, DateTime start, int durationMin) {
    final end = start.add(Duration(minutes: durationMin));
    return myAppointments.any((a) {
      if (a.masterSlug != master.slug) return false;
      if (a.status == AppointmentStatus.cancelled) return false;
      final aEnd = a.startsAt.add(Duration(minutes: a.durationMin));
      return start.isBefore(aEnd) && end.isAfter(a.startsAt);
    });
  }

  /// Свободные слоты (минуты от полуночи) для мастера/услуги/дня.
  List<int> freeSlots(MasterPublic master, Service service, DateTime day) {
    final sched = master.schedule[(day.weekday - 1) % 7];
    if (sched.isDayOff) return [];
    final now = DateTime.now();
    final isToday = day.year == now.year &&
        day.month == now.month &&
        day.day == now.day;
    final nowMin = now.hour * 60 + now.minute;

    final result = <int>[];
    for (var t = sched.startMin;
        t + service.durationMin <= sched.endMin;
        t += 30) {
      if (isToday && t <= nowMin) continue;
      if (_seedBusy(day, t)) continue;
      final start =
          DateTime(day.year, day.month, day.day, t ~/ 60, t % 60);
      if (_overlapsMine(master, start, service.durationMin)) continue;
      result.add(t);
    }
    return result;
  }

  ClientAppointment book(
      MasterPublic master, Service service, DateTime startsAt) {
    final a = ClientAppointment(
      id: 'm${myAppointments.length + 1}',
      masterSlug: master.slug,
      masterName: master.name,
      masterAddress: master.address,
      serviceName: service.name,
      durationMin: service.durationMin,
      price: service.price,
      startsAt: startsAt,
    );
    myAppointments.add(a);

    // Демо общей базы: запись к Асрору видна и в кабинете мастера
    if (master.slug == 'asror') {
      final store = MockStore.instance;
      final me = store.getOrCreateClient(
        AppState.instance.name.isNotEmpty ? AppState.instance.name : 'Клиент',
        AppState.instance.phone,
      );
      store.addAppointment(
          client: me, service: service, startsAt: startsAt);
    }
    return a;
  }

  void cancel(ClientAppointment a) {
    a.status = AppointmentStatus.cancelled;
  }
}
