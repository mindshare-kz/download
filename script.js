const DATA_URL = "https://mindshare-kz.github.io/download/data/data.json";

let data = [];
let filteredData = [];

// Подгружаем JSON
fetch(DATA_URL)
  .then(res => res.json())
  .then(jsonData => {
    data = jsonData;
    console.log("JSON загружен:", data);
    populateFilters();
  })
  .catch(err => console.error("Ошибка при загрузке JSON:", err));

// Заполняем фильтры
function populateFilters() {
  const brands = [...new Set(data.map(d => d.Brand))];
  const months = [...new Set(data.map(d => d.Month))];
  const carriers = [...new Set(data.map(d => d['Carrier type']))];
  const advertisers = [...new Set(data.map(d => d.Advertiser))];

  fillSelect("brandFilter", brands);
  fillSelect("monthFilter", months);
  fillSelect("carrierFilter", carriers);
  fillSelect("advertiserFilter", advertisers);
}

function fillSelect(id, items) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="">All</option>';
  items.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    sel.appendChild(opt);
  });
}

// Фильтрация
document.getElementById("applyFilters").addEventListener("click", () => {
  const brand = document.getElementById("brandFilter").value;
  const month = document.getElementById("monthFilter").value;
  const carrier = document.getElementById("carrierFilter").value;
  const advertiser = document.getElementById("advertiserFilter").value;

  filteredData = data.filter(d =>
    (!brand || d.Brand === brand) &&
    (!month || d.Month === month) &&
    (!carrier || d['Carrier type'] === carrier) &&
    (!advertiser || d.Advertiser === advertiser)
  );

  showResults(filteredData);
});

// Показываем результаты с чекбоксами
function showResults(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  list.forEach((item, idx) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.id = item.fileId;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(
      `${item.Brand} | ${item.Month} | ${item['Carrier type']} | ${item.Advertiser}`
    ));

    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

// Скачивание архива
document.getElementById("downloadSelected").addEventListener("click", () => {
  const selectedIds = Array.from(document.querySelectorAll("#results input:checked"))
                           .map(el => el.dataset.id);

  if(selectedIds.length === 0) return alert("Select at least one file");

  fetch("http://195.49.212.211:5000/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: selectedIds, zip_name: "archive.zip" })
  })
  .then(res => {
    if(!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
    return res.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "archive.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  })
  .catch(err => console.error("Ошибка при скачивании архива:", err));
});
