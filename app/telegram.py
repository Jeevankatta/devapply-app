
import requests, os

API = "https://api.telegram.org"

def send_telegram(chat_id, text):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token or not chat_id:
        return False
    url = f"{API}/bot{token}/sendMessage"
    r = requests.post(url, json={"chat_id": chat_id, "text": text})
    return r.status_code == 200
