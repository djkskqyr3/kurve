"use strict";

Kurve.Curve = function(player) {
    this.player     = player;
    this.isAlive    = true;

    var randomPosition  = Kurve.Field.getRandomPosition();
    this.posX           = randomPosition.posX;
    this.posY           = randomPosition.posY;
    this.nextPosX       = randomPosition.posX;
    this.nextPosY       = randomPosition.posY;

    this.stepLength = 3;
    this.lineWidth  = 4;
    this.angle      = 5*Math.random();
    this.dAngle     = 0.08;
    this.holeCount  = 100;

    this.draw = function(ctx) {
        ctx.beginPath();
        
        ctx.moveTo(this.posX, this.posY);
        ctx.lineTo(this.nextPosX, this.nextPosY);
       
        ctx.strokeStyle = this.player.color;
        ctx.lineWidth   = this.lineWidth;
        
        ctx.stroke();
    };

    this.checkForCollision = function(ctx) {
        if (this.isCollided(this.nextPosX, this.nextPosY, ctx)) {
            this.die(ctx);
        }
    };
    
    this.die = function(ctx) {
        this.draw(ctx);
        this.isAlive = false;
        Kurve.Game.notifyDeath(this);
    };
    
        //getImageData of entire field just once save in Game or so for performance reasons!!!
    this.isCollided = function(posX, posY, ctx) {
        return ctx.getImageData(posX, posY, 1, 1).data[3] !== 0;
    };

    this.moveToNextFrame = function() {
        if ( Kurve.Game.isKeyPressed(this.player.keyRight) ) {
            this.angle += this.dAngle;
        } else if ( Kurve.Game.isKeyPressed(this.player.keyLeft) ) {
            this.angle -= this.dAngle;
        }
        
        this.posX       = this.nextPosX;
        this.posY       = this.nextPosY;
        this.nextPosX  += this.stepLength * Math.cos(this.angle);
        this.nextPosY  += this.stepLength * Math.sin(this.angle);
    };
};