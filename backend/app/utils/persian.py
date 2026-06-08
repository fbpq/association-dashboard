"""
Persian text normalization utilities.
Handles Arabic/Persian character variants, whitespace, and value normalization.
"""
import re
from typing import Optional


def normalize_persian(text: Optional[str]) -> Optional[str]:
    """Normalize Persian text: fix Arabic chars, trim spaces."""
    if not text or not isinstance(text, str):
        return None
    text = text.strip()
    if not text:
        return None
    # Arabic ي → Persian ی
    text = text.replace('ي', 'ی')
    # Arabic ك → Persian ک
    text = text.replace('ك', 'ک')
    # Arabic ة → Persian ه
    text = text.replace('ة', 'ه')
    # Zero-width non-joiner
    text = text.replace('‌', ' ')
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip() or None


def normalize_bool_value(text: Optional[str]) -> Optional[bool]:
    """Convert Persian yes/no text to boolean."""
    if not text:
        return None
    normalized = normalize_persian(text)
    if not normalized:
        return None
    positive = {'دارد', '✓', 'بله', 'ثبت شده', 'انجام شده', 'بله.', 'ok', 'yes', '1', 'true'}
    negative = {'ندارد', 'خالی', 'خیر', 'ثبت نشده', 'انجام نشده', 'no', '0', 'false'}
    lower = normalized.lower().strip('.')
    if lower in positive:
        return True
    if lower in negative:
        return False
    return None


def normalize_activity_status(text: Optional[str]) -> str:
    """Normalize association activity status to standard Persian values."""
    if not text:
        return 'نامشخص'
    normalized = normalize_persian(text) or ''
    lower = normalized.lower()
    if 'فعال' in lower and 'نیمه' not in lower and 'کم' not in lower:
        return 'فعال'
    if 'نیمه' in lower:
        return 'نیمه‌فعال'
    if 'کم' in lower or 'خیلی کم' in lower:
        return 'کم‌فعالیت'
    return 'نامشخص'


def normalize_logo_status(text: Optional[str]) -> str:
    """Normalize logo/header status from free-form Persian text."""
    if not text:
        return 'نامشخص'
    normalized = (normalize_persian(text) or '').lower()
    if 'لوگو و هدر دارد' in normalized or ('دارد' in normalized and 'لوگو' in normalized and 'هدر' in normalized):
        return 'دارد'
    if 'ندارد' in normalized or 'هدر طراحی شد' in normalized:
        return 'ناقص'
    if 'دارد' in normalized:
        return 'دارد'
    return 'نامشخص'


def normalize_presence(text: Optional[str]) -> str:
    """Normalize generic presence field (دارد/ندارد/نامشخص)."""
    val = normalize_bool_value(text)
    if val is True:
        return 'دارد'
    if val is False:
        return 'ندارد'
    return 'نامشخص'


def is_cancelled(text: Optional[str]) -> bool:
    """Check if a description indicates cancellation."""
    if not text:
        return False
    return 'لغو' in text or 'cancel' in text.lower()


def extract_logo_header_status(text: Optional[str]) -> tuple[str, str]:
    """
    Parse combined logo+header status field.
    Returns (logo_status, header_status) as ('دارد'|'ناقص'|'ندارد'|'نامشخص').
    """
    if not text:
        return 'نامشخص', 'نامشخص'
    t = (normalize_persian(text) or '').lower()
    if 'لوگو و هدر دارد' in t or ('دارد' in t and 'لوگو' in t and 'هدر' in t):
        return 'دارد', 'دارد'
    if 'لوگو و هدر ندارد' in t or ('ندارد' in t and 'لوگو' in t and 'هدر' in t):
        return 'ندارد', 'ندارد'
    if 'لوگو ندارد' in t and 'هدر دارد' in t:
        return 'ندارد', 'دارد'
    if 'لوگو ندارد' in t or 'فاقد لوگو' in t:
        return 'ندارد', 'نامشخص'
    if 'هدر طراحی شد' in t or 'هدر دارد' in t:
        return 'نامشخص', 'دارد'
    if 'دارد' in t:
        return 'دارد', 'دارد'
    return 'نامشخص', 'نامشخص'
