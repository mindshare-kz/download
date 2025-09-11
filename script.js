// --- Данные (пример, у тебя будет data.json) ---
let data = []; // сюда будет загружаться JSON с сервера

// --- Ссылки на селекты и счетчик ---
const brandFilter = document.getElementById("brandFilter");
const monthFilter = document.getElementById("monthFilter");
const carrierFilter = document.getElementById("carrierFilter");
const advertiserFilter = document.getElementById("advertiserFilter");
const downloadBtn = document.getElementById("downloadSelected");
const resultsDiv = document.getElementById("results");

// --- Загружаем JSON ---
fetch("data/data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    populateFilters();
    updateResults();
  });

// --- Функции ---
function getFilteredData() {
  return data.filter(item => 
    (brandFilter.value === "All" || item.Brand === brandFilter.value) &&
    (monthFilter.value === "All" || item.Month === monthFilter.value) &&
    (carrierFilter.value === "All" || item["Carrier type"] === carrierFilter.value) &&
    (advertiserFilter.value === "All" || item.Advertiser === advertiserFilter.value)
  );
}

function populateFilters() {
  const brands = ["All", ...new Set(data.map(d => d.Brand))];
  const months = ["All", ...new Set(data.map(d => d.Month))];
  const carriers = ["All", ...new Set(data.map(d => d["Carrier type"]))];
  const advertisers = ["All", ...new Set(data.map(d => d.Advertiser))];

  populateSelect(brandFilter, brands);
  populateSelect(monthFilter, months);
  populateSelect(carrierFilter, carriers);
  populateSelect(advertiserFilter, advertisers);
}

function populateSelect(select, options) {
  const prevValue = select.value || "All";
  select.innerHTML = "";
  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt;
    el.textContent = opt;
    select.appendChild(el);
  });
  if ([...options].includes(prevValue)) select.value = prevValue;
}

function updateFiltersOptions() {
  const filtered = data.filter(item => 
    (brandFilter.value === "All" || item.Brand === brandFilter.value) &&
    (monthFilter.value === "All" || item.Month === monthFilter.value) &&
    (carrierFilter.value === "All" || item["Carrier type"] === carrierFilter.value) &&
    (advertiserFilter.value === "All" || item.Advertiser === advertiserFilter.value)
  );

  const brandOptions = ["All", ...new Set(filtered.map(d => d.Brand))];
  const monthOptions = ["All", ...new Set(filtered.map(d => d.Month))];
  const carrierOptions = ["All", ...new Set(filtered.map(d => d["Carrier type"]))];
  const advertiserOptions = ["All", ...new Set(filtered.map(d => d.Advertiser))];

  populateSelect(brandFilter, brandOptions);
  populateSelect(monthFilter, monthOptions);
  populateSelect(carrierFilter, carrierOptions);
  populateSelect(advertiserFilter, advertiserOptions);
}

function updateResults() {
  const filtered = getFilteredData();
  resultsDiv.textContent = `Файлов в архиве: ${filtered.length}`;
}

// --- Обработчики ---
[brandFilter, monthFilter, carrierFilter, advertiserFilter].forEach(sel => {
  sel.addEventListener("change", () => {
    updateFiltersOptions();
    updateResults();
  });
});

downloadBtn.addEventListener("click", () => {
  const filtered = getFilteredData();
  const ids = filtered.map(f => f.fileId);
  if (ids.length === 0) {
    alert("Нет файлов для скачивания!");
    return;
  }
  fetch("/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids })
  })
    .then(res => res.blob())
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
    .catch(err => alert("Ошибка при скачивании: " + err));
});
