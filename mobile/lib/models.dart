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
  // Анонимные оценки от мастеров: храним только агрегат,
  // отдельные оценки не раскрываются никому
  int ratingSum;
  int ratingCount;

  Client({
    required this.id,
    required this.name,
    required this.phone,
    this.notes = '',
    this.visitCount = 0,
    this.lastVisitAt,
    this.ratingSum = 0,
    this.ratingCount = 0,
  });

  double? get rating =>
      ratingCount == 0 ? null : ratingSum / ratingCount;
}

class Review {
  final String author;
  final int stars; // 1..5
  final String text;
  final DateTime at;

  const Review({
    required this.author,
    required this.stars,
    required this.text,
    required this.at,
  });
}

class PortfolioItem {
  final String emoji;
  final int colorSeed; // подменим на фото при подключении Storage
  final String caption;

  const PortfolioItem({
    required this.emoji,
    required this.colorSeed,
    required this.caption,
  });
}

// Публичный профиль мастера — то, что видит клиент
// (аналог будущего запроса к masters + services + schedules).
class MasterPublic {
  final String slug;
  final String name;
  final String specialization;
  final String category;
  final String phone; // E.164, для поиска
  final String address;
  final String bio;
  final List<Service> services;
  final List<ScheduleDay> schedule;
  final List<Review> reviews;
  final List<PortfolioItem> portfolio;

  const MasterPublic({
    required this.slug,
    required this.name,
    required this.specialization,
    required this.category,
    required this.phone,
    required this.address,
    required this.bio,
    required this.services,
    required this.schedule,
    this.reviews = const [],
    this.portfolio = const [],
  });

  // Взвешенный рейтинг: свежие отзывы (до года) весят 1.0, старше — 0.4.
  // Отзывы не удаляем — история мастера это его капитал.
  double get rating {
    if (reviews.isEmpty) return 0;
    final now = DateTime.now();
    double sum = 0, weight = 0;
    for (final r in reviews) {
      final w = now.difference(r.at).inDays > 365 ? 0.4 : 1.0;
      sum += r.stars * w;
      weight += w;
    }
    return sum / weight;
  }
}

// Запись глазами клиента (денормализована, как вернёт API).
// Может включать несколько услуг подряд.
class ClientAppointment {
  final String id;
  final String masterSlug;
  final String masterName;
  final String masterAddress;
  final List<String> serviceNames;
  final int durationMin; // суммарная длительность
  final int price; // суммарная цена
  final DateTime startsAt;
  AppointmentStatus status;
  String? linkedMasterApptId; // связь с записью в кабинете мастера (демо)
  bool reviewed = false;

  ClientAppointment({
    required this.id,
    required this.masterSlug,
    required this.masterName,
    required this.masterAddress,
    required this.serviceNames,
    required this.durationMin,
    required this.price,
    required this.startsAt,
    this.status = AppointmentStatus.pending,
    this.linkedMasterApptId,
  });

  String get serviceName => serviceNames.join(' + ');
}

class ChatMessage {
  final String masterSlug;
  final bool fromClient;
  final String text;
  final DateTime at;

  const ChatMessage({
    required this.masterSlug,
    required this.fromClient,
    required this.text,
    required this.at,
  });
}

// Слот, заблокированный мастером вручную («появились дела»)
class BlockedSlot {
  final DateTime day; // дата без времени
  final int startMin;
  final int endMin;
  final String? note;

  const BlockedSlot({
    required this.day,
    required this.startMin,
    required this.endMin,
    this.note,
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
