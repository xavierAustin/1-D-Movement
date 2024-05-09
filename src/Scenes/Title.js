class TitleScreen extends Phaser.Scene {
    constructor(){
        super("TitleScreen")
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
        this.changelettertimer = 0;
        this.backRectangle = [
            this.add.rectangle(400,300,780,580,0,1).setStrokeStyle(4,0xff0000,100),
            this.add.rectangle(400,300,780,580,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100),
            this.add.rectangle(400,468,200,180,0,1).setStrokeStyle(4,0xff0000,100),
            this.add.rectangle(400,468,200,180,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100)
        ]
        this.titles = [
            this.add.text(400,180,"TLYT GI%QZU%IU",{fontFamily:"'HEALZONE'",fontSize:50}).setOrigin(0.5,0),
            this.add.text(400,280,"BLOOD ORANGE",{fontFamily:"'OLDFAX'",fontSize:35}).setOrigin(0.5,0).setLetterSpacing(35)
        ]
        this.underTitles = []
        let modX = 42;
        for (let x of "NEON DISPLASIA"){
            modX += (x != "I") ? 28 : 11;
            this.titles.push(this.add.text(modX,195,x,{fontFamily:"'QUINQUEFIVE'",fontSize:10}).setOrigin(0.5,0))
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
        this.fadeIn = this.add.rectangle(400,300,800,600,0,1)
        this.fadeIn.depth = 100
        this.fadeIn.alpha = 1.3;
        this.buttons = [
            this.add.text(400,400,"BEGIN",{fontFamily:"'OLDFAX'",fontSize:20}).setOrigin(0.5,0).setInteractive(),
            this.add.text(400,430,"OPTIONS",{fontFamily:"'OLDFAX'",fontSize:20}).setOrigin(0.5,0).setInteractive(),
            this.add.text(400,460,"HIGHSCORES",{fontFamily:"'OLDFAX'",fontSize:20}).setOrigin(0.5,0).setInteractive(),
            this.add.text(400,490,"CREDITS",{fontFamily:"'OLDFAX'",fontSize:20}).setOrigin(0.5,0).setInteractive(),
            this.add.text(400,520,"EXIT",{fontFamily:"'OLDFAX'",fontSize:20}).setOrigin(0.5,0).setInteractive()
        ];
        this.underButtons = [];
        for (let x of this.buttons){
            this.underButtons.push(this.add.text(400,x.y,x.text,{fontFamily:"'OLDFAX'",fontSize:20,color:"#f00"}).setOrigin(0.5,0))
            x.depth = 5
            x.on('pointerover', () => {
                x.over = 1; 
            });
            x.on('pointerout', () => {
                x.over = 0; 
            });
        }
        this.buttons[0].on('pointerdown', () => {
            this.scene.start('Shmup');
            this.bgmAlt.destroy();
            this.bgm.destroy();
        });
        this.buttons[1].on('pointerdown', () => {
            this.scene.start('OptionsMenu');
            this.bgmAlt.destroy();
            this.bgm.destroy();
        });
        this.buttons[2].on('pointerdown', () => {
            this.buttons[2].text = "WIP";
            this.underButtons[2].text = "WIP";
        });
        this.buttons[3].on('pointerdown', () => {
            this.buttons[3].text = "WIP";
            this.underButtons[3].text = "WIP";
        });
        this.buttons[4].on('pointerdown', () => {
            this.buttons[4].text = "You can't.";
            this.underButtons[4].text = "You can't.";
        });
    }
    update(){
        if (ENDLESS)
            this.bgm.detune = (Math.sin(this.flashslow))*50-100;
        if (!(this.bgm.isPlaying || this.bgmAlt.isPlaying))
            this.bgmAlt.play();
        this.bgmAlt.detune = (Math.sin(this.flashslow))*50-100;
        this.flashslow = (this.flashslow + 0.01) % (Math.PI*2);
        this.backRectangle[1].alpha = (Math.sin(this.flashslow)+1)/2;
        this.backRectangle[3].alpha = (Math.sin(this.flashslow)+1)/2;
        this.changelettertimer = (this.changelettertimer + 1)%10;
        if (!this.changelettertimer){
            this.buttons[4].text = "EXIT";
            this.underButtons[4].text = "EXIT";
            this.titles[0].text = "TLYT GI%QZU%IU";
            for (let i = 0; i < 5; i++)
                this.underTitles[i].text = this.titles[0].text;
        }
        if (!Math.floor(Math.random()*10) && !this.changelettertimer){
            let charToReplace = ["T","L","Y","G","%","Q","Z","U"].sort(function(){return 0.5-Math.random()});
            let randomChar = ["A","R","Q","P","H","L","Z","@"].sort(function(){return 0.5-Math.random()});
            this.titles[0].text = "TLYT GI%QZU%IU".replace(charToReplace[0],randomChar[0]);
            for (let i = 0; i < 5; i++)
                this.underTitles[i].text = this.titles[0].text;
        }
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
        for (let x of this.buttons){
            if (!x.over)
                x.alpha = (Math.sin(this.flashslow)+1)/3+0.001;
            else
                x.alpha = 1;
        }
    }
}

