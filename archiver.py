import os
import io
import zipfile
import logging
import tempfile
from flask import Flask, request, send_file, jsonify
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2 import service_account

# --- Конфигурация ---
SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
SERVICE_ACCOUNT_FILE = "/app/download-service-key.json"
MAX_FILES = 1000  # ограничение на количество файлов

# --- Логирование ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("archiver")

# --- Инициализация Flask ---
app = Flask(__name__)

# --- Авторизация в Google Drive ---
creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build("drive", "v3", credentials=creds)
logger.info("Google Drive client initialized.")


def download_file(file_id, destination):
    """Скачивает один файл с Google Drive"""
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.FileIO(destination, "wb")
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.close()
    logger.info(f"Файл {file_id} скачан → {destination}")


@app.route("/download", methods=["POST"])
def download_files():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Не передан JSON"}), 400

    ids = data.get("ids") or data.get("fileIds") or []
    zip_name = data.get("zip_name") or "archive.zip"

    if not isinstance(ids, list):
        return jsonify({"error": "ids должен быть массивом"}), 400
    if len(ids) == 0:
        return jsonify({"error": "пустой список ids"}), 400
    if len(ids) > MAX_FILES:
        return jsonify({"error": f"слишком много файлов (max {MAX_FILES})"}), 400

    logger.info(f"Запрос на архив: {len(ids)} файлов → {zip_name}")

    # временная папка для файлов
    with tempfile.TemporaryDirectory() as tmpdir:
        file_paths = []
        for fid in ids:
            try:
                # узнаем имя файла
                meta = drive_service.files().get(fileId=fid, fields="name").execute()
                fname = meta.get("name", f"{fid}.bin")
                dest = os.path.join(tmpdir, fname)
                download_file(fid, dest)
                file_paths.append((dest, fname))
            except Exception as e:
                logger.error(f"Ошибка при скачивании {fid}: {e}")

        # создаём архив
        zip_path = os.path.join(tmpdir, zip_name)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for path, fname in file_paths:
                zipf.write(path, arcname=fname)

        logger.info(f"Архив готов: {zip_path}")

        return send_file(
            zip_path,
            mimetype="application/zip",
            as_attachment=True,
            download_name=zip_name,
        )


if __name__ == "__main__":
    logger.info("Starting Flask server on 0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000)

