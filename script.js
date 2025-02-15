document.addEventListener("DOMContentLoaded", function () {
    // Event Listeners
    document.querySelectorAll(".price-btn").forEach(button => {
        button.addEventListener("click", function () {
            fetchCryptoPrice(this.dataset.symbol);
        });
    });

    document.getElementById("leverageSlider").addEventListener("input", syncLeverage);
    document.getElementById("leverageInput").addEventListener("input", syncLeverage);
    document.getElementById("calculate").addEventListener("click", calculate);
    document.getElementById("toggleDarkMode").addEventListener("change", toggleDarkMode);
    document.getElementById("longBtn").addEventListener("click", () => setPosition("long"));
    document.getElementById("shortBtn").addEventListener("click", () => setPosition("short"));

    // Check dark mode preference from localStorage
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        document.getElementById("toggleDarkMode").checked = true;
    }
});

// Function to fetch live crypto price
async function fetchCryptoPrice(symbol) {
    try {
        let response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        let data = await response.json();
        document.getElementById("entryPrice").value = parseFloat(data.price).toFixed(4);
    } catch (error) {
        alert("Error fetching price. Try again later.");
    }
}

// Function to synchronize leverage input and slider
function syncLeverage(event) {
    let value = event.target.value;
    document.getElementById("leverageInput").value = value;
    document.getElementById("leverageSlider").value = value;
}

// Function to toggle dark mode
function toggleDarkMode() {
    let body = document.body;
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
}

// Function to set position (Long/Short)
function setPosition(type) {
    let longBtn = document.getElementById("longBtn");
    let shortBtn = document.getElementById("shortBtn");

    if (type === "long") {
        longBtn.classList.add("active");
        shortBtn.classList.remove("active");
        shortBtn.style.opacity = "0.5"; // Gray out
        longBtn.style.opacity = "1";
    } else {
        shortBtn.classList.add("active");
        longBtn.classList.remove("active");
        longBtn.style.opacity = "0.5"; // Gray out
        shortBtn.style.opacity = "1";
    }
}

// Function to calculate liquidation price
function calculate() {
    let entryPrice = parseFloat(document.getElementById("entryPrice").value);
    let leverage = parseFloat(document.getElementById("leverageInput").value);
    let margin = parseFloat(document.getElementById("margin").value);
    let walletBalance = parseFloat(document.getElementById("walletBalance").value);
    let marginMode = document.getElementById("marginMode").value;
    let isLong = document.getElementById("longBtn").classList.contains("active");

    if (isNaN(entryPrice) || isNaN(leverage) || isNaN(margin) || isNaN(walletBalance) || leverage < 1) {
        document.getElementById("result").innerText = "Please enter valid values.";
        return;
    }

    let positionSize = margin * leverage;
    let maintenanceMargin = positionSize * 0.005; // 0.5% maintenance margin (varies by exchange)
    
    let liquidationPrice;
    if (marginMode === "isolated") {
        if (isLong) {
            liquidationPrice = entryPrice * (1 - (1 / leverage)) - (margin / positionSize);
        } else {
            liquidationPrice = entryPrice * (1 + (1 / leverage)) + (margin / positionSize);
        }
    } else { // Cross Margin
        let totalBalance = margin + walletBalance;
        if (isLong) {
            liquidationPrice = entryPrice * (1 - (totalBalance / positionSize));
        } else {
            liquidationPrice = entryPrice * (1 + (totalBalance / positionSize));
        }
    }

    document.getElementById("result").innerText = `Liquidation Price: $${liquidationPrice.toFixed(4)}`;
}
