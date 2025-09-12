let jsonData = [];
let filters = {
    Brand: "Все",
    Month: "Все",
    "Carrier type": "Все",
    Advertiser: "Все",
    Category: "Все",
    Subcategory: "Все"
};

const brandFilter = document.getElementById("brandFilter");
const monthFilter = document.getElementById("monthFilter");
const carrierFilter = document.getElementById("carrierFilter");
const advertiserFilter = document.getElementById("advertiserFilter");
const resultsCounter = document.getElementById("results");

fetch("/data/data.json")
    .then(res => res.json())
    .then(data => {
        jsonData = data;
        updateFilters();
        updateResults();
    });

function updateFilters() {
    // обновляем все селекты по текущему фильтру
    populateSelect(brandFilter, Array.from(new Set(jsonData.filter(d =>
        (filters.Month === "Все" || d.Month === filters.Month) &&
        (filters["Carrier type"] === "Все" || d["Carrier type"] === filters["Carrier type"]) &&
        (filters.Advertiser === "Все" || d.Advertiser === filters.Advertiser)
    ).map(d => d.Brand))));

    populateSelect(monthFilter, Array.from(new Set(jsonData.filter(d =>
        (filters.Brand === "Все" || d.Brand === filters.Brand) &&
        (filters["Carrier type"] === "Все" || d["Carrier type"] === filters["Carrier type"]) &&
        (filters.Advertiser === "Все" || d.Advertiser === filters.Advertiser)
    ).map(d => d.Month))));

    populateSelect(carrierFilter, Array.from(new Set(jsonData.filter(d =>
        (filters.Brand === "Все" || d.Brand === filters.Brand) &&
        (filters.Month === "Все" || d.Month === filters.Month) &&
        (filters.Advertiser === "Все" || d.Advertiser === filters.Advertiser)
    ).map(d => d["Carrier type"]))));

    populateSelect(advertiserFilter, Array.from(new Set(jsonData.filter(d =>
        (filters.Brand === "Все" || d.Brand === filters.Brand) &&
        (filters.Month === "Все" || d.Month === filters.Month) &&
        (filters["Carrier type"] === "Все" || d["Carrier type"] === filters["Carrier type"])
    ).map(d => d.Advertiser))));
}

function populateSelect(select, options) {
    const oldValue = select.value;
    select.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "Все";
    allOption.text = "Все";
    select.appendChild(allOption);
    options.sort().forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.text = opt;
        select.appendChild(option);
    });
    // сохраняем предыдущий выбор если он есть
    if ([...select.options].some(o => o.value === oldValue)) {
        select.value = oldValue;
    }
}

[brandFilter, monthFilter, carrierFilter, advertiserFilter].forEach(sel => {
    sel.addEventListener("change", () => {
        const keyMap = {
            brandFilter: "Brand",
            monthFilter: "Month",
            carrierFilter: "Carrier type",
            advertiserFilter: "Advertiser"
        };
        filters[keyMap[sel.id]] = sel.value;
        updateFilters();
        updateResults();
    });
});

function updateResults() {
    const filtered = jsonData.filter(d =>
        (filters.Brand === "Все" || d.Brand === filters.Brand) &&
        (filters.Month === "Все" || d.Month === filters.Month) &&
        (filters["Carrier type"] === "Все" || d["Carrier type"] === filters["Carrier type"]) &&
        (filters.Advertiser === "Все" || d.Advertiser === filters.Advertiser)
    );

    resultsCounter.textContent = `Файлов в архиве: ${filtered.length}`;
}
