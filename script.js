const DATA_URL = "https://mindshare-kz.github.io/download/data/data.json"; // ссылка на JSON на GitHub

let data = [];
let filteredData = [];

// Подгружаем JSON
fetch('data/data.json')
  .then(res => res.json())
  .then(data => {
    console.log(data); // теперь JSON точно подтянется
  })
  .catch(err => console.error(err));

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
  items.forEach(i => sel.innerHTML += `<option value="${i}">${i}</option>`);
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
    container.innerHTML += `
      <label>
        <input type="checkbox" data-id="${item.fileId}">
        ${item.Brand} | ${item.Month} | ${item['Carrier type']} | ${item.Advertiser}
      </label>
    `;
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
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "archive.zip";
    a.click();
  });
});
