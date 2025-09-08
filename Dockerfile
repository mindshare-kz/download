from python:3.10-slim
workdir /app
copy requirements.txt requirements.txt
run pip install --no-cache-dir -r requirements.txt
copy . .
EXPOSE 5000
cmd ["python", "archiver.py"]
