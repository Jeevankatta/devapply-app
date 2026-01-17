
from apscheduler.schedulers.background import BackgroundScheduler
from .db import get_session, init_db
from .models import User, Preference, Job, Application
from .scrapers import linkedin, naukri, indeed, foundit
from app.mailer import send_email
from app.telegram import send_telegram
from datetime import date

scheduler = BackgroundScheduler()

def process_user(user):
    with get_session() as s:
        pref = s.query(Preference).filter(Preference.user_id == user.id).first()
        limit = pref.daily_limit if pref else 10

        jobs = []
        jobs += linkedin.fetch(pref.keywords, pref.location, limit)
        jobs += naukri.fetch(pref.keywords, pref.location, limit)
        jobs += indeed.fetch(pref.keywords, pref.location, limit)
        jobs += foundit.fetch(pref.keywords, pref.location, limit)

        applied = 0
        for j in jobs:
            exists = s.query(Job).filter(Job.link == j["link"]).first()
            if not exists:
                job = Job(platform=j["platform"], title=j["title"], company=j["company"], link=j["link"])
                s.add(job); s.commit(); s.refresh(job)
            else:
                job = exists

            appl = s.query(Application).filter(
                Application.user_id==user.id,
                Application.job_id==job.id
            ).first()

            if not appl:
                a = Application(user_id=user.id, job_id=job.id, status="Saved", applied_on=date.today())
                s.add(a); s.commit()
                applied += 1

        body = f"New saved jobs today: {applied}"
        send_email(user.email, "DevApply Report", body)
        if user.telegram_chat_id:
            send_telegram(user.telegram_chat_id, body)

def run_all():
    with get_session() as s:
        users = s.query(User).all()
        for u in users:
            try:
                process_user(u)
            except Exception as e:
                print(f"Error processing user {u.id}: {e}")
                pass

def start():
    init_db()
    scheduler.add_job(run_all, 'cron', hour=8, minute=0)
    scheduler.start()
