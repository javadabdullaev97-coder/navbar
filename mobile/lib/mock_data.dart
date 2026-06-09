import 'models.dart';

// Мок-хранилище в памяти. При подключении Supabase заменяется
// репозиторием с тем же интерфейсом.
class MockStore {
  MockStore._();
  static final MockStore instance = MockStore._();

  final master = const MasterProfile(
    name: 'Асрор',
    specialization: 'Барбер',
    slug: 'asror',
    currencySuffix: 'сум',
  );

  final services = const [
    Service(id: 's1', name: 'Мужская стрижка', durationMin: 60, price: 80000),
    Service(id: 's2', name: 'Стрижка + борода', durationMin: 90, price: 120000),
    Service(id: 's3', name: 'Оформление бороды', durationMin: 30, price: 50000),
    Service(id: 's4', name: 'Детская стрижка', durationMin: 45, price: 60000),
  ];

  late final List<Client> clients = [
    Client(
        id: 'c1',
        name: 'Бекзод',
        phone: '+998901112233',
        visitCount: 12,
        lastVisitAt: DateTime.now().subtract(const Duration(days: 6))),
    Client(
        id: 'c2',
        name: 'Жасур',
        phone: '+998935554411',
        visitCount: 8,
        lastVisitAt: DateTime.now().subtract(const Duration(days: 2))),
    Client(
        id: 'c3',
        name: 'Тимур',
        phone: '+998909990077',
        visitCount: 3,
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
    DateTime at(int dayOffset, int hour, [int minute = 0]) => DateTime(
        today.year, today.month, today.day + dayOffset, hour, minute);
    return [
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

  Client clientById(String id) => clients.firstWhere((c) => c.id == id);
  Service serviceById(String id) => services.firstWhere((s) => s.id == id);

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

  int todayRevenue() {
    final today = DateTime.now();
    return appointmentsOn(today)
        .where((a) => a.status != AppointmentStatus.cancelled)
        .fold(0, (sum, a) => sum + serviceById(a.serviceId).price);
  }

  Client getOrCreateClient(String name, String phone) {
    final existing = clients.where((c) => c.phone == phone);
    if (existing.isNotEmpty) return existing.first;
    final c = Client(
        id: 'c${clients.length + 1}',
        name: name,
        phone: phone,
        visitCount: 0);
    clients.add(c);
    return c;
  }

  void addAppointment({
    required Client client,
    required Service service,
    required DateTime startsAt,
  }) {
    appointments.add(Appointment(
      id: 'a${appointments.length + 1}',
      clientId: client.id,
      serviceId: service.id,
      startsAt: startsAt,
      status: AppointmentStatus.confirmed,
    ));
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

String formatTime(DateTime d) =>
    '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
