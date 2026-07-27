from typing import Optional
import re

import bleach


_CHANNEL_ID_DOMAIN_RE = re.compile(
    r"^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\."
    r")+[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])$"
)


def sanitize_text(value: str) -> str:
    return bleach.clean(value, tags=[], attributes={}, strip=True).strip()


def sanitize_optional_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return sanitize_text(value)


def sanitize_channel_id_domain(value: str) -> str:
    normalized = value.strip().lower()
    if len(normalized) < 3 or len(normalized) > 253:
        raise ValueError("channel_id must be between 3 and 253 characters")
    if not _CHANNEL_ID_DOMAIN_RE.fullmatch(normalized):
        raise ValueError("channel_id must be a valid domain format")
    return normalized
