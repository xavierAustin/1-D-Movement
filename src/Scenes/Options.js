class OptionsMenu extends Phaser.Scene {
    constructor(){
        super("OptionsMenu")
    }
    preload(){
        this.load.setPath("./assets/music/");
        this.load.audio("DREAD", "sephaCallCenterAtmosphere.wav");
    }
    create(){
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
        this.rectangles = [
            this.add.rectangle(10,585,780,530,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100).setOrigin(0,1),
        ];
        for (let i = 535; i <= 725 ; i+=95)
            this.rectangles.push(this.add.rectangle(i,410,30,280,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100).setOrigin(0,1).setInteractive());
        for (let i = 465; i <= 565 ; i+=25)
            this.rectangles.push(this.add.rectangle(440,i,335,15,0,1).setFillStyle(0,0).setStrokeStyle(4,0xffffff,100).setOrigin(0,1).setInteractive());
        this.underRectangles = [];
        let valuesToUse = [
            AUDIO.mstr,
            AUDIO.sfx,
            AUDIO.bgm,
            DELTATIME,
            (14-FLASHINGSPEED)/10,
            PARTICLES,
            (PARRYWINDOW+5)/20,
            (LIVES)/10
        ]
        for (let x of this.rectangles){
            let scalar = [1,1]
            x.depth = 5;
            x.over = 0;
            x.event = null;
            if(this.rectangles.indexOf(x)){
                scalar[1*(this.rectangles.indexOf(x)<4)] = valuesToUse[this.rectangles.indexOf(x)-1]
                this.underRectangles.push(this.add.rectangle(x.x,x.y,x.width,x.height,0xff0000,1).setOrigin(0,1));
                x.on('pointerover', () => {
                    x.over = 1; 
                });
                x.on('pointerout', () => {
                    x.over = 0;
                    x.event = null;
                });
                x.on('pointerup', () => {
                    x.event = null;
                });
                x.on('pointerdown', (event) => {
                    x.event = event
                });
            }
            this.underRectangles.push(this.add.rectangle(x.x,x.y,x.width*scalar[0],x.height*scalar[1],0,1).setStrokeStyle(4,0xff0000,100).setOrigin(0,1));
            x.width*=scalar[0];
            x.height*=scalar[1];
            if (this.rectangles.indexOf(x)<4){
                x.setOrigin(1,0);
                x.angle = 180;
                this.underRectangles[this.rectangles.indexOf(x)*2].setOrigin(1,0);
                this.underRectangles[this.rectangles.indexOf(x)*2].angle = 180;
            }
        }
        this.titles = [
            this.add.text(10,10,"OPTIONS:",{fontFamily:"'OLDFAX'",fontSize:35}),
            this.add.text(25,65,"CONTROLS:",{fontFamily:"'OLDFAX'",fontSize:25}),
            this.add.text(520,65,"AUDIO:",{fontFamily:"'OLDFAX'",fontSize:25}),
            this.add.text(25,410,"ACCESSIBILITY & GAMEPLAY:",{fontFamily:"'OLDFAX'",fontSize:25})
        ];
        this.underTitles = []
        for (let x of this.titles){
            x.depth = 5;
            for (let i = 1; i < 6; i++)
                this.underTitles.push(this.add.text(x.x,x.y+i,x.text,{fontFamily:"'OLDFAX'",color:"#f00",fontSize:x.style.fontSize}))
        }
        this.buttons = {};
        this.underButtons = {};
        let y = 105;
        for (let x of (Object.keys(CONTROLCONFIG)).concat([0])){
            if (x){
                let printed = (CONTROLCONFIG[x] == " ") ? "SPACE" : CONTROLCONFIG[x].toUpperCase().slice(0,8) 
                this.buttons[x] = (this.add.text(30,y,this.controls[x]+printed,{fontFamily:"'QUINQUEFIVE'",fontSize:15})).setInteractive();
                this.underButtons[x] = (this.add.text(30,y,this.buttons[x].text,{fontFamily:"'QUINQUEFIVE'",color:"#f00",fontSize:15}));
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
            }else{
                this.buttons[0] = (this.add.text(790,20,"BACK",{fontFamily:"'OLDFAX'",fontSize:24}).setOrigin(1,0)).setInteractive();
                this.underButtons[x] = (this.add.text(790,20,"BACK",{fontFamily:"'OLDFAX'",color:"#f00",fontSize:24}).setOrigin(1,0));
            }
            this.buttons[x].depth = 5;
            this.buttons[x].over = 0;
            this.buttons[x].on('pointerover', () => {
                this.buttons[x].over = 1; 
            });
            this.buttons[x].on('pointerout', () => {
                this.buttons[x].over = 0; 
            });
            y += 25;
        }
        this.titles.push(this.add.text(520,105,"MASTR    SFX     BGM",{fontFamily:"'QUINQUEFIVE'",fontSize:10}));
        this.titles.push(this.add.text(25,450,"GAME SPEED:"+((DELTATIME*100)+"%").padStart(11," "),{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,475,"FLASH INTENSITY:"+(((14-FLASHINGSPEED)*10)+"%").padStart(6," "),{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,500,"PARTICLES:"+((PARTICLES*100)+"%").padStart(12," "),{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,525,"PARRY STRICTNESS:"+((PARRYWINDOW+5)+"f").padStart(5," "),{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
        this.titles.push(this.add.text(25,550,"STARTING LIVES:"+(LIVES+" ").padStart(7," "),{fontFamily:"'QUINQUEFIVE'",fontSize:15}));
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
        let mod = 0;
        this.flashslow = (this.flashslow + 0.01) % (Math.PI*2);
        for (let x of ([0]).concat(Object.keys(CONTROLCONFIG))){
            this.buttons[x].alpha = (Math.sin(this.flashslow*3)+1)/3+0.001+this.buttons[x].over;
            mod = (mod + 47)%30+1;
            this.buttons[x].x += Math.sin(this.flashslow+mod)*mod/500
            this.underButtons[x].x = this.buttons[x].x
            
        }
        this.bgm.detune = (Math.sin(this.flashslow))*50-100
        this.bgm.volume = AUDIO.mstr*AUDIO.bgm
        for (let x of this.rectangles){
            if (this.rectangles.indexOf(x)){
                x.alpha = (Math.sin(this.flashslow*3)+1)/3+0.001+x.over;
                if (x.over && x.event && x.angle){
                    x.height = -(x.event.y-410);
                    this.underRectangles[this.rectangles.indexOf(x)*2].height = x.height;
                    if (x.x == 535)
                        AUDIO.mstr = x.height/280;
                    else if (x.x == 725)
                        AUDIO.bgm = x.height/280;
                    else
                        AUDIO.sfx = x.height/280;
                }else if (x.over && x.event){
                    x.width = Math.round((x.event.x-440)/33.5)*33.5;
                    switch (x.y){
                        case 465:
                            x.width = Math.max(x.width,33.5)
                            DELTATIME = Math.floor((x.width/335)*10)/10;
                            this.titles[5].text = "GAME SPEED:"+((DELTATIME*100)+"%").padStart(11," ");
                            break;
                        case 490:
                            x.width = Math.max(x.width,33.5)
                            FLASHINGSPEED = 14-Math.floor((x.width/335)*10);
                            this.titles[6].text = "FLASH INTENSITY:"+(((14-FLASHINGSPEED)*10)+"%").padStart(6," ");
                            break;
                        case 515:
                            PARTICLES = x.width/335;
                            this.titles[7].text = "PARTICLES:"+((PARTICLES*100)+"%").padStart(12," ");
                            break;
                        case 540:
                            PARRYWINDOW = Math.floor((x.width/335)*20)-5;
                            this.titles[8].text = "PARRY STRICTNESS:"+((PARRYWINDOW+5)+"f").padStart(5," ");
                            break;
                        case 565:
                            x.width = Math.max(x.width,33.5)
                            LIVES = Math.floor((x.width/335)*10);
                            this.titles[9].text = "STARTING LIVES:"+(LIVES+" ").padStart(7," ");
                            break;
                        default:
                            break;
                    }
                    this.underRectangles[this.rectangles.indexOf(x)*2].width = x.width;
                }
            }else
                x.alpha = ((Math.sin(this.flashslow)+1)/2)
            
        }
    }
}

