
import requests
from bs4 import BeautifulSoup

URL = "https://www.naukri.com/devops-jobs-in-bangalore"

def fetch(keywords, location, limit=10):
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(URL, headers=headers, timeout=10)
    s = BeautifulSoup(r.text,"html.parser")
    jobs = []
    for art in s.select("article")[:limit]:
        try:
            title = art.select_one("a.title").get_text(strip=True)
            company = art.select_one("a.subTitle").get_text(strip=True)
            link = art.select_one("a")["href"]
            jobs.append({"platform":"Naukri","title":title,"company":company,"link":link})
        except:
            continue
    return jobs
