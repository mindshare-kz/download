from flask import Flask, jsonify
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

app = Flask(__name__)
CORS(app)  # разрешаем запросы с любого домена (GitHub Pages)

# Путь к JSON ключу Service Account (в контейнере)
SERVICE_ACCOUNT_FILE = '/app/download-service-key.json'

# ID таблиц Google Sheets
DIGITAL_SHEET_ID = '1WHY4T2m9e21COyndsKjBjhzcMmsUAkltJA_KQsdo--E'
STATIC_SHEET_ID = '1XK43QIyOiYnMwQZr9pn5VERiy87uBtRPORpwf7jAOw4'

# Папка для JSON внутри контейнера
DATA_FOLDER = '/app/data'
os.makedirs(DATA_FOLDER, exist_ok=True)

# Столбцы, которые нужны для фильтров
FILTER_COLUMNS = [
    'Brand',
    'Month',
    'Carrier type',
    'Advertiser',
    'Category',
    'Subcategory',
    'File'
]

def get_gsheet_data(sheet_id, source_name):
    """Получаем данные из Google Sheets и готовим для фронтенда"""
    try:
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            SERVICE_ACCOUNT_FILE, scope
        )
        client = gspread.authorize(creds)
        worksheet = client.open_by_key(sheet_id).sheet1
        records = worksheet.get_all_records()

        processed = []
        for row in records:
            # оставляем только нужные столбцы
            filtered_row = {col: row.get(col, '') for col in FILTER_COLUMNS}

            # извлекаем fileId из ссылки
            file_url = filtered_row.get('File', '')
            file_id = ''
            if '/file/d/' in file_url and '/view' in file_url:
                file_id = file_url.split('/file/d/')[1].split('/view')[0]
            filtered_row['fileId'] = file_id

            # убираем File, если он больше не нужен
            filtered_row.pop('File', None)

            # добавляем столбец Source
            filtered_row['Source'] = source_name

            processed.append(filtered_row)
        return processed

    except Exception as e:
        print(f"Ошибка при получении данных из таблицы {sheet_id}: {e}")
        return []

@app.route('/update_data', methods=['GET'])
def update_data():
    """Обновление JSON файла с данными"""
    digital_data = get_gsheet_data(DIGITAL_SHEET_ID, 'Digital')
    static_data = get_gsheet_data(STATIC_SHEET_ID, 'Static')
    combined = digital_data + static_data

    output_path = os.path.join(DATA_FOLDER, 'data.json')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(combined, f, ensure_ascii=False, indent=2)
        return jsonify({"status": "ok", "rows": len(combined)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/data.json', methods=['GET'])
def get_data():
    """Прямой доступ к JSON для фронтенда"""
    output_path = os.path.join(DATA_FOLDER, 'data.json')
    if os.path.exists(output_path):
        with open(output_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({"status": "error", "message": "Файл data.json не найден"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=5001)

