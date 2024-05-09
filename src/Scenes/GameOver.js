class GameOver extends Phaser.Scene {
    constructor(){
        super("GameOver")
    }
    preload(){
        //sorry nothing!
    }
    create(){
        this.bgm = this.sound.add("DREAD",{volume: AUDIO.mstr*AUDIO.bgm,loop:1});
        this.bgm.play();
        this.titles = [
            this.add.text(400,300,"GAME OVER",{fontFamily:"'OLDFAX'",fontSize:35}).setOrigin(0.5).setLetterSpacing(35),
            this.add.text(400,400,((""+Math.abs(SCORE%100000000)).padStart(8,"0")).padStart(10*(SCORE<0),"-"),{fontFamily:"'OLDFAX'",fontSize:15}).setOrigin(0.5).setLetterSpacing(35)
        ]
        this.underTitles = []
        for (let x of this.titles){
            x.depth = 5;
            for (let i = 1; i < 6; i++)
                this.underTitles.push(this.add.text(x.x,x.y+i,x.text,{
                    fontFamily:x.style.fontFamily,
                    color:"#f00",
                    fontSize:x.style.fontSize
                }).setOrigin(0.5).setLetterSpacing(35))
        }
        this.fadeIn = this.add.rectangle(400,300,800,600,0xff0000,1)
        this.fadeIn.depth = 100
        this.fadeIn.alpha = 1.3;
        this.flashslow = 0;
        this.input.keyboard.on('keydown',() => {
            this.scene.start('TitleScreen');
            this.bgm.destroy()
        });
        this.input.on('pointerdown',() => {
            this.scene.start('TitleScreen');
            this.bgm.destroy()
        });
        LIVES = 3;
        HIGHSCORES.push(SCORE);
        SCORE = 0;
    }
    update(){
        this.bgm.detune = (Math.sin(this.flashslow))*50-300;
        this.flashslow = (this.flashslow + 0.01) % (Math.PI*2);
        this.changelettertimer = (this.changelettertimer + 1)%10;
        for (let x of this.titles)
            x.y += Math.sin(this.flashslow)/10;
        for (let x of this.underTitles)
            x.y += Math.sin(this.flashslow)/10;
        if (this.fadeIn){
            this.fadeIn.alpha -= 0.01
            if (this.fadeIn.depth < 0.02){
                this.fadeIn.destroy()
                this.fadeIn = 0;
            }
        }
    }
}

