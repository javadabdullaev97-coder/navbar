import 'app_state.dart';
import 'models.dart';

// Мок-хранилище в памяти. При подключении Supabase заменяется
// репозиторием с тем же интерфейсом.
class MockStore {
  MockStore._();
  static final MockStore instance = MockStore._();

  String get masterName =>
      AppState.instance.name.isNotEmpty ? AppState.instance.name : 'Асрор';
  String get masterSpec => AppState.instance.specialization.isNotEmpty
      ? AppState.instance.specialization
      : 'Барбер';
  String get masterSlug =>
      AppState.instance.slug.isNotEmpty ? AppState.instance.slug : 'asror';
  final currencySuffix = 'сум';

  final services = <Service>[
    Service(id: 's1', name: 'Мужская стрижка', durationMin: 60, price: 80000),
    Service(
        id: 's2', name: 'Стрижка + борода', durationMin: 90, price: 120000),
    Service(id: 's3', name: 'Оформление бороды', durationMin: 30, price: 50000),
    Service(id: 's4', name: 'Детская стрижка', durationMin: 45, price: 60000),
  ];

  final schedule = <ScheduleDay>[
    ScheduleDay(dayOfWeek: 0, startMin: 9 * 60, endMin: 20 * 60),
    ScheduleDay(dayOfWeek: 1, startMin: 9 * 60, endMin: 20 * 60),
    ScheduleDay(dayOfWeek: 2, startMin: 9 * 60, endMin: 20 * 60),
    ScheduleDay(dayOfWeek: 3, startMin: 9 * 60, endMin: 20 * 60),
    ScheduleDay(dayOfWeek: 4, startMin: 9 * 60, endMin: 20 * 60),
    ScheduleDay(dayOfWeek: 5, startMin: 10 * 60, endMin: 18 * 60),
    ScheduleDay(dayOfWeek: 6, startMin: 0, endMin: 0, isDayOff: true),
  ];

  late final List<Client> clients = [
    Client(
        id: 'c1',
        name: 'Бекзод',
        phone: '+998901112233',
        notes: 'Фейд по бокам, сверху подлиннее',
        visitCount: 12,
        ratingSum: 49,
        ratingCount: 10,
        lastVisitAt: DateTime.now().subtract(const Duration(days: 6))),
    Client(
        id: 'c2',
        name: 'Жасур',
        phone: '+998935554411',
        visitCount: 8,
        ratingSum: 38,
        ratingCount: 8,
        lastVisitAt: DateTime.now().subtract(const Duration(days: 2))),
    Client(
        id: 'c3',
        name: 'Тимур',
        phone: '+998909990077',
        visitCount: 3,
        ratingSum: 13,
        ratingCount: 3,
        lastVisitAt: DateTime.now().subtract(const Duration(days: 20))),
    Client(
        id: 'c4',
        name: 'Санжар',
        phone: '+998971234567',
        visitCount: 1,
        lastVisitAt: DateTime.now().subtract(const Duration(days: 40))),
  ];

  late final List<Appointment> appointments = _seedAppointments();

  List<Appointment> _seedAppointments() {
    final today = DateTime.now();
    DateTime at(int dayOffset, int hour, [int minute = 0]) =>
        DateTime(today.year, today.month, today.day + dayOffset, hour, minute);
    return [
      // Прошлые визиты — для истории клиентов и аналитики
      Appointment(
          id: 'p1',
          clientId: 'c1',
          serviceId: 's2',
          startsAt: at(-6, 11),
          status: AppointmentStatus.done),
      Appointment(
          id: 'p2',
          clientId: 'c2',
          serviceId: 's1',
          startsAt: at(-2, 16),
          status: AppointmentStatus.done),
      Appointment(
          id: 'p3',
          clientId: 'c1',
          serviceId: 's1',
          startsAt: at(-20, 12),
          status: AppointmentStatus.done),
      Appointment(
          id: 'p4',
          clientId: 'c3',
          serviceId: 's3',
          startsAt: at(-20, 15),
          status: AppointmentStatus.done),
      // Сегодня и впереди
      Appointment(
          id: 'a1',
          clientId: 'c1',
          serviceId: 's2',
          startsAt: at(0, 10),
          status: AppointmentStatus.confirmed),
      Appointment(
          id: 'a2',
          clientId: 'c2',
          serviceId: 's1',
          startsAt: at(0, 14, 30),
          status: AppointmentStatus.confirmed),
      Appointment(
          id: 'a3',
          clientId: 'c3',
          serviceId: 's3',
          startsAt: at(0, 17),
          status: AppointmentStatus.pending),
      Appointment(
          id: 'a4',
          clientId: 'c2',
          serviceId: 's2',
          startsAt: at(1, 11),
          status: AppointmentStatus.confirmed),
      Appointment(
          id: 'a5',
          clientId: 'c4',
          serviceId: 's1',
          startsAt: at(2, 15),
          status: AppointmentStatus.pending),
    ];
  }

  static const freeClientsLimit = 50;

  // Слоты, заблокированные мастером вручную
  final blockedSlots = <BlockedSlot>[];

  // Демо-связь с клиентской стороной: при смене статуса записи
  // клиент видит обновление (аналог Supabase Realtime)
  void Function(String apptId, AppointmentStatus status)? onStatusChanged;

  void blockSlot(DateTime day, int startMin, int endMin, [String? note]) {
    blockedSlots.add(BlockedSlot(
      day: DateTime(day.year, day.month, day.day),
      startMin: startMin,
      endMin: endMin,
      note: note,
    ));
  }

  void unblockSlot(BlockedSlot b) => blockedSlots.remove(b);

  bool isBlocked(DateTime day, int startMin, int durationMin) {
    final end = startMin + durationMin;
    return blockedSlots.any((b) =>
        b.day.year == day.year &&
        b.day.month == day.month &&
        b.day.day == day.day &&
        startMin < b.endMin &&
        end > b.startMin);
  }

  List<BlockedSlot> blockedOn(DateTime day) => blockedSlots
      .where((b) =>
          b.day.year == day.year &&
          b.day.month == day.month &&
          b.day.day == day.day)
      .toList()
    ..sort((a, b) => a.startMin.compareTo(b.startMin));

  Client clientById(String id) => clients.firstWhere((c) => c.id == id);
  Service? serviceById(String id) {
    final found = services.where((s) => s.id == id);
    return found.isEmpty ? null : found.first;
  }

  List<Appointment> appointmentsOn(DateTime day) {
    final list = appointments
        .where((a) =>
            a.startsAt.year == day.year &&
            a.startsAt.month == day.month &&
            a.startsAt.day == day.day)
        .toList();
    list.sort((a, b) => a.startsAt.compareTo(b.startsAt));
    return list;
  }

  List<Appointment> visitsOf(String clientId) {
    final list = appointments
        .where((a) =>
            a.clientId == clientId &&
            a.status != AppointmentStatus.cancelled)
        .toList();
    list.sort((a, b) => b.startsAt.compareTo(a.startsAt));
    return list;
  }

  int todayRevenue() {
    return appointmentsOn(DateTime.now())
        .where((a) => a.status != AppointmentStatus.cancelled)
        .fold(0, (sum, a) => sum + (serviceById(a.serviceId)?.price ?? 0));
  }

  // --- Аналитика (детерминированные мок-цифры + реальные done-записи) ---

  /// Выручка по дням за период [days] назад от сегодня (включительно).
  List<int> revenueByDay(int days) {
    final today = DateTime.now();
    return List.generate(days, (i) {
      final day = DateTime(today.year, today.month, today.day)
          .subtract(Duration(days: days - 1 - i));
      final real = appointmentsOn(day)
          .where((a) => a.status == AppointmentStatus.done)
          .fold(0, (s, a) => s + (serviceById(a.serviceId)?.price ?? 0));
      if (real > 0) return real;
      if (schedule[(day.weekday - 1) % 7].isDayOff) return 0;
      // имитация: 2–6 стрижек в день
      final seed = day.day * 7 + day.month * 3;
      return (2 + seed % 5) * 80000;
    });
  }

  Map<String, ({int count, int total})> serviceBreakdown(int days) {
    final result = <String, ({int count, int total})>{};
    final seedBase = days;
    for (var i = 0; i < services.length; i++) {
      final s = services[i];
      final count = ((seedBase * (i + 3)) % (days * 2)) + days ~/ 7 + 1;
      result[s.name] = (count: count, total: count * s.price);
    }
    return result;
  }

  // --- Мутации ---

  Client getOrCreateClient(String name, String phone) {
    final existing = clients.where((c) => c.phone == phone);
    if (existing.isNotEmpty) return existing.first;
    final c = Client(
        id: 'c${clients.length + 1}', name: name, phone: phone);
    clients.add(c);
    return c;
  }

  Appointment addAppointment({
    required Client client,
    required Service service,
    required DateTime startsAt,
    AppointmentStatus status = AppointmentStatus.confirmed,
  }) {
    final a = Appointment(
      id: 'a${appointments.length + 1}',
      clientId: client.id,
      serviceId: service.id,
      startsAt: startsAt,
      status: status,
    );
    appointments.add(a);
    return a;
  }

  // Мастер анонимно оценивает клиента — копится только агрегат
  void rateClient(Client c, int stars) {
    c.ratingSum += stars;
    c.ratingCount += 1;
  }

  void setStatus(Appointment a, AppointmentStatus status) {
    a.status = status;
    if (status == AppointmentStatus.done) {
      final c = clientById(a.clientId);
      c.visitCount += 1;
      c.lastVisitAt = a.startsAt;
    }
    onStatusChanged?.call(a.id, status);
  }

  void addService(String name, int durationMin, int price) {
    services.add(Service(
      id: 's${services.length + 1}',
      name: name,
      durationMin: durationMin,
      price: price,
    ));
  }

  void deleteService(Service s) {
    services.remove(s);
  }
}

String formatPrice(int amount, String suffix) {
  final s = amount.toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
    buf.write(s[i]);
  }
  return '$buf $suffix';
}

String formatPriceShort(int amount) {
  if (amount >= 1000000) {
    final m = amount / 1000000;
    return '${m.toStringAsFixed(m.truncateToDouble() == m ? 0 : 1)} млн';
  }
  if (amount >= 1000) return '${amount ~/ 1000} тыс';
  return '$amount';
}

String formatTime(DateTime d) =>
    '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

String formatMinutes(int min) =>
    '${(min ~/ 60).toString().padLeft(2, '0')}:${(min % 60).toString().padLeft(2, '0')}';

String formatDate(DateTime d) =>
    '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year}';
