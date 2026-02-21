class Title extends Phaser.Scene {
    constructor() {
        super('titleScene')
    }

    preload() {
        this.load.multiatlas('girl', './assets/img/girl.json', './assets/img/')
        // Images
        this.load.image('pressedBtn', './assets/img/inactivebuttonnew.png')
        this.load.image('activeBtn', './assets/img/activebuttonnew.png')
        this.load.image('unactiveBtn', './assets/img/startbuttonnew.png')
        this.load.image('background', './assets/img/background.png')
        this.load.image('titletext', './assets/img/titletext.png')
        this.load.image('girl_cursor', './assets/img/cursorgirlfront.png')

        // Sound
        this.load.audio('click', './assets/sounds/UI_Click.mp3')
        this.load.audio('hover', './assets/sounds/UI_Hover.mp3')
        this.load.audio('hurt', './assets/sounds/UI_Hurt.mp3')
        this.load.audio('talk', './assets/sounds/UI_Talk.mp3')
        this.load.audio('MMT', './assets/sounds/MainMenuTheme.mp3')
    }

    create() {
        // fade in
        this.cameras.main.fadeIn(400)

        // initialize girl cursor
        this.input.setDefaultCursor('none')
        this.cursorHit = this.physics.add.image(0, 0, null)
        this.cursorHit.setVisible(false)
        this.cursorHit.body.setCircle(6)          // radius
        this.cursorHit.body.setAllowGravity(false)
        this.cursorHit.body.setImmovable(true)
        this.cursorSprite = this.add.image(0, 0, 'girl_cursor').setDepth(9999)

        this.bg = this.add.tileSprite(
	    this.scale.width / 2,
	    this.scale.height / 2,
	    this.scale.width,
	    this.scale.height,
	        'background'
        ).setDepth(-100)

        createGirlDialogue(this, {
	        enableDialogue: true,
	        enableClick: true,
	        showHint: true
        })

        // title text
        this.add.image(
            this.scale.width / 2,
            (this.scale.height / 2) - 100,
            'titletext'
        )

        // background music
        if (!this.sound.get('MMT')) {
        this.titleMusic = this.sound.add('MMT', {
            loop: true,
            volume: 0.4
        })

        this.titleMusic.play()
    }

        // Start Button (centered)
        let startButton = this.add.image(
            this.scale.width / 2,
            (this.scale.height / 2) + 200,
            'unactiveBtn'
        )

        this.add.text(
        this.scale.width / 2,
        (this.scale.height / 2) + 200,
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

    // credits button
    let creditsButton = this.add.image(
        this.scale.width - 140,           // right side
        (this.scale.height / 2) + 200,    // same row as START
        'unactiveBtn'
    ).setScale(0.8)

    let creditsText = this.add.text(
        this.scale.width - 140,
        (this.scale.height / 2) + 200,
        "CREDITS",
        { fontSize: '26px', color: '#565656', fontFamily: 'sans-serif', fontStyle: 'bold' }
    ).setOrigin(0.5, 2)

    creditsButton.setInteractive({ pixelPerfect: true })

    creditsButton.on('pointerover', () => {
        creditsButton.setTexture('activeBtn')
        let randomPitch = Phaser.Math.FloatBetween(0.95, 1.25)
        this.sound.play('hover', { rate: randomPitch })
    })

    creditsButton.on('pointerout', () => {
        creditsButton.setTexture('unactiveBtn')
    })

    creditsButton.on('pointerdown', () => {
        creditsButton.setTexture('pressedBtn')
        let randomPitch = Phaser.Math.FloatBetween(0.95, 1.25)
        this.sound.play('click', { rate: randomPitch })
    })

    creditsButton.on('pointerup', () => {
        this.showCreditsOverlay()
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

    showCreditsOverlay() {
        // prevent double-open
        if (this.creditsOpen) return
        this.creditsOpen = true

        const w = this.scale.width
        const h = this.scale.height

        // dark background
        const dim = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.55).setDepth(10000)
        dim.setInteractive() // block clicks behind

        // panel
        const panelW = 520
        const panelH = 320
        const panel = this.add.rectangle(w/2, h/2, panelW, panelH, 0xffffff, 1)
            .setStrokeStyle(4, 0x565656, 1)
            .setDepth(10001)

        const title = this.add.text(w/2, h/2 - 120, "CREDITS", {
            fontSize: '20px',
            color: '#565656',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10002)

        const body = this.add.text(w/2, h/2,
    `Game by: Zerakim
    Art: Zerakim
    Music: Zerakim
    SFX: Zerakim,
    Sound Of Mouse Click 4 by
    SoundReality on Pixabay

    Thanks for playing!`, {
            fontSize: '22px',
            color: '#565656',
            fontFamily: 'sans-serif',
            align: 'center'
        }).setOrigin(0.5).setDepth(10002)

        // close button
        const closeBtn = this.add.text(w/2, h/2 + 115, "CLOSE (ESC)", {
            fontSize: '24px',
            color: '#565656',
            fontFamily: 'sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10002)
        closeBtn.setInteractive({ useHandCursor: true })

        const close = () => {
            if (!this.creditsOpen) return
            this.creditsOpen = false

            dim.destroy()
            panel.destroy()
            title.destroy()
            body.destroy()
            closeBtn.destroy()

            if (this.escCloseHandler) {
                this.input.keyboard.off('keydown-ESC', this.escCloseHandler)
                this.escCloseHandler = null
            }
        }

    closeBtn.on('pointerdown', () => {
        let randomPitch = Phaser.Math.FloatBetween(0.95, 1.25)
        this.sound.play('click', { rate: randomPitch })
        close()
    })

        // ESC to close
        this.escCloseHandler = () => close()
        this.input.keyboard.on('keydown-ESC', this.escCloseHandler)
    }

    update() {
        const p = this.input.activePointer
        this.cursorHit.setPosition(p.worldX, p.worldY)
        this.cursorSprite.setPosition(p.worldX, p.worldY)
        this.bg.tilePositionY -= 2  
    }
}