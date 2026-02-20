class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    preload() {
        this.load.image('pressedBtn', './assets/img/pressedbutton.png')
        this.load.image('activeBtn', './assets/img/activebutton.png')
        this.load.image('unactiveBtn', './assets/img/unactivebutton.png')
        this.load.image('background', './assets/img/background.png')
        this.load.audio('click', './assets/sounds/UI_Click.mp3')
    }

    create() {
        // background
        this.add.image(this.scale.width/2, this.scale.height/2, 'background')

        // state
        this.score = 0
        this.hp = 5

        // UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px' })
        this.hpText = this.add.text(20, 50, 'HP: 5', { fontSize: '24px' })

        // group for easy updating
        this.buttons = []

        // create a few buttons
        const textures = { inactive: 'unactiveBtn', hover: 'activeBtn', active: 'activeBtn', pressed: 'pressedBtn' }

        this.buttons.push(new Button(this, 200, 300, textures, { requiredClicks: 1, timeLimit: 1.5 }))
        this.buttons.push(new Button(this, 400, 300, textures, { requiredClicks: 3, timeLimit: 2.0, baseScore: 25 })) // multi-click
        this.buttons.push(new Button(this, 600, 300, textures, { requiredClicks: 1, timeLimit: 1.0, damage: 2, baseScore: 15 }))

        // activate loop (spawns “active” buttons over time)
        this.time.addEvent({
            delay: 700,
            loop: true,
            callback: () => this.activateRandomButton()
        })

        // quick controls
        this.input.keyboard.on('keydown-R', () => this.scene.restart())         // restart
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('titleScene')) // menu
    }

    update(time, delta) {
        const dt = delta / 1000
        for (const b of this.buttons) b.update(dt)
    }

    activateRandomButton() {
        // choose an inactive one
        const inactive = this.buttons.filter(b => b.state === 'inactive')
        if (inactive.length === 0) return

        const chosen = Phaser.Utils.Array.GetRandom(inactive)
        chosen.activate()
    }

    addScore(amount) {
        this.score += amount
        this.scoreText.setText('Score: ' + this.score)
    }

    takeDamage(amount) {
        this.hp -= amount
        this.hpText.setText('HP: ' + this.hp)

        if (this.hp <= 0) {

            // save last run score
            this.registry.set('lastScore', this.score)

            // update high score
            let high = this.registry.get('highScore') ?? 0
            if (this.score > high) this.registry.set('highScore', this.score)

            this.scene.start('titleScene')
        }
    }
}