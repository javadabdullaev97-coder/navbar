// Все строки интерфейса — только отсюда (см. docs/architecture.md).
// Сейчас заполнен русский; uz/en/es добавляются без правки экранов.

class S {
  static const chooseRole = 'Кто вы?';
  static const roleMaster = 'Мастер';
  static const roleMasterDesc = 'Веду расписание и принимаю записи';
  static const roleClient = 'Клиент';
  static const roleClientDesc = 'Записываюсь к своим мастерам';

  // Онбординг
  static const phoneTitle = 'Ваш номер телефона';
  static const phoneSubtitle = 'Отправим код подтверждения';
  static const continueBtn = 'Продолжить';
  static const otpTitle = 'Код из SMS';
  static const otpSubtitle = 'Отправили код на номер';
  static const otpTestHint = 'Тестовый режим: введите 0000';
  static const otpWrong = 'Неверный код';
  static const profileTitle = 'Расскажите о себе';
  static const profileName = 'Имя';
  static const profileSpec = 'Специализация';
  static const profileSpecHint = 'Барбер, парикмахер, мастер маникюра…';
  static const profileAddress = 'Адрес';
  static const profileAddressHint = 'Город, район, улица';
  static const profileSlug = 'Ссылка для записи';
  static const profileSlugHint = 'например: asror';
  static const start = 'Начать';
  static const errPhone = 'Введите номер в формате +998 XX XXX XX XX';
  static const errRequired = 'Заполните обязательные поля';

  static const navSchedule = 'Расписание';
  static const navClients = 'Клиенты';
  static const navAnalytics = 'Аналитика';
  static const navSettings = 'Настройки';

  static const greeting = 'Салом';
  static const statToday = 'записей сегодня';
  static const statRevenue = 'выручка сегодня';
  static const statClients = 'клиентов';
  static const noAppointments = 'На этот день записей нет';
  static const statusConfirmed = 'подтверждена';
  static const statusPending = 'ожидает';
  static const statusDone = 'выполнена';
  static const statusCancelled = 'отменена';
  static const actionConfirm = 'Подтвердить';
  static const actionDone = 'Выполнена';
  static const actionCancel = 'Отменить запись';

  static const newAppointment = 'Новая запись';
  static const clientName = 'Имя клиента';
  static const clientPhone = 'Телефон';
  static const service = 'Услуга';
  static const date = 'Дата';
  static const time = 'Время';
  static const save = 'Сохранить';
  static const fillAllFields = 'Заполните все поля';

  static const searchClients = 'Поиск по имени или номеру';
  static const visits = 'визитов';
  static const lastVisit = 'был(а)';
  static const daysAgo = 'дн. назад';
  static const clientsLimit = 'клиентов на бесплатном тарифе';
  static const newClient = 'Новый клиент';
  static const notes = 'Заметки';
  static const notesHint = 'Предпочтения, особенности, любимая стрижка…';
  static const visitHistory = 'История визитов';
  static const noVisits = 'Визитов пока не было';

  // Аналитика
  static const periodWeek = 'Неделя';
  static const periodMonth = 'Месяц';
  static const period3Months = '3 месяца';
  static const revenueFor = 'Выручка за период';
  static const byServices = 'По услугам';
  static const analyticsLocked = 'Аналитика доступна на тарифе Про';
  static const analyticsLockedDesc =
      'Выручка по дням, разбивка по услугам, динамика клиентской базы';

  // Настройки
  static const tariffFree = 'Бесплатный тариф';
  static const tariffPro = 'Тариф Про';
  static const tariffUpgrade = 'Перейти на Про';
  static const tariffMockTitle = 'Оплата появится позже';
  static const tariffMockText =
      'Подключение Payme/Click — следующий этап. Включить Про в тестовом режиме?';
  static const tariffMockEnable = 'Включить для теста';
  static const tariffDisable = 'Выключить Про (тест)';
  static const myPage = 'Моя страница';
  static const myServices = 'Услуги и цены';
  static const workHours = 'График работы';
  static const profile = 'Профиль';
  static const linkCopied = 'Ссылка скопирована';
  static const logout = 'Выйти (сбросить онбординг)';

  // Услуги
  static const newService = 'Новая услуга';
  static const editService = 'Услуга';
  static const serviceName = 'Название';
  static const durationMin = 'Длительность, мин';
  static const price = 'Цена';
  static const delete = 'Удалить';

  // График
  static const dayOff = 'Выходной';

  static const clientComingSoon =
      'Кабинет клиента появится в следующей версии.\nПока запись — по ссылке мастера.';
  static const backToRoleSelect = 'Вернуться к выбору роли';
  static const min = 'мин';
  static const back = 'Назад';
  static const cancel = 'Отмена';

  static const dows = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
  static const dowsFull = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
  ];
}
