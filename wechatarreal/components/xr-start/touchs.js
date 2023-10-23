const DEFAULT_OPTIONS = {
    touchStart: function () { },
    touchMove: function () { },
    touchEnd: function () { },
    rotate: function () { },
    pinch: function () { },  
}
export default class MinaTouch {
    constructor(option = {}) {
        this.preV = { x: null, y: null }; 
        this.fristV = { x: null, y: null }; 
        this.pinchStartLen = null;
        this.scale = 1; 

        this.delta = null;
        this.last = null;
        this.now = null;  
        this.x1 =this.y1 = null;  
        
        this.lastZoom = 1;
        this.tempZoom = 1; 
        this._option = { ...DEFAULT_OPTIONS, ...option } 
    }  
    start(evt) {
        if (!evt.touches) return;
        this.now = Date.now();
        this.x1 = evt.touches[0].pageX == null ? evt.touches[0].x : evt.touches[0].pageX;
        this.y1 = evt.touches[0].pageY == null ? evt.touches[0].y : evt.touches[0].pageY;  
        this.last = this.now;
        this.fristV.x =  this.x1;
        this.fristV.y =  this.y1;
        let preV = this.preV;
            len = evt.touches.length;
        if (len > 1) {
            let otx = evt.touches[1].pageX == null ? evt.touches[1].x : evt.touches[1].pageX;
            let oty = evt.touches[1].pageY == null ? evt.touches[1].y : evt.touches[1].pageY;
            let v = { x: otx - this.x1, y: oty - this.y1 };
            preV.x = v.x;
            preV.y = v.y;
            this.pinchStartLen = getLen(preV);
        }
    }
    move(evt) {
        if (!evt.touches) return;
        let preV = this.preV,
            len = evt.touches.length,
            currentX = evt.touches[0].pageX == null ? evt.touches[0].x : evt.touches[0].pageX,
            currentY = evt.touches[0].pageY == null ? evt.touches[0].y : evt.touches[0].pageY; 
 
        if (len > 1) {
            let otx = evt.touches[1].pageX == null ? evt.touches[1].x : evt.touches[1].pageX;
            let oty = evt.touches[1].pageY == null ? evt.touches[1].y : evt.touches[1].pageY;
            let v = { x: otx - currentX, y: oty - currentY };

            if (preV.x !== null) {
                if (this.pinchStartLen > 0) {
                    evt.singleZoom = getLen(v) / this.pinchStartLen;
                    evt.zoom = evt.singleZoom * this.lastZoom;
                    this.tempZoom = evt.zoom;
                    evt.type = "pinch";
                    this._option.pinch(evt);
                } 
            }
            preV.x = v.x;
            preV.y = v.y;
        } else {
            if (this.preV !== null) { 
              let currentV =  { x: currentX, y: currentY };
              evt.angle = getRotateAngle(this.fristV, currentV);
              evt.type = "rotate";
              this._option.rotate(evt);   
            }  
        } 
        this._option.touchMove(evt);  
    }

    end(evt) {
        if (!evt.changedTouches) return;  
        if (evt.touches.length < 2) {
            this.lastZoom = this.tempZoom; 
        }
        this._option.touchEnd(evt); 
        this.preV.x = 0;
        this.preV.y = 0;
        this.scale = 1;
        this.pinchStartLen = null;
        this.x1  = this.y1 = null;
    } 
  
    destroy() {  
        this._option.rotate = null;
        this._option.touchStart = null;
        this._option.pinch = null;   
        this._option.touchMove = null;
        this._option.touchEnd = null; 

        this.preV = this.pinchStartLen = this.scale =   this.delta = this.last = this.now =  this.x1 = this.y1 = this.rotate = this.touchStart =  this.pinch =this.touchMove = this.touchEnd = null;

        return null;
    }
}

function getLen(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function getAngle(v1, v2) {
    let mr = getLen(v1) * getLen(v2);
    if (mr === 0) return 0;
    let r = dot(v1, v2) / mr;
    if (r > 1) r = 1;
    return Math.acos(r);
}

function cross(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
}

function getRotateAngle(v1, v2) {
    let angle = getAngle(v1, v2);
    if (cross(v1, v2) > 0) {
        angle *= -1;
    }

    return angle * 180 / Math.PI;
}