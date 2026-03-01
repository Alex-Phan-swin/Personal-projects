import re
from email.utils import parseaddr

_EMAIL_SIMPLE_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def get_email_and_name(email_input: str):
    """
    Accepts either 'alice@example.com' or 'Alice <alice@example.com>'.
    Returns (email_address, name) where name may be '' if not present.
    Raises ValueError if no valid email found.
    """
    if not isinstance(email_input, str):
        raise ValueError("Email input must be a string")

    # parseaddr handles both plain and "Name <addr>" formats
    name, addr = parseaddr(email_input)
    addr = (addr or '').strip()
    # fallback: maybe the input was quoted JSON fragment like '"email": "alice@example.com",'
    if not addr:
        candidate = email_input.strip().strip('"').strip(",")
        if _EMAIL_SIMPLE_RE.match(candidate):
            return candidate, ''
    if not _EMAIL_SIMPLE_RE.match(addr):
        raise ValueError("Email input has incorrect format for email")
    return addr, (name or '').strip()

def get_email_in_name(email_name,name):

    email_processed = "".join(re.findall("[a-zA-Z]", email_name.split("@")[0].lower()))
    name_processed = "".join(re.findall("[a-zA-Z]", name.lower()))


    name_set = set(name_processed)
    email_set = set(email_processed)

    common = name_set & email_set
    return len(common) / len(email_set) if len(email_set) > 0 else 0


def get_non_alphanumeric_punctuation_coefficient(body, subject):
    if len(re.findall(r'\S', subject + body)) == 0:
        return 0
    return len(re.findall(r'[a-zA-Z0-9.-:,?]', body + subject)) / len(re.findall(r'\S', subject + body))


def get_capital_coefficient(body, subject):
    if len(re.findall(r'[a-zA-Z]', (subject + body))) == 0:
        return 0
    return len(re.findall(r'[A-Z]', (body + subject))) / len(re.findall(r'[a-zA-Z]', (subject + body)))


def get_whitespace_coefficient(body):
    if len(body) == 0:
        return 0
    return len(re.findall(r'\S', body)) / len(body)

sexual_words = [

    "sex", "sexual", "xxx", "porn", "erotic", "eroticism", "nude", "naked",
    "fuck", "fucker", "cock", "pussy", "dick", "blowjob", "anal", "horny",
    "masturbation", "orgy", "slut", "whore", "bdsm", "fetish", "kink",
    "cum", "sperm", "orgasm",

    "viagra", "cialis", "levitra", "sexual enhancement", "libido", "erection",
    "erectile", "aphrodisiac", "performance enhancer", "sexual stimulant",
    "potency", "male enhancement", "female enhancement", "pills",
    "sexual therapy",

    "adult", "cam", "webcam", "dating", "escort", "sensual", "intimate",
    "pleasure", "naughty", "seduce", "temptation", "desire",
    "hot", "erotic", "sex chat", "porn site", "adult site"
]

def get_contains_sexual_word(body, subject):
    return int(any(word in (body.lower() + subject.lower()) for word in sexual_words))

def get_sender_domain(email):
    sender_domain_groups = re.findall(r'<[^@]+@([\w.-]+)>', email)
    if len(sender_domain_groups) != 1:
        raise ValueError('Email input has incorrect regex matches for sender_domain when getting the domain')
    sender_domain = sender_domain_groups[0].lower()
    return sender_domain

def get_links(body):
    urls = re.findall(r'://([A-Za-z0-9.-]+)', body)
    # need to add ends with .com / .net ect.
    urls = [url.lower() for url in urls]
    return urls
def get_domain_matches(urls, email):
    if len(urls) == 0:
        return 0
    return any(email in link for link in urls)

currency_symbols = [
    '$', '€', '£'
]
currency_words_regex_string = r'(dollar|euro|pound|money|cash)'

def get_contains_currency(subject, body):
    combined_text = f"{subject} {body}"
    symbol_found = any(sym in combined_text for sym in currency_symbols)
    # Check regex words
    word_found = bool(re.search(currency_words_regex_string, combined_text, re.IGNORECASE))
    # Combine
    return int(symbol_found or word_found)

obfuscated_word_pattern = r'\b(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+\b'
def get_contains_obfuscated_word(subject, body):
    return int(bool(re.search(obfuscated_word_pattern, subject + " " + body, re.IGNORECASE)))