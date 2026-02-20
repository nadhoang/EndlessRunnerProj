class Title extends Phaser.Scene {
    constructor() {
        super('titleScene')
    }

    preload() {
        // Images
        this.load.image('pressedBtn', './assets/img/pressedbutton.png')
        this.load.image('activeBtn', './assets/img/activebutton.png')
        this.load.image('unactiveBtn', './assets/img/unactivebutton.png')
        this.load.image('background', './assets/img/background.png')

        // Sound
        this.load.audio('click', './assets/sounds/UI_Click.mp3')
        this.load.audio('hover', './assets/sounds/UI_Hover.mp3')
    }

    create() {
        this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            'background'
        )

        // Start Button (centered)
        let startButton = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            'unactiveBtn'
        )

        this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        "START",
        { fontSize: '32px', color: '#565656', fontFamily: 'sans-serif', fontStyle: 'bold'}
        ).setOrigin(0.5, 2)

        startButton.setInteractive({ pixelPerfect: true })

        // Hover effect
        startButton.on('pointerover', () => {
            startButton.setTexture('activeBtn')
            let randomPitch = Phaser.Math.FloatBetween(0.95, 1.25)
            this.sound.play('hover', { rate: randomPitch })
        })

        // Mouse leaves button
        startButton.on('pointerout', () => {
            startButton.setTexture('unactiveBtn')
        })

        // When clicked
        startButton.on('pointerdown', () => {
            startButton.setTexture('pressedBtn')
            let randomPitch = Phaser.Math.FloatBetween(0.95, 1.25)
            this.sound.play('click', { rate: randomPitch })
        })

        // When released → switch scene
        startButton.on('pointerup', () => {
        this.cameras.main.fade(300)

        this.time.delayedCall(300, () => {
        this.scene.start('playScene')
        })
    })

        // Initialize high score once
        if (this.registry.get('highScore') === undefined) {
            this.registry.set('highScore', 0)
        }

        // Display high score
        this.add.text(20, 20, 
            'High Score: ' + this.registry.get('highScore'),
            { fontSize: '28px', color: '#565656', fontStyle: 'bold', fontFamily: 'sans-serif' }
        )
    }
}