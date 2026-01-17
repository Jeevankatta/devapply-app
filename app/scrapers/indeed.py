
import requests
from bs4 import BeautifulSoup

URL = "https://in.indeed.com/jobs"

def fetch(keywords, location, limit=10):
    r = requests.get(URL, params={"q": keywords, "l": location}, timeout=10)
    s = BeautifulSoup(r.text,"html.parser")
    jobs = []
    for div in s.select("div.job_seen_beacon")[:limit]:
        try:
            title = div.select_one("h2").get_text(strip=True)
            company = div.select_one("span.companyName").get_text(strip=True)
            a = div.find("a", href=True)
            link = "https://in.indeed.com" + a["href"] if a else ""
            jobs.append({"platform":"Indeed","title":title,"company":company,"link":link})
        except:
            continue
    return jobs
