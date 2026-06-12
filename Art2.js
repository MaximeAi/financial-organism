// Financial Organism Mobile
// 慢速呼吸版：手靠近加速，不含點擊彈開效果

let colors=['#fdfffc','#235789','#c1292e','#f1d302','#020100'];
let circles=[];
let motions=[];
let noiseFilter;

function setup(){
 createCanvas(windowWidth,windowHeight);
 generateScene();
}

function draw(){
 background(255);
 for(let m of motions){m.show();m.move();}
 image(noiseFilter,0,0);
}

function generateScene(){
 circles=[]; motions=[];
 let base=min(width,height);
 for(let i=0;i<10000;i++){
  let d=base*random(0.06,0.16);
  let x=width/2+random(-0.42,0.42)*(width-d);
  let y=height/2+random(-0.42,0.42)*(height-d);
  let ok=true;
  for(let c of circles){
   if(dist(x,y,c.x,c.y)<(d+c.d)/2){ok=false;break;}
  }
  if(ok) circles.push({x,y,d});
 }
 for(let c of circles) motions.push(new Motion(c.x,c.y,c.d));

 noiseFilter=createImage(width,height);
 noiseFilter.loadPixels();
 for(let i=0;i<noiseFilter.pixels.length;i+=4){
  let g=random(220,255);
  noiseFilter.pixels[i]=g;
  noiseFilter.pixels[i+1]=g;
  noiseFilter.pixels[i+2]=g;
  noiseFilter.pixels[i+3]=random(15);
 }
 noiseFilter.updatePixels();
}

function windowResized(){
 resizeCanvas(windowWidth,windowHeight);
 generateScene();
}

function getPointerX(){ return touches.length?touches[0].x:mouseX; }
function getPointerY(){ return touches.length?touches[0].y:mouseY; }
function touchStarted(){ return false; }
function touchMoved(){ return false; }

function easeOutCirc(x){ return sqrt(1-pow(x-1,2)); }

class Motion{
 constructor(x,y,d){
  this.x=x; this.y=y; this.d=d;
  this.n=int(random(4,15));
  this.te=int(random(200,400));
  this.circles=[];
  this.cols=[...colors].sort(()=>random()-0.5);
  for(let i=0;i<this.n;i++){
   this.circles.push(new Circle(this.d*1.1,-((this.te/this.n)*i)+this.te,this.te,this.cols[i%this.cols.length]));
  }
 }
 show(){
  push();
  translate(this.x,this.y);
  drawingContext.save();
  circle(0,0,this.d);
  drawingContext.clip();
  for(let r of this.circles){ r.show(); r.move(this.getBoost()); }
  this.circles=this.circles.filter(c=>!c.isDead);
  while(this.circles.length<this.n){
   this.circles.push(new Circle(this.d*1.1,0,this.te,this.cols[int(random(this.cols.length))]));
  }
  drawingContext.restore();
  pop();
 }
 move(){}
 getBoost(){
  let d=dist(getPointerX(),getPointerY(),this.x,this.y);
  return d<180 ? map(d,0,180,2.0,1.0) : 1.0;
 }
}

class Circle{
 constructor(d,t0,t1,col){
  let th=random(TAU);
  let r=random(0,0.5)*d;
  this.x0=r*cos(th);
  this.y0=r*sin(th);
  this.x=0; this.y=0;
  this.d=0; this.d1=d;
  this.t=t0; this.t1=t1;
  this.col=col;
  this.isDead=false;
 }
 show(){
  noStroke();
  fill(this.col);
  circle(this.x,this.y,this.d);
 }
 move(boost){
  if(this.t>0 && this.t<this.t1){
   let n=norm(this.t,0,this.t1-1);
   let e=easeOutCirc(n);
   this.d=lerp(0,this.d1,e);
   this.x=lerp(this.x0,0,e);
   this.y=lerp(this.y0,0,e);
  }
  if(this.t>this.t1) this.isDead=true;
  this.t += boost*0.45;
 }
}
