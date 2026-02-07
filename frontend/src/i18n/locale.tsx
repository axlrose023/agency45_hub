/* eslint-disable react-refresh/only-export-components */

import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Locale = 'ua' | 'ru';

const DEFAULT_LOCALE: Locale = 'ua';
const STORAGE_KEY = 'agency45_locale';
const SUPPORTED_LOCALES: readonly Locale[] = ['ua', 'ru'];

const translations: Record<Locale, Record<string, string>> = {
  ua: {
    languageUkrainian: 'Українська',
    languageRussian: 'Російська',
    navDashboard: 'Дашборд',
    navUsers: 'Користувачі',
    navProfile: 'Профіль',
    roleAdmin: 'Адмін',
    roleUser: 'Користувач',
    logout: 'Вийти',
    loginSubtitle: 'Увійдіть у свій акаунт',
    loginUsername: "Ім'я користувача",
    loginPassword: 'Пароль',
    loginEnterUsername: "Введіть ім'я користувача",
    loginEnterPassword: 'Введіть пароль',
    loginInvalidCredentials: "Невірне ім'я користувача або пароль",
    loginSigningIn: 'Вхід...',
    loginSignIn: 'Увійти',
    loginFooter: 'Платформа керування рекламою',
    dashboardLoadAccountsError: 'Не вдалося завантажити рекламні кабінети',
    dashboardAdAccounts: 'Рекламні кабінети',
    dashboardNoAccountsTitle: 'Немає рекламних кабінетів',
    dashboardNoAccountsDescription:
      'Рекламні кабінети недоступні. Зверніться до адміністратора.',
    dashboardYourAdAccount: 'Ваш рекламний кабінет',
    dashboardClickPerformance: 'Натисніть, щоб подивитися ефективність кампаній',
    dashboardSelectAccountPerformance:
      'Оберіть кабінет, щоб подивитися ефективність кампаній',
    accountUnnamed: 'Кабінет без назви',
    accountActive: 'Активний',
    accountInactive: 'Неактивний',
    adAccountLoadCampaignsError: 'Не вдалося завантажити кампанії',
    backToAccounts: 'Назад до кабінетів',
    campaignsByObjective: 'Кампанії за цілями',
    accountLabel: 'Кабінет',
    noActiveCampaignsTitle: 'Немає активних кампаній',
    noActiveCampaignsDescription:
      'У вибраному періоді в цьому рекламному кабінеті немає активних кампаній.',
    campaignsCountLabel: 'кампаній',
    backToObjectives: 'Назад до цілей',
    campaignsTitleSuffix: 'кампанії',
    noCampaignsTitle: 'Немає кампаній',
    noCampaignsDescription: 'Для цієї цілі кампанії не знайдені.',
    unnamedCampaign: 'Кампанія без назви',
    adSetsLoadError: 'Не вдалося завантажити групи оголошень',
    backToCampaigns: 'Назад до кампаній',
    adSetsTitle: 'Групи оголошень',
    campaignLabel: 'Кампанія',
    adSetsCountLabel: 'груп оголошень',
    noAdSetsTitle: 'Немає груп оголошень',
    noAdSetsDescription:
      'Для цієї кампанії не знайдено активних груп оголошень.',
    unnamedAdSet: 'Група оголошень без назви',
    targetAge: 'Вік',
    targetGender: 'Стать',
    targetGenderMale: 'Чоловіки',
    targetGenderFemale: 'Жінки',
    targetGenderAll: 'Усі',
    adsLoadError: 'Не вдалося завантажити оголошення',
    backToAdSets: 'Назад до груп оголошень',
    adsTitle: 'Оголошення',
    adSetLabel: 'Група оголошень',
    adsCountLabel: 'оголошень',
    noAdsTitle: 'Немає оголошень',
    noAdsDescription: 'Для цієї групи оголошень активних оголошень не знайдено.',
    adCreativeAlt: 'Креатив оголошення',
    unnamedAd: 'Оголошення без назви',
    usersTitle: 'Користувачі',
    usersSubtitle: 'Керування користувачами та привʼязкою кабінетів',
    createUser: 'Створити користувача',
    searchUsersPlaceholder: 'Пошук користувачів...',
    noUsersFoundTitle: 'Користувачів не знайдено',
    noUsersFoundDescription: 'За вашим запитом користувачів не знайдено.',
    tableUser: 'Користувач',
    tableRole: 'Роль',
    tableAdAccount: 'Рекламний кабінет',
    tableTelegram: 'Telegram',
    tableActions: 'Дії',
    telegramConnected: 'Підключено',
    telegramNotConnected: 'Не підключено',
    createUserModalTitle: 'Створити користувача',
    editUserModalTitle: 'Редагувати користувача',
    editUser: 'Редагувати',
    usernameLabel: "Ім'я користувача",
    passwordLabel: 'Пароль',
    adAccountLabel: 'Рекламний кабінет',
    enterUsername: "Введіть ім'я користувача",
    enterPassword: 'Введіть пароль',
    noAccountAssigned: 'Кабінет не призначено',
    createUserFailed: 'Не вдалося створити користувача',
    updateUserFailed: 'Не вдалося оновити користувача',
    creatingUser: 'Створення...',
    updatingUser: 'Оновлення...',
    saveChanges: 'Зберегти зміни',
    profileTitle: 'Профіль',
    profileSubtitle: 'Інформація про ваш акаунт',
    profileRoleAdmin: 'Адміністратор',
    profileRoleUser: 'Користувач',
    telegramIntegrationTitle: 'Інтеграція Telegram',
    connected: 'Підключено',
    chatIdLabel: 'Chat ID',
    disconnectTelegram: 'Відключити Telegram',
    waitingTelegramConnection: "Очікування підключення Telegram...",
    waitingTelegramDescription:
      'Мало відкритися вікно Telegram. Натисніть Start у боті, щоб завершити підключення. Сторінка оновиться автоматично.',
    openTelegramAgain: 'Відкрити Telegram ще раз',
    checkStatus: 'Перевірити статус',
    connectTelegramDescription:
      'Підключіть свій Telegram-акаунт, щоб отримувати сповіщення.',
    connectTelegram: 'Підключити Telegram',
    connecting: 'Підключення...',
    registrationLinkFailed:
      'Не вдалося згенерувати посилання для реєстрації. Спробуйте ще раз.',
    signOut: 'Вийти з акаунту',
    datePresetToday: 'Сьогодні',
    datePresetThisMonth: 'Цей місяць',
    datePresetLast7Days: 'Останні 7 днів',
    datePresetLast30Days: 'Останні 30 днів',
    datePresetLastMonth: 'Минулий місяць',
    dateFrom: 'Від',
    dateTo: 'До',
    dateApply: 'Застосувати',
    facebookInvalidTimeRange: 'Змініть time range.',
    facebookNotConnected: 'Facebook не підключено',
    facebookNotConnectedDescription: 'Підключіть Facebook-акаунт, щоб отримувати дані рекламних кабінетів.',
    facebookConnectButton: 'Увійти через Facebook',
    facebookConnecting: 'Підключення...',
    facebookConnectError: 'Не вдалося підключити Facebook. Спробуйте ще раз.',
    facebookConnectSuccess: 'Facebook успішно підключено!',
    facebookReconnect: 'Переподключити Facebook',
    facebookContactAdmin: 'Зверніться до адміністратора для підключення Facebook-акаунту.',
    statusActive: 'Активна',
    statusPaused: 'Призупинена',
    statusDeleted: 'Видалена',
    statusArchived: 'Архівна',
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
  },
  ru: {
    languageUkrainian: 'Украинский',
    languageRussian: 'Русский',
    navDashboard: 'Дашборд',
    navUsers: 'Пользователи',
    navProfile: 'Профиль',
    roleAdmin: 'Админ',
    roleUser: 'Пользователь',
    logout: 'Выйти',
    loginSubtitle: 'Войдите в аккаунт',
    loginUsername: 'Имя пользователя',
    loginPassword: 'Пароль',
    loginEnterUsername: 'Введите имя пользователя',
    loginEnterPassword: 'Введите пароль',
    loginInvalidCredentials: 'Неверное имя пользователя или пароль',
    loginSigningIn: 'Вход...',
    loginSignIn: 'Войти',
    loginFooter: 'Платформа управления рекламой',
    dashboardLoadAccountsError: 'Не удалось загрузить рекламные кабинеты',
    dashboardAdAccounts: 'Рекламные кабинеты',
    dashboardNoAccountsTitle: 'Нет рекламных кабинетов',
    dashboardNoAccountsDescription:
      'Рекламные кабинеты недоступны. Обратитесь к администратору.',
    dashboardYourAdAccount: 'Ваш рекламный кабинет',
    dashboardClickPerformance: 'Нажмите, чтобы посмотреть эффективность кампаний',
    dashboardSelectAccountPerformance:
      'Выберите кабинет, чтобы посмотреть эффективность кампаний',
    accountUnnamed: 'Кабинет без названия',
    accountActive: 'Активный',
    accountInactive: 'Неактивный',
    adAccountLoadCampaignsError: 'Не удалось загрузить кампании',
    backToAccounts: 'Назад к кабинетам',
    campaignsByObjective: 'Кампании по целям',
    accountLabel: 'Кабинет',
    noActiveCampaignsTitle: 'Нет активных кампаний',
    noActiveCampaignsDescription:
      'В выбранном периоде в этом рекламном кабинете нет активных кампаний.',
    campaignsCountLabel: 'кампаний',
    backToObjectives: 'Назад к целям',
    campaignsTitleSuffix: 'кампании',
    noCampaignsTitle: 'Нет кампаний',
    noCampaignsDescription: 'Для этой цели кампании не найдены.',
    unnamedCampaign: 'Кампания без названия',
    adSetsLoadError: 'Не удалось загрузить группы объявлений',
    backToCampaigns: 'Назад к кампаниям',
    adSetsTitle: 'Группы объявлений',
    campaignLabel: 'Кампания',
    adSetsCountLabel: 'групп объявлений',
    noAdSetsTitle: 'Нет групп объявлений',
    noAdSetsDescription:
      'Для этой кампании не найдено активных групп объявлений.',
    unnamedAdSet: 'Группа объявлений без названия',
    targetAge: 'Возраст',
    targetGender: 'Пол',
    targetGenderMale: 'Мужчины',
    targetGenderFemale: 'Женщины',
    targetGenderAll: 'Все',
    adsLoadError: 'Не удалось загрузить объявления',
    backToAdSets: 'Назад к группам объявлений',
    adsTitle: 'Объявления',
    adSetLabel: 'Группа объявлений',
    adsCountLabel: 'объявлений',
    noAdsTitle: 'Нет объявлений',
    noAdsDescription:
      'Для этой группы объявлений активные объявления не найдены.',
    adCreativeAlt: 'Креатив объявления',
    unnamedAd: 'Объявление без названия',
    usersTitle: 'Пользователи',
    usersSubtitle: 'Управление пользователями и назначением кабинетов',
    createUser: 'Создать пользователя',
    searchUsersPlaceholder: 'Поиск пользователей...',
    noUsersFoundTitle: 'Пользователи не найдены',
    noUsersFoundDescription: 'По вашему запросу пользователи не найдены.',
    tableUser: 'Пользователь',
    tableRole: 'Роль',
    tableAdAccount: 'Рекламный кабинет',
    tableTelegram: 'Telegram',
    tableActions: 'Действия',
    telegramConnected: 'Подключен',
    telegramNotConnected: 'Не подключен',
    createUserModalTitle: 'Создать пользователя',
    editUserModalTitle: 'Редактировать пользователя',
    editUser: 'Редактировать',
    usernameLabel: 'Имя пользователя',
    passwordLabel: 'Пароль',
    adAccountLabel: 'Рекламный кабинет',
    enterUsername: 'Введите имя пользователя',
    enterPassword: 'Введите пароль',
    noAccountAssigned: 'Кабинет не назначен',
    createUserFailed: 'Не удалось создать пользователя',
    updateUserFailed: 'Не удалось обновить пользователя',
    creatingUser: 'Создание...',
    updatingUser: 'Обновление...',
    saveChanges: 'Сохранить изменения',
    profileTitle: 'Профиль',
    profileSubtitle: 'Информация о вашем аккаунте',
    profileRoleAdmin: 'Администратор',
    profileRoleUser: 'Пользователь',
    telegramIntegrationTitle: 'Интеграция Telegram',
    connected: 'Подключен',
    chatIdLabel: 'Chat ID',
    disconnectTelegram: 'Отключить Telegram',
    waitingTelegramConnection: 'Ожидание подключения Telegram...',
    waitingTelegramDescription:
      'Должно было открыться окно Telegram. Нажмите Start в боте, чтобы завершить подключение. Страница обновится автоматически.',
    openTelegramAgain: 'Открыть Telegram снова',
    checkStatus: 'Проверить статус',
    connectTelegramDescription:
      'Подключите свой Telegram-аккаунт, чтобы получать уведомления.',
    connectTelegram: 'Подключить Telegram',
    connecting: 'Подключение...',
    registrationLinkFailed:
      'Не удалось сгенерировать ссылку для регистрации. Попробуйте еще раз.',
    signOut: 'Выйти из аккаунта',
    datePresetToday: 'Сегодня',
    datePresetThisMonth: 'Этот месяц',
    datePresetLast7Days: 'Последние 7 дней',
    datePresetLast30Days: 'Последние 30 дней',
    datePresetLastMonth: 'Прошлый месяц',
    dateFrom: 'С',
    dateTo: 'По',
    dateApply: 'Применить',
    facebookInvalidTimeRange: 'Измените time range.',
    facebookNotConnected: 'Facebook не подключён',
    facebookNotConnectedDescription: 'Подключите Facebook-аккаунт, чтобы получать данные рекламных кабинетов.',
    facebookConnectButton: 'Войти через Facebook',
    facebookConnecting: 'Подключение...',
    facebookConnectError: 'Не удалось подключить Facebook. Попробуйте ещё раз.',
    facebookConnectSuccess: 'Facebook успешно подключён!',
    facebookReconnect: 'Переподключить Facebook',
    facebookContactAdmin: 'Обратитесь к администратору для подключения Facebook-аккаунта.',
    statusActive: 'Активна',
    statusPaused: 'Приостановлена',
    statusDeleted: 'Удалена',
    statusArchived: 'Архивная',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
  },
};

function isLocale(value: string | null): value is Locale {
  if (!value) {
    return false;
  }
  return SUPPORTED_LOCALES.includes(value as Locale);
}

function detectBrowserLocale(): Locale {
  const lang = navigator.language?.toLowerCase() ?? '';
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('uk') || lang.startsWith('ua')) return 'ua';
  return DEFAULT_LOCALE;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'uk') {
    return 'ua';
  }
  if (isLocale(stored)) return stored;
  return detectBrowserLocale();
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const t = useCallback(
    (key: string) =>
      translations[locale][key] ?? translations[DEFAULT_LOCALE][key] ?? key,
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useI18n must be used within LocaleProvider');
  }
  return context;
}
