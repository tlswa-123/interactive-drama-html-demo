// 停车游戏引擎 wrapper - 直接复用独立页面逻辑
// 由于停车游戏代码量大(652行)，这里直接把核心变量和函数提取为模块

var COLORS = {
  red:{f:'#E53935',d:'#B71C1C',l:'#EF5350'}, blue:{f:'#1E88E5',d:'#0D47A1',l:'#42A5F5'},
  yellow:{f:'#FDD835',d:'#F9A825',l:'#FFEE58'}, green:{f:'#43A047',d:'#1B5E20',l:'#66BB6A'},
  pink:{f:'#EC407A',d:'#AD1457',l:'#F06292'}, purple:{f:'#7E57C2',d:'#4527A0',l:'#9575CD'}
}
var CK=['red','blue','yellow','green','pink','purple']
var DIR={up:{dx:0,dy:-1,a:0},down:{dx:0,dy:1,a:Math.PI},left:{dx:-1,dy:0,a:-Math.PI/2},right:{dx:1,dy:0,a:Math.PI/2}}
var DK=['up','down','left','right']

function shuffle(a){for(var i=a.length-1;i>0;i--){var j=(Math.random()*(i+1))|0;var t=a[i];a[i]=a[j];a[j]=t}return a}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function lerp(a,b,t){return a+(b-a)*t}
function easeOut(t){return 1-Math.pow(1-t,3)}
function canExit(g,cols,rows,col,row,dk){var d=DIR[dk];var c=col+d.dx,r=row+d.dy;while(c>=0&&c<cols&&r>=0&&r<rows){if(g[r][c]!==-1)return false;c+=d.dx;r+=d.dy}return true}

function getLvlCfg(lv){
  if(lv<=1)return{cols:4,rows:5,cc:2,cn:6,pp:2,sl:4};if(lv<=2)return{cols:4,rows:5,cc:2,cn:8,pp:2,sl:4}
  if(lv<=4)return{cols:5,rows:6,cc:3,cn:12,pp:2,sl:4};if(lv<=6)return{cols:5,rows:7,cc:3,cn:15,pp:3,sl:4}
  if(lv<=8)return{cols:6,rows:7,cc:4,cn:20,pp:3,sl:4};if(lv<=10)return{cols:6,rows:8,cc:4,cn:25,pp:3,sl:4}
  return{cols:7,rows:8,cc:Math.min(5,4+((lv-10)/5|0)),cn:Math.min(30,25+lv-10),pp:3,sl:4}
}

function genLevel(cfg){
  var cols=cfg.cols,rows=cfg.rows,cc=cfg.cc,cn=cfg.cn,pp=cfg.pp
  var uc=CK.slice(0,cc),ca=[];for(var i=0;i<cn;i++)ca.push(uc[i%cc]);shuffle(ca)
  var g=[];for(var r=0;r<rows;r++)g.push(new Array(cols).fill(-1))
  var cars=[],sol=[]
  for(var i=cn-1;i>=0;i--){
    var placed=null
    for(var a=0;a<300;a++){var col=(Math.random()*cols)|0;var row=(Math.random()*rows)|0;if(g[row][col]!==-1)continue
      var ds=shuffle(DK.slice());for(var di=0;di<ds.length;di++){if(canExit(g,cols,rows,col,row,ds[di])){g[row][col]=i;placed={id:i,color:ca[i],dir:ds[di],col:col,row:row,active:true};break}}if(placed)break}
    if(!placed){outer:for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){if(g[r][c]!==-1)continue;for(var di=0;di<DK.length;di++){if(canExit(g,cols,rows,c,r,DK[di])){g[r][c]=i;placed={id:i,color:ca[i],dir:DK[di],col:c,row:r,active:true};break outer}}}}
    if(placed){cars.push(placed);sol.unshift(placed.id)}
  }
  var pass=[];for(var i=0;i<sol.length;i++){var car=cars.find(function(c){return c.id===sol[i]});if(car)for(var p=0;p<pp;p++)pass.push(car.color)}
  return{cars:cars.filter(Boolean),passengers:pass,sol:sol}
}

function create(){
  var E={
    canvas:null,ctx:null,W:0,H:0,dpr:1,level:1,
    cars:[],waitSlots:[],passengers:[],passPerCar:2,totalPass:0,boarded:0,
    gameState:'playing',animating:false,shakeCar:-1,shakeT:0,movingCar:null,cfg:null,
    cellW:0,cellH:0,lotX:0,lotY:0,lotW:0,lotH:0,slotH:0,slotStartX:0,slotW:0,slotY:0,
    items:{refresh:3,remove:1,reorder:3,flip:3},
    _tapX:0,_tapY:0,

    init:function(canvas,w,h){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.W=w;this.H=h
      this.level=1;this.items={refresh:3,remove:1,reorder:3,flip:3}
      this.startLevel(1)
    },
    destroy:function(){this.gameState='stopped'},

    startLevel:function(lv){
      this.level=lv;this.cfg=getLvlCfg(lv);var data=genLevel(this.cfg)
      this.cars=data.cars;this.passengers=data.passengers;this.passPerCar=this.cfg.pp
      this.waitSlots=new Array(this.cfg.sl).fill(null);this.totalPass=this.passengers.length
      this.boarded=0;this.gameState='playing';this.animating=false;this.shakeCar=-1;this.movingCar=null
      var W=this.W,H=this.H,padX=W*0.04,lotW=W-padX*2,cellW=lotW/this.cfg.cols
      var lotY=H*0.26,lotBottom=H*0.84,lotH=lotBottom-lotY,cellH=lotH/this.cfg.rows
      var cs=Math.min(cellW,cellH);cellW=cs;cellH=cs;lotW=cellW*this.cfg.cols;lotH=cellH*this.cfg.rows
      var lotX=(W-lotW)/2
      if(lotY+lotH>H*0.84){var sc=(H*0.84-lotY)/lotH;cellW*=sc;cellH*=sc;lotW=cellW*this.cfg.cols;lotH=cellH*this.cfg.rows;lotX=(W-lotW)/2}
      this.cellW=cellW;this.cellH=cellH;this.lotX=lotX;this.lotY=lotY;this.lotW=lotW;this.lotH=lotH
      this.slotH=H*0.07;this.slotStartX=W*0.06;this.slotW=(W*0.88)/this.cfg.sl;this.slotY=H*0.08
      this.render()
    },

    buildGrid:function(){var g=[];for(var r=0;r<this.cfg.rows;r++)g.push(new Array(this.cfg.cols).fill(-1));var self=this;this.cars.forEach(function(c,i){if(c&&c.active)g[c.row][c.col]=i});return g},

    onTouchStart:function(e){var t=e.touches?e.touches[0]:e;this._tapX=t.x;this._tapY=t.y},
    onTouchMove:function(){},
    onTouchEnd:function(e){
      var t=e.changedTouches?e.changedTouches[0]:e;if(Math.abs(t.x-this._tapX)>10||Math.abs(t.y-this._tapY)>10)return
      this.handleTap(this._tapX,this._tapY)
    },

    handleTap:function(px,py){
      var W=this.W,H=this.H
      if(this.gameState==='won'||this.gameState==='lost'){
        var pw=W*0.72,ph=H*0.26,panelX=(W-pw)/2,panelY=(H-ph)/2,bw=pw*0.45,bh=36,bx=W/2-bw/2,by=panelY+ph*0.77
        if(px>=bx&&px<=bx+bw&&py>=by&&py<=by+bh){if(this.gameState==='won')this.startLevel(this.level+1);else this.startLevel(this.level)}
        return
      }
      if(this.animating)return
      // 道具栏
      var tbY=H*0.885,tbH=H*0.075
      if(py>=tbY-8&&py<=tbY+tbH+8){var gap=10,bw2=(W-gap*5)/4;var idx=Math.floor((px-gap)/(bw2+gap));if(idx>=0&&idx<4)this.handleItem(idx);return}
      // 停车场
      for(var i=0;i<this.cars.length;i++){var car=this.cars[i];if(!car||!car.active)continue
        var cx=this.lotX+car.col*this.cellW,cy=this.lotY+car.row*this.cellH
        if(px>=cx&&px<=cx+this.cellW&&py>=cy&&py<=cy+this.cellH){this.tryMove(i);return}}
    },

    tryMove:function(idx){
      var car=this.cars[idx];if(!car||!car.active)return;var d=DIR[car.dir],g=this.buildGrid()
      var c=car.col+d.dx,r=car.row+d.dy
      while(c>=0&&c<this.cfg.cols&&r>=0&&r<this.cfg.rows){if(g[r][c]!==-1){this.doShake(idx);return};c+=d.dx;r+=d.dy}
      var si=this.waitSlots.indexOf(null);if(si===-1){this.doShake(idx);return}
      this.animating=true;car.active=false;this.waitSlots[si]={color:car.color,boarded:0,id:car.id}
      var fx=this.lotX+car.col*this.cellW+this.cellW/2,fy=this.lotY+car.row*this.cellH+this.cellH/2
      var tx=this.slotStartX+si*this.slotW+this.slotW/2,ty=this.slotY+this.slotH/2
      this.movingCar={car:car,fx:fx,fy:fy,tx:tx,ty:ty,p:0};this.animLoop()
    },

    doShake:function(idx){var self=this;this.shakeCar=idx;this.shakeT=0;var tick=function(){self.shakeT++;if(self.shakeT>8){self.shakeCar=-1;self.render();return};self.render();self.canvas.requestAnimationFrame(tick)};self.canvas.requestAnimationFrame(tick)},

    animLoop:function(){var self=this;if(this.movingCar){this.movingCar.p+=0.06;if(this.movingCar.p>=1){this.movingCar=null;this.doMatch();return};this.render();this.canvas.requestAnimationFrame(function(){self.animLoop()});return};this.animating=false;this.render();this.checkEnd()},

    doMatch:function(){
      var changed=false;while(this.passengers.length>0){var nc=this.passengers[0];var found=-1
        for(var s=0;s<this.waitSlots.length;s++){if(this.waitSlots[s]&&this.waitSlots[s].color===nc){found=s;break}}
        if(found===-1)break;this.passengers.shift();this.boarded++;this.waitSlots[found].boarded++;changed=true
        if(this.waitSlots[found].boarded>=this.passPerCar)this.waitSlots[found]=null}
      this.render();var self=this
      if(changed)setTimeout(function(){self.animating=false;self.render();self.checkEnd()},200)
      else{this.animating=false;this.checkEnd()}
    },

    checkEnd:function(){
      if(this.cars.every(function(c){return!c||!c.active})&&this.passengers.length===0){this.gameState='won';this.render();return}
      if(this.waitSlots.every(function(s){return s!==null})&&this.passengers.length>0){
        var nc=this.passengers[0];var cm=this.waitSlots.some(function(s){return s&&s.color===nc})
        if(!cm){var self=this;var hm=this.cars.some(function(c){if(!c||!c.active)return false;var d=DIR[c.dir],g=self.buildGrid()
          var cc=c.col+d.dx,rr2=c.row+d.dy;while(cc>=0&&cc<self.cfg.cols&&rr2>=0&&rr2<self.cfg.rows){if(g[rr2][cc]!==-1)return false;cc+=d.dx;rr2+=d.dy}return true})
          if(!hm){this.gameState='lost';this.render()}}}
    },

    handleItem:function(idx){var keys=['refresh','remove','reorder','flip'];var k=keys[idx];if(!this.items[k]||this.items[k]<=0)return;this.items[k]--
      if(k==='refresh'){var ac=this.cars.filter(function(c){return c&&c.active}).map(function(c){return c.color});shuffle(ac);var i=0;this.cars.forEach(function(c){if(c&&c.active)c.color=ac[i++]})}
      else if(k==='reorder')shuffle(this.passengers)
      else if(k==='flip'){for(var ci=0;ci<this.cars.length;ci++){var c=this.cars[ci];if(!c||!c.active)continue;var g=this.buildGrid()
        if(!canExit(g,this.cfg.cols,this.cfg.rows,c.col,c.row,c.dir)){var ds=shuffle(DK.slice());for(var di=0;di<ds.length;di++){if(canExit(g,this.cfg.cols,this.cfg.rows,c.col,c.row,ds[di])){c.dir=ds[di];break}}break}}}
      else if(k==='remove'){for(var i=this.cars.length-1;i>=0;i--){if(this.cars[i]&&this.cars[i].active){this.cars[i].active=false;break}}}
      this.render()
    },

    render:function(){
      if(!this.ctx)return;var ctx=this.ctx,W=this.W,H=this.H;ctx.clearRect(0,0,W,H)
      var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#e8eaf6');bg.addColorStop(1,'#c5cae9');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
      this.drawRoad(ctx,W,H);this.drawWaitSlots(ctx);this.drawPassQ(ctx,W,H);this.drawLot(ctx);this.drawCars(ctx);this.drawMoving(ctx);this.drawHUD(ctx,W,H);this.drawToolbar(ctx,W,H)
      if(this.gameState==='won'||this.gameState==='lost')this.drawResult(ctx,W,H)
    },

    drawRoad:function(ctx,W,H){var rh=H*0.05;ctx.fillStyle='#546e7a';ctx.fillRect(0,0,W,rh);ctx.strokeStyle='#ffeb3b';ctx.lineWidth=2;ctx.setLineDash([14,10]);ctx.beginPath();ctx.moveTo(0,rh/2);ctx.lineTo(W,rh/2);ctx.stroke();ctx.setLineDash([])},
    drawWaitSlots:function(ctx){for(var i=0;i<(this.cfg?this.cfg.sl:4);i++){var sx=this.slotStartX+i*this.slotW;ctx.fillStyle='#90a4ae';rr(ctx,sx+4,this.slotY+3,this.slotW-8,this.slotH,8);ctx.fill();ctx.fillStyle='#eceff1';rr(ctx,sx+4,this.slotY,this.slotW-8,this.slotH,8);ctx.fill();ctx.strokeStyle='#b0bec5';ctx.lineWidth=1.5;rr(ctx,sx+4,this.slotY,this.slotW-8,this.slotH,8);ctx.stroke();var sl=this.waitSlots[i];if(sl){this.drawSlotCar(ctx,sx+this.slotW/2,this.slotY+this.slotH/2,this.slotW*0.65,this.slotH*0.75,sl.color,sl.boarded)}else{ctx.fillStyle='#b0bec5';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('P',sx+this.slotW/2,this.slotY+this.slotH/2)}}},
    drawSlotCar:function(ctx,cx,cy,w,h,ck,bd){var co=COLORS[ck];ctx.fillStyle=co.d;rr(ctx,cx-w/2,cy-h/2+3,w,h,5);ctx.fill();ctx.fillStyle=co.f;rr(ctx,cx-w/2,cy-h/2,w,h,5);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(bd+'/'+this.passPerCar,cx,cy+1)},
    drawPassQ:function(ctx,W,H){var qy=H*0.205,mx=20;var max=Math.min(this.passengers.length,Math.floor((W-40)/16));var gap=Math.min(16,(W-40)/(max||1));ctx.fillStyle='rgba(255,255,255,0.5)';rr(ctx,mx-4,qy-12,(max||1)*gap+12,24,6);ctx.fill();ctx.fillStyle='#37474f';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('排队 '+this.passengers.length+'人',mx,qy-20);for(var i=0;i<max;i++){var co=COLORS[this.passengers[i]];if(!co)continue;var px=mx+i*gap+gap/2;ctx.beginPath();ctx.arc(px,qy,6.5,0,Math.PI*2);ctx.fillStyle=co.f;ctx.fill();ctx.strokeStyle=co.d;ctx.lineWidth=1.5;ctx.stroke()}},
    drawLot:function(ctx){ctx.fillStyle='rgba(0,0,0,0.08)';rr(ctx,this.lotX+5,this.lotY+5,this.lotW,this.lotH,10);ctx.fill();ctx.fillStyle='#78909c';rr(ctx,this.lotX,this.lotY,this.lotW,this.lotH,10);ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([5,4]);for(var r=0;r<=this.cfg.rows;r++){var y=this.lotY+r*this.cellH;ctx.beginPath();ctx.moveTo(this.lotX,y);ctx.lineTo(this.lotX+this.lotW,y);ctx.stroke()};for(var c=0;c<=this.cfg.cols;c++){var x=this.lotX+c*this.cellW;ctx.beginPath();ctx.moveTo(x,this.lotY);ctx.lineTo(x,this.lotY+this.lotH);ctx.stroke()};ctx.setLineDash([])},
    drawCars:function(ctx){var self=this;this.cars.forEach(function(car,i){if(!car||!car.active)return;var cx=self.lotX+car.col*self.cellW+self.cellW/2;var cy=self.lotY+car.row*self.cellH+self.cellH/2;if(self.shakeCar===i&&self.shakeT>0)cx+=(self.shakeT%2?3:-3);self.draw25D(ctx,cx,cy,self.cellW*0.85,self.cellH*0.85,car.color,car.dir)})},
    draw25D:function(ctx,cx,cy,w,h,ck,dk){var co=COLORS[ck];var cw=w*0.82,ch=h*0.58,dep=4;ctx.fillStyle=co.d;rr(ctx,cx-cw/2,cy-ch/2+dep,cw,ch,5);ctx.fill();var g=ctx.createLinearGradient(cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2);g.addColorStop(0,co.l);g.addColorStop(0.5,co.f);g.addColorStop(1,co.d);ctx.fillStyle=g;rr(ctx,cx-cw/2,cy-ch/2,cw,ch,5);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.3)';rr(ctx,cx-cw*0.3,cy-ch/2+2,cw*0.6,ch*0.25,3);ctx.fill();this.drawArrow(ctx,cx,cy,cw*0.35,dk)},
    drawArrow:function(ctx,cx,cy,sz,dk){ctx.save();ctx.translate(cx,cy);ctx.rotate(DIR[dk].a);var s=sz*0.38;ctx.fillStyle='rgba(255,255,255,0.85)';ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*0.65,s*0.15);ctx.lineTo(s*0.2,s*0.15);ctx.lineTo(s*0.2,s);ctx.lineTo(-s*0.2,s);ctx.lineTo(-s*0.2,s*0.15);ctx.lineTo(-s*0.65,s*0.15);ctx.closePath();ctx.fill();ctx.restore()},
    drawMoving:function(ctx){if(!this.movingCar)return;var m=this.movingCar;var t=easeOut(Math.min(m.p,1));var x=lerp(m.fx,m.tx,t),y=lerp(m.fy,m.ty,t);this.draw25D(ctx,x,y,this.cellW*0.85,this.cellH*0.85,m.car.color,m.car.dir)},
    drawHUD:function(ctx,W,H){ctx.fillStyle='rgba(0,0,0,0.55)';rr(ctx,W/2-45,H*0.052,90,24,12);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('第 '+this.level+' 关',W/2,H*0.052+12)},
    drawToolbar:function(ctx,W,H){var ty=H*0.885,th=H*0.075;ctx.fillStyle='rgba(38,50,56,0.88)';rr(ctx,0,ty-10,W,th+24,14);ctx.fill();var its=[{icon:'刷新',cnt:this.items.refresh},{icon:'消除',cnt:this.items.remove},{icon:'排序',cnt:this.items.reorder},{icon:'翻转',cnt:this.items.flip}];var gap=10,bw=(W-gap*5)/4;var self=this;its.forEach(function(it,i){var bx=gap+i*(bw+gap);ctx.fillStyle=it.cnt>0?'rgba(255,255,255,0.13)':'rgba(255,255,255,0.04)';rr(ctx,bx,ty,bw,th,8);ctx.fill();ctx.fillStyle=it.cnt>0?'#fff':'#666';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(it.icon,bx+bw/2,ty+th*0.5)})},
    drawResult:function(ctx,W,H){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);var pw=W*0.72,ph=H*0.26,px=(W-pw)/2,py=(H-ph)/2;ctx.fillStyle='#fff';rr(ctx,px,py,pw,ph,18);ctx.fill();var win=this.gameState==='won';ctx.fillStyle=win?'#43A047':'#E53935';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(win?'通关成功!':'挑战失败',W/2,py+ph*0.35);var bw2=pw*0.45,bh2=36,bx2=W/2-bw2/2,by2=py+ph*0.77;ctx.fillStyle=win?'#43A047':'#FF7043';rr(ctx,bx2,by2,bw2,bh2,18);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.fillText(win?'下一关':'重新挑战',W/2,by2+bh2/2)}
  }
  return E
}

module.exports = { create: create }
