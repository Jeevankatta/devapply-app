
import requests
from bs4 import BeautifulSoup

def fetch(keywords, location, limit=10):
    url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    r = requests.get(url, params={"keywords": keywords, "location": location}, timeout=10)
    s = BeautifulSoup(r.text, "html.parser")
    jobs = []
    for li in s.find_all("li")[:limit]:
        try:
            jobs.append({
                "platform": "LinkedIn",
                "title": li.find("h3").text.strip(),
                "company": li.find("h4").text.strip(),
                "link": li.find("a")["href"]
            })
        except:
            continue
    return jobs
