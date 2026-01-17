
DevApply Backend (FastAPI)
-------------------------

Run locally:

python -m venv venv
# Windows: venv\Scripts\activate
# Ubuntu:  source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

Docker:

docker-compose up --build
