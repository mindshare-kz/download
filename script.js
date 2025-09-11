let jsonData = [];
const brandFilter = document.getElementById("brandFilter");
const monthFilter = document.getElementById("monthFilter");
const carrierFilter = document.getElementById("carrierFilter");
const advertiserFilter = document.getElementById("advertiserFilter");
const fileCountDiv = document.getElementById("fileCount");

// --- Загрузка данных ---
fetch("data/data.json")
  .then(res => res.json())
  .then(data => {
    jsonData = data;
    populateFilters();
    updateArchiveInfo();
  });

// --- Заполнение фильтров ---
function populateFilters() {
  populateSelect(brandFilter, getUniqueValues(jsonData, "Brand"));
  populateSelect(monthFilter, getUniqueValues(jsonData, "Month"));
  populateSelect(carrierFilter, getUniqueValues(jsonData, "Carrier type"));
  populateSelect(advertiserFilter, getUniqueValues(jsonData, "Advertiser"));
}

// --- Получение уникальных значений ---
function getUniqueValues(data, key) {
  return Array.from(new Set(data.map(d => d[key]).filter(Boolean))).sort();
}

// --- Заполнение select ---
function populateSelect(select, values) {
  const current = select.value;
  select.innerHTML = `<option value="">Все</option>`;
  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
  if (values.includes(current)) select.value = current;
}

// --- Получение отфильтрованных данных ---
function getFilteredData() {
  return jsonData.filter(d =>
    (brandFilter.value === "" || d.Brand === brandFilter.value) &&
    (monthFilter.value === "" || d.Month === monthFilter.value) &&
    (carrierFilter.value === "" || d["Carrier type"] === carrierFilter.value) &&
    (advertiserFilter.value === "" || d.Advertiser === advertiserFilter.value)
  );
}

// --- Обновление взаимной фильтрации ---
function updateFilters() {
  const filtered = getFilteredData();

  // Обновляем все фильтры, чтобы оставались только подходящие значения
  populateSelect(brandFilter, getUniqueValues(filtered, "Brand"));
  populateSelect(monthFilter, getUniqueValues(filtered, "Month"));
  populateSelect(carrierFilter, getUniqueValues(filtered, "Carrier type"));
  populateSelect(advertiserFilter, getUniqueValues(filtered, "Advertiser"));

  updateArchiveInfo();
}

// --- Обновление счётчика файлов ---
function updateArchiveInfo() {
  const filtered = getFilteredData();
  fileCountDiv.textContent = `Найдено: ${filtered.length} файлов`;
}

// --- События изменения фильтров ---
[brandFilter, monthFilter, carrierFilter, advertiserFilter].forEach(select => {
  select.addEventListener("change", updateFilters);
});
