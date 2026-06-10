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

// Публичный профиль мастера — то, что видит клиент
// (аналог будущего запроса к masters + services + schedules).
class MasterPublic {
  final String slug;
  final String name;
  final String specialization;
  final String address;
  final String bio;
  final List<Service> services;
  final List<ScheduleDay> schedule;

  const MasterPublic({
    required this.slug,
    required this.name,
    required this.specialization,
    required this.address,
    required this.bio,
    required this.services,
    required this.schedule,
  });
}

// Запись глазами клиента (денормализована, как вернёт API)
class ClientAppointment {
  final String id;
  final String masterSlug;
  final String masterName;
  final String masterAddress;
  final String serviceName;
  final int durationMin;
  final int price;
  final DateTime startsAt;
  AppointmentStatus status;

  ClientAppointment({
    required this.id,
    required this.masterSlug,
    required this.masterName,
    required this.masterAddress,
    required this.serviceName,
    required this.durationMin,
    required this.price,
    required this.startsAt,
    this.status = AppointmentStatus.confirmed,
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
