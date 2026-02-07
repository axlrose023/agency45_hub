from typing import Literal

Locale = Literal["ua", "ru"]

DEFAULT_LOCALE: Locale = "ua"

MESSAGES: dict[str, dict[Locale, str]] = {
    "already_registered": {
        "ua": "Ви вже зареєстровані!",
        "ru": "Вы уже зарегистрированы!",
    },
    "use_link": {
        "ua": "Для реєстрації використайте посилання з особистого кабінету.",
        "ru": "Для регистрации используйте ссылку из личного кабинета.",
    },
    "invalid_token": {
        "ua": "Невірний токен реєстрації.",
        "ru": "Неверный токен регистрации.",
    },
    "success": {
        "ua": "✅ Ви успішно підключили Telegram!\nТепер ви будете отримувати сповіщення.",
        "ru": "✅ Вы успешно подключили Telegram!\nТеперь вы будете получать уведомления.",
    },
    "save_error": {
        "ua": "Сталася помилка при збереженні. Спробуйте ще раз.",
        "ru": "Произошла ошибка при сохранении. Попробуйте еще раз.",
    },
}


def normalize_locale(locale: str | None) -> Locale:
    if locale == "ru":
        return "ru"
    if locale in {"uk", "ua"}:
        return "ua"
    return DEFAULT_LOCALE


def detect_telegram_locale(language_code: str | None) -> Locale:
    if language_code and language_code.lower().startswith("ru"):
        return "ru"
    if language_code and language_code.lower().startswith(("uk", "ua")):
        return "ua"
    return DEFAULT_LOCALE


def get_message(key: str, locale: str | None = None) -> str:
    normalized_locale = normalize_locale(locale)
    return MESSAGES[key][normalized_locale]
