class Button extends Phaser.GameObjects.Image {
    constructor(scene, x, y, textures, opts = {}) {
        super(scene, x, y, textures.inactive)

        this.scene = scene
        this.texturesMap = textures

        // mechanics
        this.state = 'inactive'
        this.timeActive = 0
        this.setTint(0x444444)

        // danger pulse
        this.pulsing = false
        this.pulseTween = null

        this.timeLimit = opts.timeLimit ?? 1.5      // seconds before damage
        this.damage = opts.damage ?? 1
        this.baseScore = opts.baseScore ?? 10

        this.requiredClicks = opts.requiredClicks ?? 1
        this.clicksRemaining = this.requiredClicks

        // add + enable interaction
        scene.add.existing(this)

        // circle sized to visible button
        const w = this.width
        const h = this.height
        const cx = w / 2
        const cy = h / 2
        const r  = Math.min(w, h) * (opts.hitRadiusRatio ?? 0.33)       // tweak ratio

        this.setInteractive(new Phaser.Geom.Circle(cx, cy, r), Phaser.Geom.Circle.Contains)

        // pointer events
        this.on('pointerover', () => {
            if (this.state === 'inactive') this.setTexture(this.texturesMap.hover)
        })

        this.on('pointerout', () => {
            if (this.state === 'inactive') this.setTexture(this.texturesMap.inactive)
        })

        this.on('pointerdown', () => {
            if (this.state === 'active') {
            this.handleClick()
        } else {
            // click feedback even when inactive
            this.setTexture(this.texturesMap.pressed)
            }
        })

        this.on('pointerup', () => {
            if (this.state === 'inactive') this.setTexture(this.texturesMap.inactive)
        })
    }

    activate() {
        this.state = 'active'
        this.timeActive = 0
        this.clicksRemaining = this.requiredClicks

        this.setScale(0.9)
        this.scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 120,
            ease: 'Back.Out'
        })

        this.setTexture(this.texturesMap.active)
        this.clearTint()

        // Enable interaction ONLY when active
        this.setInteractive(
            new Phaser.Geom.Circle(this.width/2, this.height/2, 45),
            Phaser.Geom.Circle.Contains
        )
    }

    deactivate() {
        this.state = 'inactive'
        this.timeActive = 0

        this.setTexture(this.texturesMap.pressed)
        this.setTint(0x444444)

        if (this.pulseTween) {
            this.pulseTween.stop()
            this.pulseTween = null
        }

        this.setScale(1)
        this.pulsing = false

        // Completely disable input
        this.disableInteractive()
    }

    handleClick() {
        // click sound
        this.scene.sound?.play?.('click', { rate: 1.0 })

        this.clicksRemaining -= 1

        // small visual feedback
        this.setTexture(this.texturesMap.pressed)

        if (this.clicksRemaining <= 0) {
            // scoring hook
            this.scene.addScore(this.baseScore)
            this.deactivate()
        } else {
            // still active, return to active texture quickly
            this.scene.time.delayedCall(60, () => {
            if (this.state === 'active') this.setTexture(this.texturesMap.active)
        })
        }
    }

    update(dtSeconds) {
        if (this.state !== 'active') return

        this.timeActive += dtSeconds

        const t = Phaser.Math.Clamp(this.timeActive / this.timeLimit, 0, 1)

        // Start pulse at 50%
        if (t > 0.5) {

        // Start pulse once
        if (!this.pulsing) {
            this.pulsing = true

            this.pulseTween = this.scene.tweens.add({
                targets: this,
                scale: 1.12,
                angle: 2,
                yoyo: true,
                repeat: -1,
                duration: 180
            })
        }

        // Speed up as it gets closer to damage
        if (this.pulseTween) {
            this.pulseTween.timeScale = Phaser.Math.Linear(1, 3, (t - 0.5) / 0.3)
        }
    }

        if (this.timeActive >= this.timeLimit) {
            // damage hook
            this.scene.takeDamage(this.damage)
            this.deactivate()
        }
    }
}