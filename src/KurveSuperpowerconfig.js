/**
 *
 * Program:     Kurve
 * Author:      Markus Mächler, marmaechler@gmail.com
 * License:     http://www.gnu.org/licenses/gpl.txt
 * Link:        http://achtungkurve.com
 *
 * Copyright © 2014, 2015 Markus Mächler
 *
 * Kurve is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Kurve is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Kurve.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

'use strict';

Kurve.Superpowerconfig = {};

Kurve.Superpowerconfig.types = {
    RUN_FASTER: 'RUN_FASTER',
    RUN_SLOWER: 'RUN_SLOWER',
    JUMP: 'JUMP',
    INVISIBLE: 'INVISIBLE',
    VERTICAL_BAR: 'VERTICAL_BAR',
    CROSS_WALLS: 'CROSS_WALLS',
    DARK_KNIGHT: 'DARK_KNIGHT',
    HYDRA: 'HYDRA',
    REVERSE: 'REVERSE',
    SQUARE_HEAD: 'SQUARE_HEAD',
    CHUCK_NORRIS: 'CHUCK_NORRIS'
};

Kurve.Superpowerconfig.hooks = {
    DRAW_NEXT_FRAME: 'DRAW_NEXT_FRAME',
    DRAW_LINE: 'DRAW_LINE',
    IS_COLLIDED: 'IS_COLLIDED'
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.RUN_FASTER] = {
    label: 'run faster',

    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
       executionTime: 0,
       initAct: function() {
           this.decrementCount();
           this.setIsActive(true);
           this.helpers.executionTime = 4 * Kurve.Game.fps;
       },
       closeAct: function() {
           this.setIsActive(false);
       }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
       if ( !this.isActive() ) this.helpers.initAct.call(this);
       if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this);

       curve.moveToNextFrame();
       curve.checkForCollision();
       curve.drawLine(curve.getField());

       this.helpers.executionTime--;
    },

    close: function(curve) {
        this.setIsActive(false);
    }
 };

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.RUN_SLOWER] = {
    label: 'run slower',

    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
        initialStepLength: null,
        executionTime: 0,
        initAct: function(curve) {
            this.decrementCount();
            this.setIsActive(true);
            this.helpers.executionTime = 6 * Kurve.Game.fps;
            this.helpers.initialStepLength = curve.getOptions().stepLength;

            curve.getOptions().stepLength = this.helpers.initialStepLength / 2;
        },
        closeAct: function(curve) {
            this.setIsActive(false);
            curve.getOptions().stepLength = this.helpers.initialStepLength;
        }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( !this.isActive() ) this.helpers.initAct.call(this, curve);
        if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this, curve);

        this.helpers.executionTime--;
    },

    close: function(curve) {
        this.setIsActive(false);
        if ( this.helpers.initialStepLength !== null ) curve.getOptions().stepLength = this.helpers.initialStepLength;
    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.JUMP] = {
    label: 'jump',

    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
        jumpWidth: 24
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( !this.isActive() ) {
            var jumpedPositionX = curve.getMovedPositionX(curve.getOptions().stepLength * this.helpers.jumpWidth);
            var jumpedPositionY = curve.getMovedPositionY(curve.getOptions().stepLength * this.helpers.jumpWidth);

            curve.setNextPositionX(jumpedPositionX);
            curve.setNextPositionY(jumpedPositionY);

            this.decrementCount();
            this.setIsActive(true);
        }

        if ( !curve.getGame().isKeyDown(curve.getPlayer().getKeySuperpower()) ) {
            this.setIsActive(false); //super power key has been released, can be used again
        }
    },

    close: function(curve) {

    }
 };

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.INVISIBLE] = {
    label: 'invisible',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_LINE,
        Kurve.Superpowerconfig.hooks.IS_COLLIDED
    ],

    helpers: {
        executionTime: 0,
        initAct: function() {
            this.decrementCount();
            this.setIsActive(true);
            this.helpers.executionTime = 4 * Kurve.Game.fps; //4s
        },
        closeAct: function() {
            this.setIsActive(false);
        }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( hook === Kurve.Superpowerconfig.hooks.DRAW_LINE ) {
            if ( !this.isActive() ) this.helpers.initAct.call(this);
            if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this);

            curve.setIsInvisible(true);

            this.helpers.executionTime--;
        } else if ( hook === Kurve.Superpowerconfig.hooks.IS_COLLIDED && this.isActive() ) {
            return false;
        }
    },

    close: function(curve) {
        this.setIsActive(false);
    }
 };

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.VERTICAL_BAR] = {
    label: 'vertical bar',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME
    ],

    helpers: {
        barWidth: 50
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( !this.isActive() ) {
            var leftEndX = Math.cos(curve.getOptions().angle - Math.PI / 2) * this.helpers.barWidth + curve.getPositionX();
            var leftEndY = Math.sin(curve.getOptions().angle - Math.PI / 2) * this.helpers.barWidth + curve.getPositionY();
            var rightEndX = Math.cos(curve.getOptions().angle + Math.PI / 2) * this.helpers.barWidth + curve.getPositionX();
            var rightEndY = Math.sin(curve.getOptions().angle + Math.PI / 2) * this.helpers.barWidth + curve.getPositionY();

            Kurve.Field.drawLine(leftEndX, leftEndY, rightEndX, rightEndY, curve.getPlayer().getColor(), curve);

            this.decrementCount();
            this.setIsActive(true);
        }

        if ( !curve.getGame().isKeyDown(curve.getPlayer().getKeySuperpower()) ) {
            this.setIsActive(false); //super power key has been released, can be used again
        }
    },

    close: function(curve) {

    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.CROSS_WALLS] = {
    label: 'cross walls',

    hooks: [
        Kurve.Superpowerconfig.hooks.IS_COLLIDED
    ],

    helpers: {
        isCrossingWall: false,
        getWallCrossedPosition: function(curve) {
            var positionX = curve.getNextPositionX();
            var positionY = curve.getNextPositionY();
            var field = curve.getField();
            var posX, posY = 0;

            if ( positionX > field.width ) {
                posX = positionX - field.width;
                posY = positionY;
            } else if ( positionX < 0 ) {
                posX = positionX + field.width;
                posY = positionY;
            } else if ( positionY > field.height ) {
                posX = positionX;
                posY = positionY - field.height;
            } else if (positionY < 0) {
                posX = positionX;
                posY = positionY + field.height;
            } else {
                //point not out of bounds, do not move
                posX = positionX;
                posY = positionY;
            }

            return new Kurve.Point(posX, posY);
        },
        isPointWithSurroundingsOutOfBounds: function(curve, positionX, positionY) {
            var pointSurroundings = Kurve.Field.getPointSurroundings(positionX, positionY);

            for (var pointSurroundingX in pointSurroundings) {
                for (var pointSurroundingY in pointSurroundings[pointSurroundingX]) {
                    if (curve.getField().isPointOutOfBounds(pointSurroundingX, pointSurroundingY)) {
                        return true;
                    }
                 }
            }

            return false;
        }
    },

    init: function(curve) {
        this.setIsActive(true);
    },

    act: function(hook, curve) {
        var nextPositionX = curve.getNextPositionX();
        var nextPositionY = curve.getNextPositionY();
        var isNextPointWithSurroundingsOutOfBounds = this.helpers.isPointWithSurroundingsOutOfBounds(curve, nextPositionX, nextPositionY);

        if ( this.helpers.isCrossingWall ) {
            var isPointWithSurroundingsOutOfBounds = this.helpers.isPointWithSurroundingsOutOfBounds(curve, curve.getPositionX(), curve.getPositionY());

            if ( isPointWithSurroundingsOutOfBounds || isNextPointWithSurroundingsOutOfBounds ) {
                return false; //we are still crossing the wall, do not collide
            } else {
                this.helpers.isCrossingWall = false;
            }
        }

        //isNextPointWithSurroundingsOutOfBounds => collision will be detected, if we have a superpower then deactivate collision detection
        if ( isNextPointWithSurroundingsOutOfBounds && this.getCount() > 0) {
            //if the current position is out of bounds, do make the transition
            if ( Kurve.Field.isPointOutOfBounds(nextPositionX, nextPositionY) ) {
                this.helpers.isCrossingWall = true;
                var movedPosition = this.helpers.getWallCrossedPosition(curve);

                curve.setPosition(movedPosition.getPosX(), movedPosition.getPosY());
                this.decrementCount();
            }

            return false;
        }

        //use standard collision detection
        return null;
    },

    close: function(curve) {
        this.setIsActive(false);
    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.DARK_KNIGHT] = {
    label: 'dark knight',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME
    ],

    helpers: {
        executionTime: 0,
        darkNightDivId: 'dark-knight',
        initAct: function() {
            if ( !u.hasClass('hidden', this.helpers.darkNightDivId) ) return;

            u.removeClass('hidden', this.helpers.darkNightDivId);
            this.decrementCount();
            this.setIsActive(true);
            this.helpers.executionTime = 3 * Kurve.Game.fps; //3s
        },
        closeAct: function() {
            u.addClass('hidden', this.helpers.darkNightDivId);
            this.setIsActive(false);
        }
    },

    init: function(curve) {

    },

    act: function(hook, curve) {
        if ( !this.isActive() ) this.helpers.initAct.call(this);
        if ( this.helpers.executionTime < 1 ) this.helpers.closeAct.call(this);

        this.helpers.executionTime--;
    },

    close: function(curve) {
        this.setIsActive(false);

        if ( !u.hasClass('hidden', this.helpers.darkNightDivId) ) u.addClass('hidden', this.helpers.darkNightDivId);
    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.HYDRA] = {
    label: 'hydra',

    hooks: [
        Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME
    ],

    helpers: {
      angle: 0.1 * Math.PI,
      timeOut: 250,
    },

    init: function(curve) {
        curve.hydraData = {
            previousExecution: new Date(),
        };
    },

    act: function(hook, curve) {
        var now = new Date();

        if ( now.getTime() - curve.hydraData.previousExecution.getTime() > this.helpers.timeOut ) {
            curve.hydraData.previousExecution = now;
            this.decrementCount();
            var copy = new Kurve.Curve(curve.getPlayer(), curve.getGame(), curve.getField(), Kurve.Config.Curve, curve.getSuperpower());
            curve.setImmunity([copy], 10);
            copy.setImmunity([curve], 10);
            copy.setPosition(curve.getPositionX(), curve.getPositionY());

            for ( var k in curve.getOptions() ) {
                copy.getOptions()[k] = curve.getOptions()[k];
            }

            copy.hydraData = { previousExecution: curve.hydraData.previousExecution };
            curve.getOptions().angle += this.helpers.angle / 2;
            copy.getOptions().angle -= this.helpers.angle / 2;
            curve.getGame().runningCurves[curve.getPlayer().getId()].push(copy);
        }
    },

    close: function(curve) {

    }
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.REVERSE] = {
    label: 'reverse',
    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
        otherX: undefined,
        otherY: undefined,
        otherAngle: undefined,
    },

    init: function(curve) {
        // Save initial position of each player.
        curve.reverseData = {
            otherX: curve.getPositionX(),
            otherY: curve.getPositionY(),
            otherAngle: curve.getOptions().angle + Math.PI,
        };
    },

    act: function(hook, curve) {
        if ( !this.isActive() ) {
            var otherX = curve.getPositionX();
            var otherY = curve.getPositionY();
            var otherAngle = curve.getOptions().angle;

            curve.setPosition(curve.reverseData.otherX, curve.reverseData.otherY);
            curve.getOptions().angle = curve.reverseData.otherAngle;
            curve.moveToNextFrame();
            curve.reverseData.otherX = otherX;
            curve.reverseData.otherY = otherY;
            curve.reverseData.otherAngle = otherAngle;

            curve.setImmunity([curve], 10);
            this.decrementCount();
            this.setIsActive(true);
        }

        if ( !curve.getGame().isKeyDown(curve.getPlayer().getKeySuperpower()) ) {
            this.setIsActive(false); //super power key has been released, can be used again
        }
    },

    close: function(curve) {

    },
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.SQUARE_HEAD] = {
    label: 'square head',
    hooks: [Kurve.Superpowerconfig.hooks.DRAW_NEXT_FRAME],

    helpers: {
        executionTime: 0,
        dAngleInitial: null,
        previousKeyPressed: null,
        initAct: function(curve) {
            this.helpers.dAngleInitial = curve.getOptions().dAngle;
            this.helpers.executionTime = 6 * Kurve.Game.fps;

            curve.getOptions().angle = this.helpers.getSquaredAngle(curve.getOptions().angle);
            curve.getOptions().dAngle = 0;

            this.setIsActive(true);
            this.decrementCount();
        },
        closeAct: function(curve) {
            curve.getOptions().dAngle = this.helpers.dAngleInitial;

            this.setIsActive(false);
        },
        getSquaredAngle: function(angle) {
            return (Math.PI / 2) * Math.round(angle / (Math.PI / 2));
        }
    },

    init: function(curve) {
        //set initial angle always, even if superpower is never used
        this.helpers.dAngleInitial = curve.getOptions().dAngle;
    },

    act: function(hook, curve) {
        if ( !this.isActive() ) this.helpers.initAct.call(this, curve);
        if ( this.helpers.executionTime < 1 ) return this.helpers.closeAct.call(this, curve);

        var keyPressed = null;

        if ( curve.getGame().isKeyDown(curve.getPlayer().getKeyRight()) ) {
            keyPressed = 'right';
        } else if ( curve.getGame().isKeyDown(curve.getPlayer().getKeyLeft()) ) {
            keyPressed = 'left';
        }

        //to move two times in the same direction, the key must be released in between
        if (keyPressed !== null && this.helpers.previousKeyPressed !== keyPressed) {
            curve.getOptions().dAngle = Math.PI / 2;
        } else {
            curve.getOptions().dAngle = 0;
        }

        this.helpers.previousKeyPressed = keyPressed;
        this.helpers.executionTime--;
    },

    close: function(curve) {
        this.helpers.closeAct.call(this, curve);
    },
};

Kurve.Superpowerconfig[Kurve.Superpowerconfig.types.CHUCK_NORRIS] = {
    label: 'chuck norris',
    hooks: [],
    helpers: {
        initCalled: false
    },

    init: function(curve) {
        //Chuck Norris does not need no superpower
        while (curve.getPlayer().getSuperpower().getCount() > 0) {
            this.decrementCount();
        }

        if (!this.helpers.initCalled) {
            var chuckNorrisColor = Kurve.Theming.getThemedValue('field', 'deathMatchColor');
            var styleNode = document.createElement('style');
            var style = document.createTextNode('.' + curve.getPlayer().getId() + ' { color:' + chuckNorrisColor + ' !important; border-color:' + chuckNorrisColor + ' !important; }');

            styleNode.appendChild(style);
            document.body.appendChild(styleNode);
            curve.getPlayer().setColor(chuckNorrisColor);

            this.helpers.initCalled = true;
        }
    },

    act: function(hook, curve) {

    },

    close: function(curve) {

    },
};