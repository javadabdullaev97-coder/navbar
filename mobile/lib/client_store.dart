import 'app_state.dart';
import 'mock_data.dart';
import 'models.dart';

// Категории каталога (ключи; названия — через i18n при необходимости)
const kCategories = [
  'Барберы',
  'Парикмахеры',
  'Ногти',
  'Брови и ресницы',
  'Макияж',
  'Массаж',
];

// Мок-хранилище клиентской стороны. При подключении Supabase заменяется
// запросами к общей БД — интерфейс сохранится.
class ClientStore {
  ClientStore._() {
    MockStore.instance.onStatusChanged = _onMasterStatusChanged;
  }
  static final ClientStore instance = ClientStore._();

  void _onMasterStatusChanged(String apptId, AppointmentStatus status) {
    for (final a in myAppointments) {
      if (a.linkedMasterApptId == apptId) a.status = status;
    }
  }

  DateTime _ago({int days = 0}) => DateTime.now().subtract(Duration(days: days));

  // Отзывы, оставленные в этой сессии (до подключения БД)
  final _extraReviews = <String, List<Review>>{};

  void addReview(String slug, Review r) =>
      _extraReviews.putIfAbsent(slug, () => []).add(r);

  List<Review> _reviewsFor(String slug, List<Review> seeded) =>
      [...seeded, ...?_extraReviews[slug]];

  // Асрор использует живые данные MockStore: если в роли мастера
  // поменять услуги или график — клиент это увидит (демо общей базы).
  List<MasterPublic> get masters => [
        MasterPublic(
          slug: 'asror',
          name: 'Асрор Каримов',
          specialization: MockStore.instance.masterSpec,
          category: 'Барберы',
          phone: '+998901234567',
          address: 'Ташкент, Чиланзар, ул. Бунёдкор 12',
          bio: 'Мужские стрижки и оформление бороды. Опыт 7 лет.',
          services: MockStore.instance.services,
          schedule: MockStore.instance.schedule,
          reviews: _reviewsFor('asror', [
            Review(author: 'Бекзод', stars: 5, text: 'Лучший фейд в городе', at: _ago(days: 12)),
            Review(author: 'Жасур', stars: 5, text: 'Хожу два года, всегда топ', at: _ago(days: 40)),
            Review(author: 'Тимур', stars: 4, text: 'Хорошо, но пришлось подождать', at: _ago(days: 90)),
            Review(author: 'Олим', stars: 5, text: 'Борода — огонь', at: _ago(days: 400)),
          ]),
          portfolio: const [
            PortfolioItem(emoji: '💈', colorSeed: 0, caption: 'Классический фейд'),
            PortfolioItem(emoji: '✂️', colorSeed: 1, caption: 'Кроп'),
            PortfolioItem(emoji: '🧔', colorSeed: 2, caption: 'Борода'),
            PortfolioItem(emoji: '💈', colorSeed: 3, caption: 'Андеркат'),
          ],
        ),
        MasterPublic(
          slug: 'sardor',
          name: 'Сардор Алиев',
          specialization: 'Барбер',
          category: 'Барберы',
          phone: '+998935550022',
          address: 'Ташкент, Мирзо-Улугбек, ул. Буюк Ипак Йули 45',
          bio: 'Классические и современные мужские стрижки.',
          services: _sardorServices,
          schedule: _defaultSchedule,
          reviews: _reviewsFor('sardor', [
            Review(author: 'Анвар', stars: 5, text: 'Быстро и чётко', at: _ago(days: 5)),
            Review(author: 'Шохрух', stars: 4, text: 'Норм, приду ещё', at: _ago(days: 60)),
          ]),
          portfolio: const [
            PortfolioItem(emoji: '✂️', colorSeed: 4, caption: 'Классика'),
            PortfolioItem(emoji: '💈', colorSeed: 5, caption: 'Фейд'),
          ],
        ),
        MasterPublic(
          slug: 'dilnoza',
          name: 'Дильноза Юсупова',
          specialization: 'Колорист, парикмахер',
          category: 'Парикмахеры',
          phone: '+998909990077',
          address: 'Ташкент, Юнусабад, ул. Амира Темура 88',
          bio: 'Окрашивание, уход, женские стрижки.',
          services: _dilnozaServices,
          schedule: _defaultSchedule,
          reviews: _reviewsFor('dilnoza', [
            Review(author: 'Малика', stars: 5, text: 'Цвет идеальный!', at: _ago(days: 8)),
            Review(author: 'Нилуфар', stars: 5, text: 'Лучший колорист Ташкента', at: _ago(days: 30)),
            Review(author: 'Зарина', stars: 4, text: 'Долго, но результат стоит того', at: _ago(days: 200)),
          ]),
          portfolio: const [
            PortfolioItem(emoji: '🎨', colorSeed: 6, caption: 'Балаяж'),
            PortfolioItem(emoji: '💇‍♀️', colorSeed: 7, caption: 'Каре'),
            PortfolioItem(emoji: '✨', colorSeed: 8, caption: 'Блонд'),
          ],
        ),
        MasterPublic(
          slug: 'gulnora',
          name: 'Гульнора Рахимова',
          specialization: 'Мастер маникюра',
          category: 'Ногти',
          phone: '+998971112255',
          address: 'Ташкент, Яккасарай, ул. Шота Руставели 21',
          bio: 'Маникюр, педикюр, дизайн.',
          services: _gulnoraServices,
          schedule: _defaultSchedule,
          reviews: _reviewsFor('gulnora', [
            Review(author: 'Камила', stars: 5, text: 'Аккуратно и красиво', at: _ago(days: 3)),
            Review(author: 'Севара', stars: 5, text: 'Дизайн супер', at: _ago(days: 25)),
          ]),
          portfolio: const [
            PortfolioItem(emoji: '💅', colorSeed: 9, caption: 'Френч'),
            PortfolioItem(emoji: '💎', colorSeed: 10, caption: 'Дизайн'),
          ],
        ),
        MasterPublic(
          slug: 'laylo',
          name: 'Лайло Ахмедова',
          specialization: 'Брови и ресницы',
          category: 'Брови и ресницы',
          phone: '+998933334466',
          address: 'Ташкент, Чиланзар, кв-л 9',
          bio: 'Архитектура бровей, ламинирование.',
          services: _layloServices,
          schedule: _defaultSchedule,
          reviews: _reviewsFor('laylo', [
            Review(author: 'Дильдора', stars: 5, text: 'Брови — произведение искусства', at: _ago(days: 15)),
          ]),
          portfolio: const [
            PortfolioItem(emoji: '👁️', colorSeed: 11, caption: 'Ламинирование'),
          ],
        ),
        MasterPublic(
          slug: 'umid',
          name: 'Умид Назаров',
          specialization: 'Массажист',
          category: 'Массаж',
          phone: '+998905557788',
          address: 'Ташкент, Мирабад, ул. Афросиаб 4',
          bio: 'Классический и спортивный массаж.',
          services: _umidServices,
          schedule: _defaultSchedule,
          reviews: _reviewsFor('umid', [
            Review(author: 'Рустам', stars: 5, text: 'Спина сказала спасибо', at: _ago(days: 7)),
            Review(author: 'Ботир', stars: 4, text: 'Хорошо, но дороговато', at: _ago(days: 50)),
          ]),
          portfolio: const [
            PortfolioItem(emoji: '💆', colorSeed: 12, caption: 'Классика'),
          ],
        ),
      ];

  static final _sardorServices = [
    Service(id: 'r1', name: 'Стрижка', durationMin: 45, price: 70000),
    Service(id: 'r2', name: 'Стрижка + борода', durationMin: 75, price: 110000),
  ];
  static final _dilnozaServices = [
    Service(id: 'd1', name: 'Женская стрижка', durationMin: 60, price: 150000),
    Service(id: 'd2', name: 'Окрашивание', durationMin: 180, price: 450000),
    Service(id: 'd3', name: 'Укладка', durationMin: 45, price: 100000),
  ];
  static final _gulnoraServices = [
    Service(id: 'g1', name: 'Маникюр', durationMin: 60, price: 90000),
    Service(id: 'g2', name: 'Педикюр', durationMin: 75, price: 120000),
    Service(id: 'g3', name: 'Покрытие гель-лак', durationMin: 45, price: 70000),
  ];
  static final _layloServices = [
    Service(id: 'l1', name: 'Коррекция бровей', durationMin: 30, price: 60000),
    Service(id: 'l2', name: 'Ламинирование ресниц', durationMin: 60, price: 150000),
  ];
  static final _umidServices = [
    Service(id: 'u1', name: 'Массаж спины', durationMin: 45, price: 130000),
    Service(id: 'u2', name: 'Общий массаж', durationMin: 90, price: 250000),
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

  // --- Каталог и поиск ---

  /// Категории в порядке интересов пользователя, затем остальные.
  List<String> orderedCategories() {
    final interests = AppState.instance.interests;
    return [
      ...kCategories.where(interests.contains),
      ...kCategories.where((c) => !interests.contains(c)),
    ];
  }

  /// Топ мастеров категории по взвешенному рейтингу.
  List<MasterPublic> topByCategory(String category) {
    final list = masters.where((m) => m.category == category).toList()
      ..sort((a, b) => b.rating.compareTo(a.rating));
    return list;
  }

  /// Поиск по имени, slug или номеру телефона.
  List<MasterPublic> search(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return [];
    final qDigits = q.replaceAll(RegExp(r'\D'), '');
    return masters.where((m) {
      if (m.name.toLowerCase().contains(q)) return true;
      if (m.slug.contains(q)) return true;
      if (qDigits.length >= 4 &&
          m.phone.replaceAll(RegExp(r'\D'), '').contains(qDigits)) {
        return true;
      }
      return false;
    }).toList();
  }

  MasterPublic bySlug(String slug) =>
      masters.firstWhere((m) => m.slug == slug);

  // --- Мои записи ---

  late final List<ClientAppointment> myAppointments = [
    ClientAppointment(
      id: 'm1',
      masterSlug: 'asror',
      masterName: 'Асрор Каримов',
      masterAddress: 'Ташкент, Чиланзар, ул. Бунёдкор 12',
      serviceNames: const ['Мужская стрижка'],
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
    return myAppointments
        .where((a) =>
            !a.startsAt.isAfter(now) || a.status == AppointmentStatus.done)
        .toList()
      ..sort((a, b) => b.startsAt.compareTo(a.startsAt));
  }

  // --- Слоты ---

  // Детерминированная имитация занятости чужими клиентами
  bool _seedBusy(MasterPublic m, DateTime day, int slotMin) {
    final seed = day.day * 31 + slotMin + m.slug.hashCode % 13;
    return seed % 7 == 0 || seed % 11 == 0;
  }

  /// Пересечение с любой моей записью (у любого мастера) —
  /// клиент не может быть в двух местах одновременно.
  ClientAppointment? conflictWithMine(DateTime start, int durationMin) {
    final end = start.add(Duration(minutes: durationMin));
    for (final a in myAppointments) {
      if (a.status == AppointmentStatus.cancelled) continue;
      final aEnd = a.startsAt.add(Duration(minutes: a.durationMin));
      if (start.isBefore(aEnd) && end.isAfter(a.startsAt)) return a;
    }
    return null;
  }

  bool _busyForMaster(MasterPublic m, DateTime day, int t, int durationMin) {
    if (_seedBusy(m, day, t)) return true;
    if (m.slug == 'asror') {
      final store = MockStore.instance;
      // Реальные записи мастера (включая ожидающие подтверждения)
      final end = t + durationMin;
      final hasOverlap = store.appointmentsOn(day).any((a) {
        if (a.status == AppointmentStatus.cancelled) return false;
        final aStart = a.startsAt.hour * 60 + a.startsAt.minute;
        final dur = store.serviceById(a.serviceId)?.durationMin ?? 60;
        return t < aStart + dur && end > aStart;
      });
      if (hasOverlap) return true;
      // Слоты, заблокированные мастером вручную
      if (store.isBlocked(day, t, durationMin)) return true;
    }
    return false;
  }

  /// Свободные слоты (минуты от полуночи) под суммарную длительность.
  /// Если выбранные услуги не влезают подряд — слот не предлагается.
  List<int> freeSlots(MasterPublic master, int totalDurationMin, DateTime day) {
    final sched = master.schedule[(day.weekday - 1) % 7];
    if (sched.isDayOff || totalDurationMin <= 0) return [];
    final now = DateTime.now();
    final isToday =
        day.year == now.year && day.month == now.month && day.day == now.day;
    final nowMin = now.hour * 60 + now.minute;

    final result = <int>[];
    for (var t = sched.startMin;
        t + totalDurationMin <= sched.endMin;
        t += 30) {
      if (isToday && t <= nowMin) continue;
      // занят ли любой 30-минутный отрезок внутри окна
      var blocked = false;
      for (var x = t; x < t + totalDurationMin; x += 30) {
        if (_busyForMaster(master, day, x, 30)) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;
      result.add(t);
    }
    return result;
  }

  /// Состояние дня для календаря месяца.
  /// past / dayOff — недоступен; full — всё занято; free — есть слоты.
  DayState dayState(MasterPublic m, int totalDurationMin, DateTime day) {
    final today = DateTime.now();
    final d0 = DateTime(day.year, day.month, day.day);
    final t0 = DateTime(today.year, today.month, today.day);
    if (d0.isBefore(t0)) return DayState.past;
    if (m.schedule[(day.weekday - 1) % 7].isDayOff) return DayState.dayOff;
    return freeSlots(m, totalDurationMin, day).isEmpty
        ? DayState.full
        : DayState.free;
  }

  // --- Запись ---

  ClientAppointment book(
      MasterPublic master, List<Service> services, DateTime startsAt) {
    final total = services.fold(0, (s, x) => s + x.durationMin);
    final price = services.fold(0, (s, x) => s + x.price);
    final a = ClientAppointment(
      id: 'm${myAppointments.length + 1}',
      masterSlug: master.slug,
      masterName: master.name,
      masterAddress: master.address,
      serviceNames: services.map((s) => s.name).toList(),
      durationMin: total,
      price: price,
      startsAt: startsAt,
      status: AppointmentStatus.pending, // ждёт подтверждения мастера
    );
    myAppointments.add(a);

    // Демо общей базы: запись к Асрору попадает в кабинет мастера
    // как заявка «ожидает» — мастер подтверждает её сам
    if (master.slug == 'asror') {
      final store = MockStore.instance;
      final me = store.getOrCreateClient(
        AppState.instance.name.isNotEmpty ? AppState.instance.name : 'Клиент',
        AppState.instance.phone,
      );
      final linked = store.addAppointment(
        client: me,
        service: services.first,
        startsAt: startsAt,
        status: AppointmentStatus.pending,
      );
      a.linkedMasterApptId = linked.id;
    }
    return a;
  }

  void cancel(ClientAppointment a) {
    a.status = AppointmentStatus.cancelled;
  }
}

enum DayState { past, dayOff, full, free }
