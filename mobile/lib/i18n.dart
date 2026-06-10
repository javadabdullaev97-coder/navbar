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
  static const errPhone =
      'Введите номер с кодом страны, например +998 90 123 45 67';
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

  // Кабинет клиента
  static const backToRoleSelect = 'Вернуться к выбору роли';
  static const interestsTitle = 'Что вас интересует?';
  static const interestsSubtitle =
      'Подберём лучших мастеров по вашим интересам';
  static const searchMasters = 'Имя мастера или номер телефона';
  static const topMasters = 'Лучшие мастера';
  static const allCategories = 'Категории';
  static const nothingFound = 'Ничего не найдено';
  static const reviewsTitle = 'Отзывы';
  static const portfolioTitle = 'Портфолио';
  static const servicesTitle = 'Услуги';
  static const totalLabel = 'Итого';
  static const chooseSlots = 'Выбрать время';
  static const writeMessage = 'Написать';
  static const chatTitle = 'Чат';
  static const messageHint = 'Сообщение…';
  static const navChats = 'Чаты';
  static const noChats = 'Пока нет переписок';
  static const pendingConfirm = 'Ожидает подтверждения мастера';
  static const conflictTitle = 'Вы уже записаны';
  static const conflictText =
      'В это время у вас запись: {что}. Выберите другое время.';
  static const ok = 'Понятно';
  static const leaveReview = 'Оценить';
  static const yourReview = 'Ваш отзыв';
  static const send = 'Отправить';
  static const reviewThanks = 'Спасибо за отзыв!';
  static const blockSlotTitle = 'Заблокировать время';
  static const blockSlot = 'Заблокировать';
  static const blockedLabel = 'Заблокировано';
  static const unblock = 'Разблокировать';
  static const language = 'Язык';
  static const langNote = 'Перевод интерфейса — на этапе локализации';
  static const yourName = 'Как вас зовут?';
  static const upcoming = 'Ближайшая запись';
  static const myMasters = 'Мои мастера';
  static const historyTitle = 'История визитов';
  static const noUpcoming = 'Запишитесь к мастеру — запись появится здесь';
  static const bookBtn = 'Записаться';
  static const chooseService = 'Выберите услугу';
  static const chooseDate = 'Дата';
  static const chooseTime = 'Время';
  static const noSlots = 'На этот день свободного времени нет';
  static const bookFor = 'Записаться';
  static const booked = 'Вы записаны!';
  static const bookedReminder = 'Напомним за 2 часа до визита';
  static const done = 'Готово';
  static const cancelBooking = 'Отменить запись';
  static const cancelBookingQ = 'Отменить эту запись?';
  static const yesCancel = 'Да, отменить';
  static const keepBooking = 'Оставить';
  static const connectTelegram = 'Подключить Telegram';
  static const connectTelegramDesc = 'Напоминания о записях в Telegram';
  static const stubExternal = 'Появится на этапе интеграций';
  static const changeRole = 'Сменить роль';
  static const clientProfile = 'Профиль';
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
