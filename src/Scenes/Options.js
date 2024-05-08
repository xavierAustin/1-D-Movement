class OptionsMenu extends Phaser.Scene {
    constructor(){
        super("OptionsMenu")
    }
    preload(){
        this.load.setPath("./assets/music/");
        this.load.audio("DREAD", "sephaCallCenterAtmosphere.wav");
    }
    create(){
        //closed unit interval to string
        function cuiToStr(float){
            return "".padEnd(Math.floor(float*10),"0").padEnd(10,"`")
        }
        this.bgm = this.sound.add("DREAD",{loop: 1});
        this.bgm.play();
        this.flashslow = 0;
        this.keyToBind = 0;
        this.controls = {
            up:"MOVE UP:          ",
            upAlt:"MOVE UP (ALT):    ",
            dwn: "MOVE DOWN:        ",
            dwnAlt:"MOVE DOWN (ALT):  ",
            lft: "MOVE LEFT:        ",
            lftAlt: "MOVE LEFT (ALT):  ",
            rt: "MOVE RIGHT:       ",
            rtAlt: "MOVE RIGHT (ALT): ",
            sht: "SHOOT:            ",
            shtAlt: "SHOOT (ALT):      ",
            pry: "PARRY:            ",
            pryAlt: "PARRY (ALT):      "
        };
        this.backRectangle = [this.add.rectangle(400,320,780,530,0,1).setStrokeStyle(4,0xff0000,100),this.add.rectangle(400,320,780,530,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100)]
        this.titles = [
            this.add.text(10,10,"OPTIONS:",{fontFamily:"'OLDFAX'",fontSize:35}),
            this.add.text(25,65,"CONTROLS:",{fontFamily:"'OLDFAX'",fontSize:25}),
            this.add.text(520,65,"AUDIO:",{fontFamily:"'OLDFAX'",fontSize:25}),
            this.add.text(25,410,"ACCESSIBILITY & GAMEPLAY:",{fontFamily:"'OLDFAX'",fontSize:25})
        ]
        this.underTitles = []
        for (let x of this.titles){
            x.depth = 5;
            for (let i = 1; i < 6; i++)
                this.underTitles.push(this.add.text(x.x,x.y+i,x.text,{fontFamily:"'OLDFAX'",color:"#f00",fontSize:x.style.fontSize}))
        }
        this.buttons = {};
        this.underButtons = {};
        let y = 105;
        for (let x of Object.keys(CONTROLCONFIG)){
            let printed = (CONTROLCONFIG[x] == " ") ? "SPACE" : CONTROLCONFIG[x].toUpperCase().slice(0,8) 
            this.buttons[x] = (this.add.text(30,y,this.controls[x]+printed,{fontFamily:"'QUINQUEFIVE'",fontSize:15})).setInteractive();
            this.underButtons[x] = (this.add.text(30,y,this.buttons[x].text,{fontFamily:"'QUINQUEFIVE'",color:"#f00",fontSize:15}));
            this.buttons[x].depth = 5;
            this.buttons[x].over = 0;
            this.buttons[x].on('pointerover', () => {
                this.buttons[x].over = 1; 
            });
            this.buttons[x].on('pointerout', () => {
                this.buttons[x].over = 0; 
            });
            this.buttons[x].on('pointerdown', () => {
                if (this.keyToBind)
                    for (let x of Object.keys(CONTROLCONFIG)){
                        let printed = (CONTROLCONFIG[x] == " ") ? "SPACE" : CONTROLCONFIG[x].toUpperCase().slice(0,8)
                        this.buttons[x].setText(this.controls[x]+printed)
                        this.underButtons[x].setText(this.buttons[x].text)
                    }
                this.keyToBind = x
                this.buttons[x].setText(("PRESS KEY TO MAP "+this.controls[x].replaceAll("(ALT)","").replaceAll(":","").replaceAll("  ","")))
                this.underButtons[x].setText(this.buttons[x].text)
            });
            y += 25;
        }
        this.buttons[0] = (this.add.text(790,20,"BACK",{fontFamily:"'OLDFAX'",fontSize:24}).setOrigin(1,0)).setInteractive();
        this.buttons[1] = (this.add.text(520,410,cuiToStr(AUDIO.mstr),{fontFamily:"'QUINQUEFIVE'",fontSize:24})).setInteractive().setAngle(-90);
        this.buttons[2] = (this.add.text(615,410,cuiToStr(AUDIO.sfx),{fontFamily:"'QUINQUEFIVE'",fontSize:24})).setInteractive().setAngle(-90);
        this.buttons[3] = (this.add.text(710,410,cuiToStr(AUDIO.bgm),{fontFamily:"'QUINQUEFIVE'",fontSize:24})).setInteractive().setAngle(-90);
        this.titles.push(this.add.text(520,105,"MASTER  SFX     BGM",{fontFamily:"'QUINQUEFIVE'",fontSize:10}));
        this.titles.push(this.add.text(25,450,"GAME SPEED:",{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,475,"FLASH INTENSITY:",{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,500,"PARTICLES:",{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,525,"PARRY STRICTNESS:",{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,550,"STARTING LIVES:",{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        for (let x of Array(4).keys()){
            let origin = this.buttons[x].displayOriginX/this.buttons[x].displayWidth;
            this.buttons[x].depth = 5;
            this.underButtons[x] = (this.add.text(
                this.buttons[x].x,
                this.buttons[x].y,
                this.buttons[x].text,
                {fontFamily:this.buttons[x].style.fontFamily,color:"#f00",fontSize:this.buttons[x].style.fontSize}
            ).setOrigin(origin,0)).setAngle(this.buttons[x].angle);
            this.buttons[x].over = 0;
            this.buttons[x].on('pointerover', () => {
                this.buttons[x].over = 1; 
            });
            this.buttons[x].on('pointerout', () => {
                this.buttons[x].over = 0; 
            });
        }
        this.buttons[0].on('pointerdown', () =>{
            this.bgm.destroy()
            this.scene.start('TitleScreen');
        });
        this.input.keyboard.on('keydown',(event) => {
            if (this.keyToBind){
                let x = this.keyToBind
                if (event.key != "Escape")
                    CONTROLCONFIG[x] = (event.key).toLowerCase();
                let printed = (CONTROLCONFIG[x] == " ") ? "SPACE" : CONTROLCONFIG[x].toUpperCase().slice(0,8)
                this.buttons[x].setText(this.controls[x]+printed)
                this.underButtons[x].setText(this.buttons[x].text)
                this.keyToBind = 0;
            }
        });
    }
    update(){
        let mod = 14;
        this.flashslow = (this.flashslow + 0.01) % (Math.PI*2);
        for (let x of (Array.from(Array(4).keys())).concat(Object.keys(CONTROLCONFIG))){
            console.log(this.buttons[x])
            if (!this.buttons[x].over)
                this.buttons[x].alpha = (Math.sin(this.flashslow)+1)/3+0.001;
            else
                this.buttons[x].alpha = 1
            this.buttons[x].x += Math.sin(this.flashslow+mod)*mod/4000
            this.underButtons[x].x = this.buttons[x].x
            mod += (mod + 13)%20;
        }
        this.bgm.detune = (Math.sin(this.flashslow))*50-100
        this.bgm.volume = AUDIO.mstr*AUDIO.bgm
        this.backRectangle[1].alpha = ((Math.sin(this.flashslow)+1)/2)
    }
}

