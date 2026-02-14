import logging
from datetime import date, datetime, timedelta
from typing import Any, Literal

from aiogram import Bot
from aiogram.enums import ParseMode

from app.api.modules.facebook.gateway import FacebookAuthGateway
from app.api.modules.telegram.gateway import TelegramGateway
from app.api.modules.users.gateway import UserGateway
from app.api.modules.users.models import User
from app.clients.facebook import FacebookClient

logger = logging.getLogger(__name__)

Locale = Literal["ua", "ru"]

# ── i18n labels ─────────────────────────────────

_LABELS: dict[str, dict[Locale, str]] = {
    "period_today": {"ua": "Сьогодні", "ru": "Сегодня"},
    "period_yesterday": {"ua": "Вчора", "ru": "Вчера"},
    "period_week": {"ua": "За тиждень", "ru": "За неделю"},
    "period_month": {"ua": "За місяць", "ru": "За месяц"},
    "period_last30": {"ua": "За 30 днів", "ru": "За 30 дней"},
    "period_default": {"ua": "Звіт", "ru": "Отчёт"},
    "spend": {"ua": "Витрати", "ru": "Расходы"},
    "impressions": {"ua": "Покази", "ru": "Показы"},
    "clicks": {"ua": "Кліки", "ru": "Клики"},
    "cpc": {"ua": "Ціна/клік", "ru": "Цена/клик"},
    "ctr": {"ua": "CTR", "ru": "CTR"},
    "reach": {"ua": "Охоплення", "ru": "Охват"},
    "conversations": {"ua": "Запити", "ru": "Запросы"},
}


def _l(key: str, locale: Locale = "ua") -> str:
    entry = _LABELS.get(key)
    if not entry:
        return key
    return entry.get(locale, entry.get("ua", key))


def _build_time_range(period: str) -> dict[str, str]:
    today = date.today()
    if period == "yesterday":
        d = today - timedelta(days=1)
        return {"since": d.strftime("%Y-%m-%d"), "until": d.strftime("%Y-%m-%d")}
    if period == "week":
        since = today - timedelta(days=6)
        return {"since": since.strftime("%Y-%m-%d"), "until": today.strftime("%Y-%m-%d")}
    if period == "month":
        start = today.replace(day=1)
        return {"since": start.strftime("%Y-%m-%d"), "until": today.strftime("%Y-%m-%d")}
    if period == "last30":
        since = today - timedelta(days=29)
        return {"since": since.strftime("%Y-%m-%d"), "until": today.strftime("%Y-%m-%d")}
    return {"since": today.strftime("%Y-%m-%d"), "until": today.strftime("%Y-%m-%d")}


def _period_label(period: str, locale: Locale = "ua") -> str:
    key = f"period_{period}"
    return _l(key, locale) if key in _LABELS else _l("period_default", locale)


def _n(value: str | None) -> str:
    """Format number."""
    if not value:
        return "0"
    try:
        num = float(value)
        if num == int(num):
            return f"{int(num):,}".replace(",", " ")
        return f"{num:,.2f}".replace(",", " ")
    except (ValueError, TypeError):
        return value or "0"


_CURRENCY_SYMBOLS: dict[str, str] = {
    "USD": "$",
    "UAH": "₴",
    "ILS": "₪",
    "EUR": "€",
    "GBP": "£",
}


def _c(value: str | None, currency: str = "USD") -> str:
    """Format currency."""
    sym = _CURRENCY_SYMBOLS.get(currency, currency + " ")
    if not value:
        return f"{sym}0"
    try:
        num = float(value)
        if num == 0:
            return f"{sym}0"
        return f"{sym}{num:,.2f}".replace(",", " ")
    except (ValueError, TypeError):
        return value or f"{sym}0"


def _p(value: str | None) -> str:
    """Format percent."""
    if not value:
        return "0%"
    try:
        return f"{float(value):.2f}%"
    except (ValueError, TypeError):
        return value or "0%"


def _aggregate(campaigns: list[dict[str, Any]]) -> dict[str, float]:
    t: dict[str, float] = {
        "spend": 0, "impressions": 0, "clicks": 0,
        "reach": 0, "conversations": 0,
    }
    for c in campaigns:
        ins = c.get("insights") or {}
        for key in t:
            try:
                t[key] += float(ins.get(key) or 0)
            except (ValueError, TypeError):
                pass
    t["ctr"] = (t["clicks"] / t["impressions"] * 100) if t["impressions"] else 0
    t["cpm"] = (t["spend"] / t["impressions"] * 1000) if t["impressions"] else 0
    t["cpc"] = (t["spend"] / t["clicks"]) if t["clicks"] else 0
    return t


def _group_by_objective(
    campaigns: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for c in campaigns:
        obj = c.get("objective") or "OTHER"
        groups.setdefault(obj, []).append(c)
    return groups


def _metrics_lines(
    t: dict[str, float],
    indent: str = "",
    currency: str = "USD",
    locale: Locale = "ua",
) -> list[str]:
    lines = [
        f"{indent}💰 {_l('spend', locale)}: {_c(str(t['spend']), currency)}",
        f"{indent}👁 {_l('impressions', locale)}: {_n(str(t['impressions']))}",
        f"{indent}🖱 {_l('clicks', locale)}: {_n(str(t['clicks']))}",
        f"{indent}💵 {_l('cpc', locale)}: {_c(str(t['cpc']), currency)}",
        f"{indent}📈 {_l('ctr', locale)}: {_p(str(t['ctr']))}",
        f"{indent}👥 {_l('reach', locale)}: {_n(str(t['reach']))}",
    ]
    if t.get("conversations", 0) > 0:
        lines.append(
            f"{indent}💬 {_l('conversations', locale)}: {_n(str(int(t['conversations'])))}"
        )
    return lines


def _obj_block(
    obj: str,
    campaigns: list[dict[str, Any]],
    indent: str = "",
    currency: str = "USD",
    locale: Locale = "ua",
) -> list[str]:
    t = _aggregate(campaigns)
    name = obj.replace("_", " ").title()
    active = sum(1 for c in campaigns if c.get("status") == "ACTIVE")
    paused = len(campaigns) - active
    count_label = str(len(campaigns))
    if paused > 0 and active > 0:
        count_label = f"{active} ✅ / {paused} ⏸"
    elif paused > 0:
        count_label = f"{len(campaigns)} ⏸"
    lines = [f"{indent}🎯 <b>{name}</b> ({count_label})"]
    lines.extend(_metrics_lines(t, indent, currency, locale))
    return lines


# ── Admin report ─────────────────────────────────


def _format_admin_report(
    accounts: list[dict[str, Any]],
    period: str,
    time_range: dict[str, str],
    locale: Locale = "ua",
) -> str:
    today_str = datetime.now().strftime("%d.%m.%Y")

    parts = [f"📊 <b>{_period_label(period, locale)}</b> | {today_str}"]
    if time_range["since"] != time_range["until"]:
        parts.append(f"📅 {time_range['since']} — {time_range['until']}")

    for idx, acc in enumerate(accounts, 1):
        campaigns = acc["campaigns"]
        by_obj = _group_by_objective(campaigns)
        total = _aggregate(campaigns)
        cur = acc.get("currency") or "USD"

        parts.append("")
        parts.append(f"▎<b>{idx}. {acc['name']}</b>")
        parts.append(
            f"   💰 {_c(str(total['spend']), cur)}  "
            f"🖱 {_n(str(total['clicks']))}  "
            f"📈 {_p(str(total['ctr']))}"
        )

        for obj, obj_c in sorted(by_obj.items()):
            parts.append("")
            parts.extend(_obj_block(obj, obj_c, "   ", cur, locale))

        if idx < len(accounts):
            parts.append("")
            parts.append("· · · · · · · · · · ·")

    return "\n".join(parts)


# ── User report ──────────────────────────────────


def _format_user_report(
    account: dict[str, Any],
    period: str,
    time_range: dict[str, str],
    locale: Locale = "ua",
) -> str:
    today_str = datetime.now().strftime("%d.%m.%Y")
    campaigns = account["campaigns"]
    total = _aggregate(campaigns)
    cur = account.get("currency") or "USD"

    parts = [f"📊 <b>{_period_label(period, locale)}</b> | {today_str}"]
    if time_range["since"] != time_range["until"]:
        parts.append(f"📅 {time_range['since']} — {time_range['until']}")

    parts.append("")
    parts.append(f"<b>{account['name']}</b>")
    parts.append("")
    parts.extend(_metrics_lines(total, currency=cur, locale=locale))

    by_obj = _group_by_objective(campaigns)
    if len(by_obj) > 1:
        parts.append("")
        parts.append("· · · · · · · · · · ·")
        for obj, obj_c in sorted(by_obj.items()):
            parts.append("")
            parts.extend(_obj_block(obj, obj_c, currency=cur, locale=locale))

    return "\n".join(parts)


# ── Service ──────────────────────────────────────


class TelegramBroadcastService:
    def __init__(
        self,
        bot: Bot,
        fb_client: FacebookClient,
        user_gw: UserGateway,
        fb_auth_gw: FacebookAuthGateway,
        telegram_gw: TelegramGateway,
    ):
        self.bot = bot
        self.fb_client = fb_client
        self.user_gw = user_gw
        self.fb_auth_gw = fb_auth_gw
        self.telegram_gw = telegram_gw

    async def _get_token_for_user(self, user: User) -> str | None:
        owner_id = user.id if user.is_admin else user.created_by_id
        if not owner_id:
            return None
        fb_auth = await self.fb_auth_gw.get_by_owner(owner_id)
        if not fb_auth or not fb_auth.long_token:
            return None
        return fb_auth.long_token

    async def _fetch_campaigns(
        self,
        account_id: str,
        account_name: str,
        access_token: str,
        time_range: dict[str, str],
        currency: str = "USD",
    ) -> dict[str, Any]:
        try:
            campaigns = await self.fb_client.get_campaigns(
                account_id, access_token, time_range
            )
        except Exception as e:
            logger.warning("Failed to fetch campaigns for %s: %s", account_id, e)
            campaigns = []
        return {
            "account_id": account_id,
            "name": account_name,
            "currency": currency,
            "campaigns": campaigns,
        }

    async def send_report_for_user(
        self, user: User, period: str, locale: Locale = "ua",
    ) -> bool:
        if not user.telegram_chat_id:
            return False

        token = await self._get_token_for_user(user)
        if not token:
            logger.warning("No FB token for user %s", user.id)
            return False

        time_range = _build_time_range(period)

        try:
            if user.is_admin:
                return await self._send_admin_report(user, token, period, time_range, locale)
            return await self._send_user_report(user, token, period, time_range, locale)
        except Exception as e:
            logger.error("Failed to build report for user %s: %s", user.id, e)
            return False

    async def _send_admin_report(
        self, user: User, token: str, period: str, time_range: dict[str, str],
        locale: Locale = "ua",
    ) -> bool:
        all_accounts = await self.fb_client.get_ad_accounts(token)
        active: list[dict[str, Any]] = []

        for acc in all_accounts:
            acc_id = acc.get("account_id")
            acc_name = acc.get("name") or acc_id or "Unnamed"
            acc_currency = acc.get("currency") or "USD"
            data = await self._fetch_campaigns(acc_id, acc_name, token, time_range, acc_currency)
            if data["campaigns"]:
                active.append(data)

        if not active:
            logger.info("No active campaigns for admin %s, skip", user.id)
            return False

        msg = _format_admin_report(active, period, time_range, locale)
        return await self._send(user.telegram_chat_id, msg)

    async def _send_user_report(
        self, user: User, token: str, period: str, time_range: dict[str, str],
        locale: Locale = "ua",
    ) -> bool:
        if not user.ad_account_id:
            return False

        all_accounts = await self.fb_client.get_ad_accounts(token)
        acc_name = user.ad_account_id
        acc_currency = "USD"
        for acc in all_accounts:
            if acc.get("account_id") == user.ad_account_id:
                acc_name = acc.get("name") or user.ad_account_id
                acc_currency = acc.get("currency") or "USD"
                break

        data = await self._fetch_campaigns(
            user.ad_account_id, acc_name, token, time_range, acc_currency
        )
        if not data["campaigns"]:
            logger.info("No active campaigns for user %s, skip", user.id)
            return False

        msg = _format_user_report(data, period, time_range, locale)
        return await self._send(user.telegram_chat_id, msg)

    async def _send(self, chat_id: int, text: str) -> bool:
        try:
            await self.bot.send_message(
                chat_id=chat_id, text=text, parse_mode=ParseMode.HTML,
            )
            return True
        except Exception as e:
            logger.error("Telegram send failed to %s: %s", chat_id, e)
            return False

    async def send_daily_reports(self) -> None:
        users = await self.telegram_gw.get_users_with_telegram(daily_only=True)
        logger.info("Sending daily reports to %d users", len(users))

        for user in users:
            try:
                locale: Locale = (
                    user.locale
                    if hasattr(user, "locale") and user.locale in ("ua", "ru")
                    else "ua"
                )
                sent = await self.send_report_for_user(user, "yesterday", locale)
                if sent:
                    logger.info("Daily report sent to user %s", user.id)
                else:
                    logger.warning("Skipped report for user %s", user.id)
            except Exception as e:
                logger.error("Error sending to user %s: %s", user.id, e)
