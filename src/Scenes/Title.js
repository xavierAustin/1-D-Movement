class TitleScreen extends Phaser.Scene {
    constructor(){
        super("title")
    }
    preload(){
        this.load.setPath("./assets/music/");
        this.load.audio("DREAD", "sephaCallCenterAtmosphere.wav");
        this.load.audio("LOVE", "sephaLove.wav");
    }
    create(){
        this.bgm = this.sound.add("LOVE",{volume: AUDIO.mstr*AUDIO.bgm});
        this.bgmAlt = this.sound.add("DREAD",{volume: AUDIO.mstr*AUDIO.bgm});
        this.bgm.play();
        this.nextTrack = 0;
        this.flashslow = 0;
        this.keyToBind = 0;
        this.backRectangle = [this.add.rectangle(400,300,780,580,0,1).setStrokeStyle(4,0xff0000,100),this.add.rectangle(400,300,780,580,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100)]
        this.titles = [
            this.add.text(400,170,"TLYT GI%QLU%IU",{fontFamily:"'HEALZONE'",fontSize:50}).setOrigin(0.5,0),
            //this.add.text(400,190,"NEON DISPLASIA",{fontFamily:"'QUINQUEFIVE'",fontSize:10}).setOrigin(0.5,0).setLetterSpacing(40),
            this.add.text(400,270,"BLOOD ORANGE",{fontFamily:"'OLDFAX'",fontSize:35}).setOrigin(0.5,0).setLetterSpacing(35)
        ]
        this.underTitles = []
        let modX = 42;
        for (let x of "NEON DISPLASIA"){
            modX += (x != "I") ? 28 : 11;
            this.titles.push(this.add.text(modX,185,x,{fontFamily:"'QUINQUEFIVE'",fontSize:10}).setOrigin(0.5,0))
            modX += (x != "I") ? 28 : 9;
        }
        for (let x of this.titles){
            x.depth = 5;
            for (let i = 1; i < 6; i++)
                this.underTitles.push(this.add.text(x.x,x.y+i,x.text,{
                    fontFamily:x.style.fontFamily,
                    color:"#f00",
                    fontSize:x.style.fontSize
                }).setOrigin(0.5,0).setLetterSpacing(x.letterSpacing))
        }
        this.input.on('pointerdown',(event) => {
            console.log(event.x,event.y);
        });
    }
    update(){
        if (ENDLESS || !this.bgm.isPlaying)
            this.bgm.detune = (Math.sin(this.flashslow))*50-100;
        if (!(this.bgm.isPlaying || this.bgmAlt.isPlaying))
            this.bgmAlt.play();
        this.flashslow = (this.flashslow + 0.01) % (Math.PI*2);
        this.backRectangle[1].alpha = (Math.sin(this.flashslow)+1)/2
        if (!(Math.floor(Math.random()*3) || this.flashslow))
            this.titles[0]
    }
}

