
import requests
from bs4 import BeautifulSoup

URL = "https://www.foundit.in/search/devops-jobs"

def fetch(keywords, location, limit=10):
    r = requests.get(URL, timeout=10)
    s = BeautifulSoup(r.text,"html.parser")
    jobs = []
    for card in s.select("div.cardContainer")[:limit]:
        try:
            title = card.select_one("h3").get_text(strip=True)
            comp = card.select_one("span.companyName")
            company = comp.get_text(strip=True) if comp else ""
            a = card.find("a", href=True)
            link = a["href"] if a else ""
            jobs.append({"platform":"Foundit","title":title,"company":company,"link":link})
        except:
            continue
    return jobs
