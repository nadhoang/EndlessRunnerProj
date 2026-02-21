// Name: Nathan Hoang
// Title: Push My Buttons
// Time Spent: 12 hours
"use strict"

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: [Title, Play]
}

const game = new Phaser.Game(config)