function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

const colors = {
    0: 'gray',
    1: 'blue',
    2: 'yellow',
    3: 'red'
};

function getHash(x, y)  {
    return x * 317 + y * 97;
}

function Host(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.dropped = 0;
    this.hash = {};
    this.drawMe = [];
}

Host.prototype.dropSand = function(x, y)    {
    this.hash[getHash(x, y)] = new Sand(this, this.game, x, y);
    this.drawMe.push(getHash(x, y));
}

Host.prototype.draw = function()    {
}

Host.prototype.update = function() {
    for(var i = 0; i < this.drawMe.length; i++) {
        this.hash[this.drawMe[i]].update();
    }
    this.dropped++;
}


Host.prototype.updateSand = function(x, y)   {
    if(this.hash[getHash(x, y)] === undefined)    {
        this.hash[getHash(x, y)] = new Sand(this, this.game, x, y);
    }
    this.hash[getHash(x, y)].update();
}

class Sand {
    constructor(host, game, x, y)   {
        this.game = game;
        this.ctx = game.ctx;
        this.host = host;
        this.x = x;
        this.y = y;
        this.value = 0;
    }

    update()    {
        //this.draw();
        this.value++;
        if(this.value === 4)    {
            this.value = 0;
            this.host.updateSand(this.x - 4, this.y);
            this.host.updateSand(this.x + 4, this.y);
            this.host.updateSand(this.x, this.y - 4);
            this.host.updateSand(this.x, this.y + 4);
        }
        this.draw();
    }

    draw()  {
      if(this.x >= 0 && this.x <= 800 && this.y >= 0 && this.y <= 800)  {
        this.ctx.fillStyle = colors[this.value];
        this.ctx.fillRect(this.x, this.y, 4, 4);
      }
    }
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/RobotUnicorn.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;



    var gameEngine = new GameEngine();

    gameEngine.init(ctx);

    gameEngine.start();

    var host = new Host(gameEngine);
    gameEngine.addEntity(host);
    //
    host.dropSand(398, 398);

    canvas.addEventListener("click", function(e) {
      //gameEngine.loop();
        var x = e.clientX;
        var y = e.clientY;
        host.dropSand(x, y);
    }, true);
});
