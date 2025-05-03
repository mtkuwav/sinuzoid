FROM python:3.13-alpine

WORKDIR /app

# Installer les dépendances de build pour psycopg2
RUN apk add --no-cache postgresql-dev gcc python3-dev musl-dev

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port pour FastAPI
EXPOSE 8000

# Lancer l'application avec Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]