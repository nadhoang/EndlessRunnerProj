class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    preload() {
        this.load.multiatlas('girl', './assets/img/girl.json', './assets/img/')
        this.load.image('pressedBtn', './assets/img/pressedbutton.png')
        this.load.image('activeBtn', './assets/img/activebuttonnew.png')
        this.load.image('unactiveBtn', './assets/img/inactivebuttonnew.png')
        this.load.image('background', './assets/img/background.png')
        this.load.image('girl_cursor', './assets/img/cursorgirlfront.png')
        this.load.image('bullet', './assets/img/bullet.png')
        this.load.audio('click', './assets/sounds/UI_Click.mp3')
        this.load.audio('hover', './assets/sounds/UI_Hover.mp3')
        this.load.audio('hurt', './assets/sounds/UI_Hurt.mp3')
        this.load.audio('talk', './assets/sounds/UI_Talk.mp3')
    }

    getScoreMultiplier() {
        const t = this.getDifficulty01()
        const eased = t * t   // smooth ramp

        // Early game = 1x
        // Late game = 2.5x (tweakable)
        return Phaser.Math.Linear(1.0, 2.5, eased)
    }

    getDifficulty01() {
        const S = this.score
        const ramp = 300 // bigger = slower ramp
        return Phaser.Math.Clamp(S / (S + ramp), 0, 1)
    }

    getDifficulty() {
        const t = this.getDifficulty01()
        const eased = t * t // gentle early, harder later

        return {
            bulletDelay: Phaser.Math.Linear(650, 180, eased),        // ms
            bulletSpeed: Phaser.Math.Linear(120, 330, eased),        // px/s
            buttonDelay: Phaser.Math.Linear(1400, 420, eased),       // ms
            timeLimitScale: Phaser.Math.Linear(1.25, 0.55, eased),   // seconds multiplier
            maxActiveButtons: Math.round(Phaser.Math.Linear(1, 4, eased))
        }
    }

    create() {
        // fade in
        this.cameras.main.fadeIn(400)

        this.invuln = 0

        // initialize girl cursor
        const HIT_R = 6

        this.input.setDefaultCursor('none')

        this.cursorHit = this.add.rectangle(0, 0, HIT_R * 2, HIT_R * 2, 0xff0000, 0)
        this.physics.add.existing(this.cursorHit)

        this.cursorHit.body.setAllowGravity(false)
        this.cursorHit.body.setImmovable(true)
        this.cursorHit.body.setCircle(HIT_R)

        this.cursorSprite = this.add.image(0, 0, 'girl_cursor').setDepth(1)
        this.cursorRing = this.add.graphics().setDepth(10000)

        this.HIT_R = HIT_R

        // background
        this.bg = this.add.tileSprite(
	    this.scale.width / 2,
	    this.scale.height / 2,
	    this.scale.width,
	    this.scale.height,
	        'background'
        ).setDepth(-100)

        createGirlDialogue(this, {
            enableDialogue: false,
            enableClick: false
        })

        // state
        this.score = 0
        this.hp = 5

        // UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '28px', color: '#565656', fontStyle: 'bold', fontFamily: 'sans-serif' })
        this.hpText = this.add.text(20, 50, 'HP: 5', { fontSize: '28px', color: '#565656', fontStyle: 'bold', fontFamily: 'sans-serif' })

        // group for easy updating
        this.buttons = []

        // create a few buttons
        const textures = { inactive: 'pressedBtn', hover: 'activeBtn', active: 'activeBtn', pressed: 'pressedBtn' }

        this.buttons.push(new Button(this, 200, 100, textures, { requiredClicks: 1, timeLimit: 10.0 }))
        this.buttons.push(new Button(this, 400, 100, textures, { requiredClicks: 1, timeLimit: 10.0, baseScore: 10 }))
        this.buttons.push(new Button(this, 600, 100, textures, { requiredClicks: 1, timeLimit: 10.0, damage: 1, baseScore: 10 }))

        this.buttons.push(new Button(this, 200, 300, textures, { requiredClicks: 1, timeLimit: 10.0 }))
        this.buttons.push(new Button(this, 400, 300, textures, { requiredClicks: 1, timeLimit: 10.0, baseScore: 10 }))
        this.buttons.push(new Button(this, 600, 300, textures, { requiredClicks: 1, timeLimit: 10.0, damage: 1, baseScore: 10 }))

        this.buttons.push(new Button(this, 200, 500, textures, { requiredClicks: 1, timeLimit: 10.0 }))
        this.buttons.push(new Button(this, 400, 500, textures, { requiredClicks: 1, timeLimit: 10.0, baseScore: 10 }))
        this.buttons.push(new Button(this, 600, 500, textures, { requiredClicks: 1, timeLimit: 10.0, damage: 1, baseScore: 10 }))

        // activate loop (spawns “active” buttons over time)
        this.activateEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.activateRandomButton()
        })
        
        // bullet collisions
        this.bullets = this.physics.add.group({
            maxSize: 400,
            collideWorldBounds: false,
            allowGravity: false
        })

        this.physics.add.overlap(this.cursorHit, this.bullets, (cursor, bullet) => {
            // if currently invulnerable, ignore
            if (this.invuln > 0) return

            // turn on brief i-frames
            this.invuln = 250

            // recycle bullet IMMEDIATELY + disable its body so it can't overlap again
            bullet.setActive(false).setVisible(false)
            bullet.body.enable = false
            bullet.body.stop()

            this.takeDamage(1)
        })
        // bullets loop
        this.bulletEvent = this.time.addEvent({
            delay: 240,
            loop: true,
            callback: () => this.spawnBullet()
        })
        
        // quick controls
        this.input.keyboard.on('keydown-R', () => this.scene.restart())         // restart
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('titleScene')) // menu
    }

    spawnBullet() {
        const corners = [
            { x: 0, y: 0 },
            { x: this.scale.width, y: 0 },
            { x: 0, y: this.scale.height },
            { x: this.scale.width, y: this.scale.height }
        ]
        const c = Phaser.Utils.Array.GetRandom(corners)

        // get a dead bullet from pool or create a new one
        let b = this.bullets.get(c.x, c.y)

        if (!b) return // pool exhausted

        b.setActive(true).setVisible(true)
        b.setTexture('bullet').setDepth(1)

        const BR = 3;
        
        b.body.enable = true
        b.body.reset(c.x, c.y)
        b.body.setCircle(BR, (b.width / 2) - BR, (b.height / 2) - BR)
        b.body.setAllowGravity(false)

        const p = this.input.activePointer
        const angle = Phaser.Math.Angle.Between(c.x, c.y, p.worldX, p.worldY)

        const { bulletSpeed } = this.getDifficulty()
        const speed = bulletSpeed
        b.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)

        // store lifespawn for recycle
        b.lifespan = 15000 // ms
    }

    update(time, delta) {
        const dt = delta / 1000
        for (const b of this.buttons) b.update(dt)
        this.bg.tilePositionY -= 2

        // difficulty ramp timer
        const diff = this.getDifficulty()
        if (this.bulletEvent) this.bulletEvent.delay = diff.bulletDelay
        if (this.activateEvent) this.activateEvent.delay = diff.buttonDelay

        // update invuln timer
        this.invuln = Math.max(0, this.invuln - delta)
        
        // cursor sprite follow
        const p = this.input.activePointer
        this.cursorHit.setPosition(p.worldX, p.worldY)
        this.cursorSprite.setPosition(p.worldX, p.worldY)
        this.cursorRing.clear()
        this.cursorRing.lineStyle(4, 0xffffff, 0.8)
        this.cursorRing.strokeCircle(p.worldX, p.worldY, this.HIT_R)

        // recycle bullets
        this.bullets.children.iterate((b) => {
        if (!b || !b.active) return

        b.lifespan -= delta
        if (
            b.lifespan <= 0 ||
            b.x < -60 || b.x > this.scale.width + 60 ||
            b.y < -60 || b.y > this.scale.height + 60
            ) {
                b.setActive(false)
                b.setVisible(false)
                b.body.stop()
            }
        })
    }

    activateRandomButton() {
        const diff = this.getDifficulty()

        // cap how many can be active at once (pressure increases with score)
        const activeCount = this.buttons.filter(b => b.state === 'active').length
        if (activeCount >= diff.maxActiveButtons) return

        const inactive = this.buttons.filter(b => b.state === 'inactive')
        if (inactive.length === 0) return

        const chosen = Phaser.Utils.Array.GetRandom(inactive)

        // scale how long the player has before damage
        chosen.setTimeLimitScaled(diff.timeLimitScale)

        chosen.activate()
    }

        

    addScore(amount) {
        this.score += amount
        this.scoreText.setText('Score: ' + this.score)
    }

    takeDamage(amount) {
        this.hp -= amount
        this.hpText.setText('HP: ' + this.hp)

        this.cameras.main.flash(100, 255, 155, 155)
        this.cameras.main.shake(150, 0.01)
        let randomPitch = Phaser.Math.FloatBetween(0.95, 1.25)
        this.sound.play('hurt', { rate: randomPitch })

        // Change expression to hurt
        this.girlState = 'hurt'
        this.girl.setFrame('girlhurt.png')

        // Return to neutral after 300ms
        this.time.delayedCall(300, () => {
	        if (this.girl.active) {
		        this.girlState = 'neutral'
		        this.girl.setFrame('girlneutral.png')
	        }
        })

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