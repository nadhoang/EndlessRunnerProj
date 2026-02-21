function createGirlDialogue(scene, opts = {}) {
	const PAD = 12
	const MAX_WIDTH = 360
	const BOX_HEIGHT = 90

	const enableDialogue = opts.enableDialogue ?? true
	const enableClick = opts.enableClick ?? true
	const showHint = opts.showHint ?? true
	const lines = opts.lines ?? [
        { text: 'Click the buttons before they can hurt you.', frame: 'girlneutraltalk.png' },
        { text: 'Bullets will also be shot at you.', frame: 'girlneutraltalk.png' },
		{ text: 'Don’t let those buttons stay active!', frame: 'girlangrytalk.png' },
		{ text: 'Got it? Good.', frame: 'girlneutraltalk.png' },
        { text: '...', frame: 'girlneutraltalk.png' },
        { text: 'Stop touching me.', frame: 'girlangrytalk.png' },
        { text: 'I said stop.', frame: 'girlangrytalk.png' },
        { text: 'No.', frame: 'girlangrytalk.png' },
        { text: 'Play the game already.', frame: 'girlangrytalk.png' },
    ]

	scene.girlState = 'neutral'

	scene.girl = scene.add.sprite(0, scene.scale.height, 'girl', 'girlneutral.png')
		.setOrigin(0, 1)
		.setScrollFactor(0)
		.setDepth(1000)

	// Only interactive if you want clicking
	if (enableClick) {
		scene.girl.setInteractive(new Phaser.Geom.Rectangle(0, 0, 150, 240), Phaser.Geom.Rectangle.Contains)
	}

	// Blink (always fine)
	if (!scene.anims.exists('girl_blink')) {
		scene.anims.create({
			key: 'girl_blink',
			frames: [
				{ key: 'girl', frame: 'girlneutral.png' },
				{ key: 'girl', frame: 'girlblink.png' },
				{ key: 'girl', frame: 'girlneutral.png' }
			],
			frameRate: 12,
			repeat: 0
		})
	}

	const scheduleBlink = () => {
		scene.time.delayedCall(Phaser.Math.Between(1500, 4500), () => {
			if (scene.girlState === 'neutral') {
				scene.girl.play('girl_blink')
			}
			scheduleBlink()
		})
	}
	scheduleBlink()

	// If dialogue disabled, stop here (Play mode)
	if (!enableDialogue) return

	// --- Dialogue UI ---
	const boxX = 160
	const boxY = scene.scale.height - 140

	scene.dialogueBox = scene.add.rectangle(boxX, boxY, MAX_WIDTH, BOX_HEIGHT, 0x000000, 0.55)
		.setOrigin(0, 0)
		.setScrollFactor(0)
		.setDepth(1001)
		.setVisible(false)

	scene.dialogueText = scene.add.text(boxX + PAD, boxY + PAD, '', {
		fontFamily: 'sans-serif',
		fontSize: '20px',
		color: '#ffffff',
		wordWrap: { width: MAX_WIDTH - PAD * 2 }
	})
		.setScrollFactor(0)
		.setDepth(1002)
		.setVisible(false)

	if (showHint) {
		scene.dialogueHint = scene.add.text(20, scene.scale.height - 260, 'Click her to learn how to play', {
			fontFamily: 'sans-serif',
			fontSize: '18px',
			color: '#565656'
		})
			.setOrigin(0, 1)
			.setScrollFactor(0)
			.setDepth(1002)
	}

	scene.dialogueLines = lines
	scene.dialogueIndex = 0
	scene.dialogueTimer = null

	scene.showDialogueLine = (lineObj) => {
		scene.girlState = 'talk'
		scene.girl.setFrame(lineObj.frame)

		scene.dialogueBox.setVisible(true)
		scene.dialogueText.setVisible(true)
		scene.dialogueText.setText(lineObj.text)

		if (scene.dialogueTimer) scene.dialogueTimer.remove(false)

		scene.dialogueTimer = scene.time.delayedCall(2500, () => {
			scene.hideDialogue()
		})
	}

	scene.hideDialogue = () => {
		scene.dialogueBox.setVisible(false)
		scene.dialogueText.setVisible(false)

		scene.girlState = 'neutral'
		scene.girl.setFrame('girlneutral.png')
	}

	scene.advanceDialogue = () => {
		const line = scene.dialogueLines[scene.dialogueIndex]
		scene.dialogueIndex = (scene.dialogueIndex + 1) % scene.dialogueLines.length
		scene.showDialogueLine(line)
	}

	if (enableClick) {
		scene.girl.on('pointerdown', () => {
			if (scene.cache.audio.exists('talk')) {
				scene.sound.play('talk', {
					rate: Phaser.Math.FloatBetween(0.9, 1.1),
					volume: 0.6
				})
			}
			scene.advanceDialogue()
		})

		scene.input.on('pointerdown', (pointer, objs) => {
			if (objs && objs.includes(scene.girl)) return
			if (scene.dialogueBox.visible) scene.hideDialogue()
		})
	}
}

window.createGirlDialogue = createGirlDialogue