/*
By Okazz
Mobile interactive version
*/

let colors = ['#fdfffc', '#235789', '#c1292e', '#f1d302', '#020100'];
let ctx;
let circles = [];
let motions = [];
let noiseFilter;

let pulseX = 0;
let pulseY = 0;
let pulsePower = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  ctx = drawingContext;
  generateScene();
}

function draw() {
  background(255);

  for (let m of motions) {
    m.show();
    m.move();
  }

  image(noiseFilter, 0, 0);

  noFill();
  stroke(0, 35);
  strokeWeight(1);
  circle(getPointerX(), getPointerY(), 120);

  if (pulsePower > 0) {
    noFill();
    stroke(0, pulsePower);
    strokeWeight(2);
    circle(pulseX, pulseY, (255 - pulsePower) * 3);
    pulsePower *= 0.92;
  }
}

function generateScene() {
  circles = [];
  motions = [];

  let baseSize = min(width, height);

  for (let i = 0; i < 10000; i++) {
    let d = baseSize * random(0.06, 0.16);
    let x = width / 2 + random(-0.42, 0.42) * (width - d);
    let y = height / 2 + random(-0.42, 0.42) * (height - d);

    let newShape = { x, y, d };
    let overlap = false;

    for (let c of circles) {
      if (checkCircleCollision(newShape, c)) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      circles.push({ x, y, d });
    }
  }

  for (let c of circles) {
    motions.push(new Motion(c.x, c.y, c.d));
  }

  createNoiseFilter();
}

function createNoiseFilter() {
  noiseFilter = createImage(width, height);
  noiseFilter.loadPixels();

  let pix = noiseFilter.width * noiseFilter.height * 4;

  for (let i = 0; i < pix; i += 4) {
    let x = (i / 4) % noiseFilter.width;
    let y = floor(map(i, 0, pix, 0, noiseFilter.height));
    let alph = random(25);
    let c = noise(y * 0.08, x * 0.08) * 240;

    noiseFilter.pixels[i] = c;
    noiseFilter.pixels[i + 1] = c;
    noiseFilter.pixels[i + 2] = c;
    noiseFilter.pixels[i + 3] = alph;
  }

  noiseFilter.updatePixels();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateScene();
}

function mousePressed() {
  createPulse(getPointerX(), getPointerY());
}

function touchStarted() {
  createPulse(getPointerX(), getPointerY());
  return false;
}

function touchMoved() {
  return false;
}

function createPulse(x, y) {
  pulseX = x;
  pulseY = y;
  pulsePower = 255;
}

function getPointerX() {
  if (touches.length > 0) return touches[0].x;
  return mouseX;
}

function getPointerY() {
  if (touches.length > 0) return touches[0].y;
  return mouseY;
}

function checkCircleCollision(a, b) {
  let distSq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  let radiusSum = a.d / 2 + b.d / 2;
  return distSq < radiusSum ** 2;
}

function easeOutCirc(x) {
  return sqrt(1 - Math.pow(x - 1, 2));
}

class Motion {
  constructor(x, y, d) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.d = d;
    this.n = int(random(4, 15));
    this.te = int(random(200, 400));
    this.t = 0;

    this.circles = [];
    this.cols = [];

    shuffle(colors, true);

    for (let i = 0; i < this.n; i++) {
      this.cols.push(colors[i % colors.length]);
      this.circles.push(
        new Circle(
          0,
          0,
          this.d * 1.1,
          -((this.te / this.n) * i) + this.te,
          this.te,
          this.cols[i]
        )
      );
    }

    this.count = 0;
  }

  show() {
    push();
    translate(this.x, this.y);

    strokeWeight(0);
    noFill();
    circle(0, 0, this.d);

    drawingContext.save();
    drawingContext.clip();

    for (let r of this.circles) {
      r.show();
      r.move(this.getPointerBoost());
    }

    for (let i = this.circles.length - 1; i >= 0; i--) {
      let r = this.circles[i];

      if (r.isDead) {
        this.count++;
        this.circles.splice(i, 1);
        this.circles.push(
          new Circle(
            0,
            0,
            this.d * 1.1,
            0,
            this.te,
            this.cols[this.count % this.cols.length]
          )
        );
      }
    }

    drawingContext.restore();
    pop();
  }

  move() {
    let px = getPointerX();
    let py = getPointerY();

    let dx = px - this.x;
    let dy = py - this.y;
    let distToPointer = sqrt(dx * dx + dy * dy);

    if (distToPointer < 180) {
      let force = map(distToPointer, 0, 180, 0.8, 0);
      this.vx += dx * 0.002 * force;
      this.vy += dy * 0.002 * force;
    }

    if (pulsePower > 1) {
      let pdx = this.x - pulseX;
      let pdy = this.y - pulseY;
      let pd = sqrt(pdx * pdx + pdy * pdy);

      if (pd < 260) {
        let push = map(pd, 0, 260, 1.5, 0);
        this.vx += (pdx / max(pd, 1)) * push;
        this.vy += (pdy / max(pd, 1)) * push;
      }
    }

    let homeX = this.baseX - this.x;
    let homeY = this.baseY - this.y;

    this.vx += homeX * 0.01;
    this.vy += homeY * 0.01;

    this.vx *= 0.86;
    this.vy *= 0.86;

    this.x += this.vx;
    this.y += this.vy;
  }

  getPointerBoost() {
    let d = dist(getPointerX(), getPointerY(), this.x, this.y);
    return d < 160 ? map(d, 0, 160, 3.5, 1) : 1;
  }
}

class Circle {
  constructor(x, y, d, t0, t1, col) {
    let th = random(TAU);
    let r = random(0, 0.5) * d;

    this.x0 = x + r * cos(th);
    this.x1 = x;
    this.y0 = y + r * sin(th);
    this.y1 = y;

    this.x = this.x0;
    this.y = this.y0;

    this.d = 0;
    this.d1 = d;
    this.t = t0;
    this.t1 = t1;
    this.isDead = false;
    this.col = col;
  }

  show() {
    noStroke();
    fill(this.col);
    circle(this.x, this.y, this.d);
  }

  move(speedBoost = 1) {
    if (0 < this.t && this.t < this.t1) {
      let n = norm(this.t, 0, this.t1 - 1);
      let e = easeOutCirc(n);

      this.d = lerp(0, this.d1, e);
      this.x = lerp(this.x0, this.x1, e);
      this.y = lerp(this.y0, this.y1, e);
    }

    if (this.t > this.t1) {
      this.isDead = true;
    }

    this.t += speedBoost;
  }
}