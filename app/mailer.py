
import smtplib
from email.mime.text import MIMEText
import os

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465

def send_email(to_email, subject, body):
    user = os.getenv("SMTP_USER")
    pw = os.getenv("SMTP_PASS")
    if not user or not pw:
        return

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_email

    s = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
    s.login(user, pw)
    s.send_message(msg)
    s.quit()
