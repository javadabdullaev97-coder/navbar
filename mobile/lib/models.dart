// Модели повторяют структуру будущих таблиц Supabase
// (services, clients, appointments, schedules) — см. docs/project-brief.md.

enum AppointmentStatus { pending, confirmed, done, cancelled }

class Service {
  final String id;
  String name; // тексты услуг пишет сам мастер, они не переводятся
  int durationMin;
  int price; // минимальные единицы валюты мастера

  Service({
    required this.id,
    required this.name,
    required this.durationMin,
    required this.price,
  });
}

class ScheduleDay {
  final int dayOfWeek; // 0=пн ... 6=вс
  int startMin; // минуты от полуночи
  int endMin;
  bool isDayOff;

  ScheduleDay({
    required this.dayOfWeek,
    required this.startMin,
    required this.endMin,
    this.isDayOff = false,
  });
}

class Client {
  final String id;
  String name;
  String phone; // E.164
  String notes;
  int visitCount;
  DateTime? lastVisitAt;

  Client({
    required this.id,
    required this.name,
    required this.phone,
    this.notes = '',
    this.visitCount = 0,
    this.lastVisitAt,
  });
}

class Appointment {
  final String id;
  final String clientId;
  final String serviceId;
  final DateTime startsAt;
  AppointmentStatus status;

  Appointment({
    required this.id,
    required this.clientId,
    required this.serviceId,
    required this.startsAt,
    this.status = AppointmentStatus.pending,
  });
}
