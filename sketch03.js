// Financial Organism v0.7
// Asset_History CSV 讀取版
// 讀取最後一列作為目前資產狀態，未來可用整份 history 做成長動畫

let data = {
  totalAsset: 486000,
  cash: 120000,
  etf: 180000,
  stocks: 150000,
  fund: 36000,
  monthlyGrowthRate: 0.028
};

let historyData = [];

let particles = [];
let ripples = [];

let touchXPos = 0;
let touchYPos = 0;
let touchActive = false;

let loadedFromSheet = false;
let statusText = "Manual preview data";

let panel;
let toggleBtn;

let assetInput, cashInput, etfInput, stockInput, fundInput, growthInput;
let sheetInput, generateBtn, connectBtn, resetBtn, closeBtn;

let panelVisible = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);

  document.body.style.overflow = "hidden";
  document.body.style.margin = "0";
  document.body.style.fontFamily =
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  createPanelUI();

  let savedSheet = localStorage.getItem("financialOrganismHistoryURL");

  if (savedSheet) {
    sheetInput.value(savedSheet);
    loadHistoryData(savedSheet);
  } else {
    generateOrganism();
  }
}

function draw() {
  background(245, 242, 235);

  translate(width / 2, height / 2);

  drawBackgroundHalo();
  drawRipples();
  drawCore();
  drawOrganism();
  drawInfo();
}

function createPanelUI() {
  toggleBtn = createButton("☰");
  toggleBtn.position(20, 20);
  toggleBtn.style("width", "54px");
  toggleBtn.style("height", "54px");
  toggleBtn.style("font-size", "26px");
  toggleBtn.style("border", "none");
  toggleBtn.style("border-radius", "18px");
  toggleBtn.style("background", "#ffffffdd");
  toggleBtn.style("box-shadow", "0 8px 24px rgba(0,0,0,0.08)");
  toggleBtn.style("cursor", "pointer");
  toggleBtn.style("z-index", "20");
  toggleBtn.mousePressed(togglePanel);

  panel = createDiv();
  panel.position(20, 88);
  panel.style("width", width < 600 ? "calc(100vw - 40px)" : "360px");
  panel.style("max-height", "calc(100vh - 120px)");
  panel.style("overflow-y", "auto");
  panel.style("padding", "20px");
  panel.style("box-sizing", "border-box");
  panel.style("border-radius", "24px");
  panel.style("background", "rgba(255,255,255,0.82)");
  panel.style("backdrop-filter", "blur(16px)");
  panel.style("-webkit-backdrop-filter", "blur(16px)");
  panel.style("box-shadow", "0 20px 60px rgba(0,0,0,0.12)");
  panel.style("z-index", "15");

  let title = createDiv("Financial Organism");
  title.parent(panel);
  title.style("font-size", "22px");
  title.style("font-weight", "700");
  title.style("margin-bottom", "6px");
  title.style("color", "#2f3632");

  let subtitle = createDiv("把你的財務資料轉換成每天變化的生命體。");
  subtitle.parent(panel);
  subtitle.style("font-size", "13px");
  subtitle.style("line-height", "1.45");
  subtitle.style("color", "#6b6f68");
  subtitle.style("margin-bottom", "18px");

  assetInput = createLabeledInput("總資產", data.totalAsset);
  cashInput = createLabeledInput("現金", data.cash);
  etfInput = createLabeledInput("ETF", data.etf);
  stockInput = createLabeledInput("股票", data.stocks);
  fundInput = createLabeledInput("基金", data.fund);
  growthInput = createLabeledInput("月成長率，例如 0.028 = 2.8%", data.monthlyGrowthRate);

  generateBtn = createButton("生成預覽");
  generateBtn.parent(panel);
  stylePrimaryButton(generateBtn);
  generateBtn.mousePressed(updateFromInputs);

  createDivider();

  let syncTitle = createDiv("同步歷史資料");
  syncTitle.parent(panel);
  syncTitle.style("font-size", "15px");
  syncTitle.style("font-weight", "700");
  syncTitle.style("margin-bottom", "6px");
  syncTitle.style("color", "#2f3632");

  let syncHint = createDiv(
    "貼上 Asset_History 工作表發布後的 CSV 連結。系統會讀取最後一筆資料作為目前狀態。"
  );
  syncHint.parent(panel);
  syncHint.style("font-size", "12px");
  syncHint.style("line-height", "1.45");
  syncHint.style("color", "#6b6f68");
  syncHint.style("margin-bottom", "10px");

  sheetInput = createInput("");
  sheetInput.parent(panel);
  sheetInput.attribute("placeholder", "Asset_History CSV URL");
  styleTextInput(sheetInput);

  connectBtn = createButton("連接歷史資料");
  connectBtn.parent(panel);
  stylePrimaryButton(connectBtn);
  connectBtn.mousePressed(connectHistory);

  resetBtn = createButton("取消連接");
  resetBtn.parent(panel);
  styleSecondaryButton(resetBtn);
  resetBtn.mousePressed(resetHistoryConnection);

  closeBtn = createButton("關閉面板");
  closeBtn.parent(panel);
  styleSecondaryButton(closeBtn);
  closeBtn.mousePressed(closePanel);

  setPanelVisibility(panelVisible);
}

function createLabeledInput(label, value) {
  let wrapper = createDiv();
  wrapper.parent(panel);
  wrapper.style("margin-bottom", "12px");

  let labelDiv = createDiv(label);
  labelDiv.parent(wrapper);
  labelDiv.style("font-size", "12px");
  labelDiv.style("font-weight", "600");
  labelDiv.style("color", "#58605a");
  labelDiv.style("margin-bottom", "5px");

  let input = createInput(value.toString());
  input.parent(wrapper);
  styleTextInput(input);

  return input;
}

function styleTextInput(input) {
  input.style("width", "100%");
  input.style("box-sizing", "border-box");
  input.style("font-size", "15px");
  input.style("padding", "11px 12px");
  input.style("border", "1px solid #d8d0c2");
  input.style("border-radius", "12px");
  input.style("background", "rgba(255,255,255,0.9)");
  input.style("outline", "none");
  input.style("margin-bottom", "10px");
}

function stylePrimaryButton(btn) {
  btn.style("width", "100%");
  btn.style("font-size", "15px");
  btn.style("padding", "12px");
  btn.style("border", "none");
  btn.style("border-radius", "14px");
  btn.style("background", "#3f5248");
  btn.style("color", "#fff");
  btn.style("font-weight", "600");
  btn.style("cursor", "pointer");
  btn.style("margin", "6px 0");
}

function styleSecondaryButton(btn) {
  btn.style("width", "100%");
  btn.style("font-size", "14px");
  btn.style("padding", "11px");
  btn.style("border", "1px solid #d8d0c2");
  btn.style("border-radius", "14px");
  btn.style("background", "rgba(255,255,255,0.65)");
  btn.style("color", "#3f5248");
  btn.style("font-weight", "600");
  btn.style("cursor", "pointer");
  btn.style("margin", "6px 0");
}

function createDivider() {
  let divider = createDiv();
  divider.parent(panel);
  divider.style("height", "1px");
  divider.style("background", "rgba(0,0,0,0.08)");
  divider.style("margin", "18px 0");
}

function togglePanel() {
  panelVisible = !panelVisible;
  setPanelVisibility(panelVisible);
}

function closePanel() {
  panelVisible = false;
  setPanelVisibility(false);
}

function setPanelVisibility(show) {
  panel.style("display", show ? "block" : "none");
}

function updateFromInputs() {
  data.totalAsset = Number(assetInput.value());
  data.cash = Number(cashInput.value());
  data.etf = Number(etfInput.value());
  data.stocks = Number(stockInput.value());
  data.fund = Number(fundInput.value());
  data.monthlyGrowthRate = Number(growthInput.value());

  loadedFromSheet = false;
  statusText = "Manual preview data";

  generateOrganism();
  closePanel();
}

function connectHistory() {
  let url = sheetInput.value().trim();

  if (url.length === 0) {
    statusText = "Please paste an Asset_History CSV URL";
    return;
  }

  localStorage.setItem("financialOrganismHistoryURL", url);
  loadHistoryData(url);
  closePanel();
}

function resetHistoryConnection() {
  localStorage.removeItem("financialOrganismHistoryURL");
  loadedFromSheet = false;
  statusText = "History connection reset";
  historyData = [];
  generateOrganism();
}

function loadHistoryData(url) {
  statusText = "Loading Asset_History...";

  loadTable(
    url,
    "csv",
    "header",
    function (table) {
      historyData = [];

      for (let r = 0; r < table.getRowCount(); r++) {
        let row = {
          date: table.getString(r, "Date"),
          totalAsset: Number(table.getString(r, "TotalAsset")),
          cash: Number(table.getString(r, "Cash")),
          etf: Number(table.getString(r, "ETF")),
          stocks: Number(table.getString(r, "Stocks")),
          fund: Number(table.getString(r, "Fund")),
          monthlyGrowthRate: Number(table.getString(r, "MonthlygrowthRate"))
        };

        if (!isNaN(row.totalAsset)) {
          historyData.push(row);
        }
      }

      if (historyData.length > 0) {
        let latest = historyData[historyData.length - 1];

        data.totalAsset = latest.totalAsset;
        data.cash = latest.cash;
        data.etf = latest.etf;
        data.stocks = latest.stocks;
        data.fund = latest.fund;
        data.monthlyGrowthRate = latest.monthlyGrowthRate;

        syncInputsFromData();

        loadedFromSheet = true;
        statusText = "Data from Asset_History";

        generateOrganism();
      } else {
        loadedFromSheet = false;
        statusText = "No valid rows in Asset_History";
        generateOrganism();
      }
    },
    function (err) {
      console.log("Asset_History load failed:", err);
      loadedFromSheet = false;
      statusText = "Failed to load Asset_History";
      generateOrganism();
    }
  );
}

function syncInputsFromData() {
  assetInput.value(data.totalAsset.toString());
  cashInput.value(data.cash.toString());
  etfInput.value(data.etf.toString());
  stockInput.value(data.stocks.toString());
  fundInput.value(data.fund.toString());
  growthInput.value(data.monthlyGrowthRate.toString());
}

function generateOrganism() {
  data.totalAsset = max(1, data.totalAsset);

  randomSeed(int(data.totalAsset) + day());

  let cashRatio = data.cash / data.totalAsset;
  let etfRatio = data.etf / data.totalAsset;
  let stockRatio = data.stocks / data.totalAsset;
  let fundRatio = data.fund / data.totalAsset;

  let count = int(map(data.totalAsset, 100000, 1000000, 80, 420, true));
  let maxRadius = min(width, height) * 0.28;
  let innerVoid = map(cashRatio, 0, 0.5, 20, 110, true);
  let symmetry = int(map(etfRatio, 0, 0.6, 3, 12, true));
  let chaos = map(stockRatio, 0, 0.5, 5, 75, true);
  let growthPush = map(data.monthlyGrowthRate, -0.05, 0.08, -30, 60, true);

  particles = [];

  for (let i = 0; i < count; i++) {
    let layer = i / count;
    let baseAngle = TWO_PI * (i % symmetry) / symmetry;
    let angleNoise = random(-chaos, chaos) * 0.01;
    let angle = baseAngle + layer * TWO_PI * 1.6 + angleNoise;

    let radius = innerVoid + pow(layer, 0.72) * maxRadius;
    radius += random(-chaos, chaos);
    radius += growthPush * noise(i * 0.08);

    let size = map(layer, 0, 1, 13, 3);
    size += fundRatio * 8;

    particles.push({
      x: cos(angle) * radius,
      y: sin(angle) * radius,
      baseSize: size,
      layer: layer
    });
  }
}

function drawBackgroundHalo() {
  noStroke();

  let maxHalo = min(width, height) * 0.46;

  for (let r = maxHalo; r > 40; r -= 18) {
    let alpha = map(r, maxHalo, 40, 5, 22);
    fill(210, 205, 190, alpha);
    ellipse(0, 0, r * 2);
  }
}

function drawCore() {
  let cashRatio = data.cash / data.totalAsset;
  let coreSize = map(cashRatio, 0, 0.5, 45, 130, true);
  let pulse = sin(frameCount * 0.035) * 8;

  noStroke();

  for (let r = coreSize + 70; r > 10; r -= 6) {
    fill(255, 222, 165, map(r, coreSize + 70, 10, 3, 34));
    ellipse(0, 0, r + pulse);
  }

  fill(245, 242, 235, 230);
  ellipse(0, 0, coreSize + pulse * 0.35);
}

function drawOrganism() {
  let displayed = [];

  let mx = touchActive ? touchXPos - width / 2 : mouseX - width / 2;
  let my = touchActive ? touchYPos - height / 2 : mouseY - height / 2;

  for (let p of particles) {
    let dx = mx - p.x;
    let dy = my - p.y;
    let d = sqrt(dx * dx + dy * dy);

    let influence = d < 190 ? map(d, 0, 190, 32, 0, true) : 0;

    let px = p.x;
    let py = p.y;

    if (d > 0) {
      px += (dx / d) * influence;
      py += (dy / d) * influence;
    }

    let pulse = sin(frameCount * 0.035 + p.layer * 12) * 2.3;
    let hoverScale = d < 80 ? map(d, 0, 80, 2.1, 1.0, true) : 1;

    displayed.push({
      x: px,
      y: py,
      s: (p.baseSize + pulse) * hoverScale,
      layer: p.layer,
      active: d < 150
    });
  }

  for (let i = 0; i < displayed.length; i++) {
    let a = displayed[i];

    for (let j = i + 1; j < displayed.length; j++) {
      let b = displayed[j];
      let d = dist(a.x, a.y, b.x, b.y);

      if (d < 42) {
        if (a.active || b.active) {
          stroke(58, 100, 94, 95);
          strokeWeight(1.3);
        } else {
          stroke(80, 75, 65, 28);
          strokeWeight(0.8);
        }

        line(a.x, a.y, b.x, b.y);
      }
    }
  }

  noStroke();

  for (let p of displayed) {
    if (p.active) {
      fill(50, 94, 88, 205);
    } else {
      let alpha = map(p.layer, 0, 1, 185, 90);
      fill(65, 82, 72, alpha);
    }

    ellipse(p.x, p.y, p.s);
  }
}

function drawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    let ripple = ripples[i];

    noFill();
    stroke(60, 110, 110, ripple.alpha);
    strokeWeight(1.5);

    ellipse(ripple.x, ripple.y, ripple.r);

    ripple.r += 5.2;
    ripple.alpha -= 2.2;

    if (ripple.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}

function drawInfo() {
  resetMatrix();

  fill(45);
  noStroke();
  textAlign(CENTER, CENTER);

  textSize(width < 600 ? 15 : 18);
  text("Financial Organism", width / 2, height - 165);

  textSize(width < 600 ? 28 : 42);
  text("NT$ " + nf(data.totalAsset, 0, 0), width / 2, height - 122);

  textSize(width < 600 ? 13 : 16);
  text("Monthly Growth  +" + nf(data.monthlyGrowthRate * 100, 1, 1) + "%", width / 2, height - 88);

  textSize(width < 600 ? 11 : 13);
  text(statusText, width / 2, height - 60);

  if (historyData.length > 0) {
    textSize(width < 600 ? 10 : 12);
    text("History records: " + historyData.length, width / 2, height - 38);
  }

  textSize(width < 600 ? 10 : 12);
  text("☰ edit data / touch to interact", width / 2, height - 20);
}

function mousePressed() {
  if (!touchActive) {
    ripples.push({
      x: mouseX - width / 2,
      y: mouseY - height / 2,
      r: 10,
      alpha: 120
    });
  }
}

/*function touchStarted() {
  touchActive = true;

  if (touches.length > 0) {
    touchXPos = touches[0].x;
    touchYPos = touches[0].y;

    ripples.push({
      x: touchXPos - width / 2,
      y: touchYPos - height / 2,
      r: 10,
      alpha: 120
    });
  }

  return false;
}
*/
function touchMoved() {
  touchActive = true;

  if (touches.length > 0) {
    touchXPos = touches[0].x;
    touchYPos = touches[0].y;
  }

  return false;
}

function touchEnded() {
  touchActive = false;
  return false;
}

function keyPressed() {
  if (key === "r" || key === "R") {
    data.totalAsset += random(-50000, 80000);
    data.totalAsset = max(100000, data.totalAsset);
    statusText = "Random preview generated";
    generateOrganism();
    syncInputsFromData();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  if (panel) {
    panel.style("width", width < 600 ? "calc(100vw - 40px)" : "360px");
  }

  generateOrganism();
}