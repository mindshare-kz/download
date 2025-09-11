let jsonData = []; 
let filters = {
    Brand: "Все",
    Month: "Все",
    "Carrier type": "Все",
    Advertiser: "Все"
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
        populateAllFilters();
        updateResults();
    });

function populateAllFilters() {
    populateSelect(brandFilter, Array.from(new Set(jsonData.map(d => d.Brand))));
    populateSelect(monthFilter, Array.from(new Set(jsonData.map(d => d.Month))));
    populateSelect(carrierFilter, Array.from(new Set(jsonData.map(d => d["Carrier type"]))));
    populateSelect(advertiserFilter, Array.from(new Set(jsonData.map(d => d.Advertiser))));
}

function populateSelect(select, options) {
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
}

[brandFilter, monthFilter, carrierFilter, advertiserFilter].forEach(sel => {
    sel.addEventListener("change", () => {
        // напрямую по ключу JSON
        const keyMap = {
            brandFilter: "Brand",
            monthFilter: "Month",
            carrierFilter: "Carrier type",
            advertiserFilter: "Advertiser"
        };
        filters[keyMap[sel.id]] = sel.value;
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
