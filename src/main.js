let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    fps: { forceSetTimeOut: true, target: 60 }, //I hope its ok that i made this 60?
    width: 800,
    height: 600,
    scene: [OneDMovement]
}

const game = new Phaser.Game(config);