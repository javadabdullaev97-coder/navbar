// Модели повторяют структуру будущих таблиц Supabase
// (services, clients, appointments) — см. docs/project-brief.md.

enum AppointmentStatus { pending, confirmed, done, cancelled }

class Service {
  final String id;
  final String name;
  final int durationMin;
  final int price; // минимальные единицы валюты мастера

  const Service({
    required this.id,
    required this.name,
    required this.durationMin,
    required this.price,
  });
}

class Client {
  final String id;
  final String name;
  final String phone; // E.164
  int visitCount;
  DateTime? lastVisitAt;

  Client({
    required this.id,
    required this.name,
    required this.phone,
    this.visitCount = 0,
    this.lastVisitAt,
  });
}

class Appointment {
  final String id;
  final String clientId;
  final String serviceId;
  final DateTime startsAt;
  final AppointmentStatus status;

  const Appointment({
    required this.id,
    required this.clientId,
    required this.serviceId,
    required this.startsAt,
    this.status = AppointmentStatus.pending,
  });
}

class MasterProfile {
  final String name;
  final String specialization;
  final String slug;
  final String currencySuffix;

  const MasterProfile({
    required this.name,
    required this.specialization,
    required this.slug,
    required this.currencySuffix,
  });
}
