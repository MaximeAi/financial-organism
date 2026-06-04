// Financial Organism v0.3
// 手機觸控版：呼吸、滑鼠/觸控引力、能量核心、點擊波紋
// 可直接貼到 p5.js Web Editor

let data = {
  totalAsset: 486000,
  cash: 120000,
  etf: 180000,
  stocks: 150000,
  fund: 36000,
  monthlyGrowthRate: 0.028
};

let particles = [];
let ripples = [];

let touchXPos = 0;
let touchYPos = 0;
let touchActive = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);

  document.body.style.overflow = "hidden";
  document.body.style.margin = "0";

  generateOrganism();
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

function generateOrganism() {
  randomSeed(486000 + day());

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

  let mx;
  let my;

  if (touchActive) {
    mx = touchXPos - width / 2;
    my = touchYPos - height / 2;
  } else {
    mx = mouseX - width / 2;
    my = mouseY - height / 2;
  }

  for (let p of particles) {
    let dx = mx - p.x;
    let dy = my - p.y;
    let d = sqrt(dx * dx + dy * dy);

    let influence = 0;

    if (d < 190) {
      influence = map(d, 0, 190, 32, 0, true);
    }

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

  strokeWeight(1);

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
  text("Financial Organism", width / 2, height - 115);

  textSize(width < 600 ? 28 : 42);
  text("NT$ " + nf(data.totalAsset, 0, 0), width / 2, height - 75);

  textSize(width < 600 ? 13 : 16);
  text("Monthly Growth  +" + nf(data.monthlyGrowthRate * 100, 1, 1) + "%", width / 2, height - 38);
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

function touchStarted() {
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

    generateOrganism();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateOrganism();
}