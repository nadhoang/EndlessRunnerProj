"use strict"

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [ Title, Play ]
}

const game = new Phaser.Game(config)