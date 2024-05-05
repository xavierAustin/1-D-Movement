class Shmup extends Phaser.Scene {
    constructor(){
        super("Shmup")
        this.myBullets = [];
        this.effects = [];
        this.particles = [];
        this.moveU = 0;
        this.moveD = 0;
        this.moveL = 0;
        this.moveR = 0;
        this.parry = 0;
        this.makeBullet = 0;
        this.LEVELSCORE = 0;
        this.SCOREMULT = 1;
    }
    preload(){
        this.load.setPath("./assets/visuals/");
        this.load.spritesheet("SHIPS", "simpleSpace_tiles.png",{frameWidth:32});
        this.load.spritesheet("SHIELD", "FlashElectricShield.png",{frameWidth:80});
        this.load.spritesheet("SHIELDNF", "NoFlashElectricShield.png",{frameWidth:80});
        this.load.spritesheet("EXPLODE", "BigHit.png",{frameWidth:557});
        this.load.spritesheet("HIT", "Impact.png",{frameWidth:291});
        this.load.spritesheet("SPARKS", "PowerChords.png",{frameWidth:240,frameHeight:96});
        this.load.spritesheet("BLOOD","Blood0.png",{frameWidth:128})
        this.load.spritesheet("BLOODP","Blood1.png",{frameWidth:128})
    }
    create(){
        this.player = this.make.sprite({x:100,y:300,scale:{x:2,y:2},key:"SHIPS",add:1});
        this.player.sparkEffect = this.make.sprite({scale:{x:1,y:2.5},key:"SPARKS",origin:{x:0.5,y:1},angle:-90,add:1});
        this.player.sparkEffect.anim = 0;
        this.player.health = 1;
        this.player.anim = 0;
        this.player.reserve = 0;
        this.player.shoot = 0;
        this.player.shotIncrease = 0;
        this.player.shotPower = 0;
        this.player.dead = 0;
        this.scoreboard = [this.add.rectangle(400,0,850,112,0,1)];
        this.scoreboard[0].setStrokeStyle(3,0xffffff,100);
        for (let x of this.scoreboard){
            x.depth = 10;
        }

        this.input.keyboard.on('keydown',(event) => {
            switch (event.key){
                case CONTROLCONFIG.up:
                case CONTROLCONFIG.upAlt:
                    this.moveU = 1;
                    break;
                case CONTROLCONFIG.dwn:
                case CONTROLCONFIG.dwnAlt:
                    this.moveD = 1;
                    break;
                case CONTROLCONFIG.lft:
                case CONTROLCONFIG.lftAlt:
                    this.moveL = 1;
                    break;
                case CONTROLCONFIG.rt:
                case CONTROLCONFIG.rtAlt:
                    this.moveR = 1;
                    break;
                case CONTROLCONFIG.sht:
                case CONTROLCONFIG.shtAlt:
                    this.player.shotIncrease = 1;
                    break;
                case CONTROLCONFIG.pry:
                case CONTROLCONFIG.pryAlt:
                    if (!this.parry)
                        this.parry = 60;
                    this.superParry = 1;
                    break;
            }
        });
        this.input.keyboard.on('keyup',(event) => {
            switch (event.key){
                case CONTROLCONFIG.up:
                case CONTROLCONFIG.upAlt:
                    this.moveU = 0;
                    break;
                case CONTROLCONFIG.dwn:
                case CONTROLCONFIG.dwnAlt:
                    this.moveD = 0;
                    break;
                case CONTROLCONFIG.lft:
                case CONTROLCONFIG.lftAlt:
                    this.moveL = 0;
                    break;
                case CONTROLCONFIG.rt:
                case CONTROLCONFIG.rtAlt:
                    this.moveR = 0;
                    break;
                case CONTROLCONFIG.sht:
                case CONTROLCONFIG.shtAlt:
                    this.player.shoot = 1;
                    this.player.shotIncrease = 0;
                    break;
            }
        });
    }
    update(){
        //hey wow turns out this approach does very little! lesson learned browsers running js are not traditional game engines
        //let DELTATIMESCALAR = 16;
        //let PREVTIME = this.NEWTIME;
        //this.TIMESINCEEPOCH = new Date();
        //this.NEWTIME = this.TIMESINCEEPOCH.getTime();
        //(this.NEWTIME-PREVTIME)/DELTATIMESCALAR;
        //it's fine DELTATIME is still useful for accesablility

        //handle particles
        let thisPassable = this; //coulda done this with an arrow function probably, oh well
        function create_particle(life,x,y,horizontalVel=0,verticalVel=0,horizontalAcc=0,
            verticalAcc=0,frame=61,key="SHIPS",animationSpeed=0,animationLoop=0,size=1,oppacity=1){
            let particle = {
                x:x,
                y:y,
                alpha:oppacity,
                scale:{x:size,y:size},
                key: key,
                frame: frame,
            };
            particle = thisPassable.make.sprite(particle);
            particle.hsp = horizontalVel;
            particle.vsp = verticalVel;
            particle.hac = horizontalAcc;
            particle.vac = verticalAcc;
            particle.life = life;
            particle.frameNoRound = frame;
            particle.animsp = animationSpeed*DELTATIME;
            particle.depth = -10;
            particle.animlp = animationLoop;
            thisPassable.particles.push(particle);
        }
        for (let x of this.particles){
            x.life -= 1*DELTATIME;
            if (x.life <= 0){
                x.destroy();
                this.particles.splice(this.particles.indexOf(x),1)
            }
            x.y += x.vsp*DELTATIME;
            x.x += x.hsp*DELTATIME;
            x.hsp += x.hac*DELTATIME;
            x.vsp += x.vac*DELTATIME;
            if (x.animlp)
                x.frameNoRound = (x.animsp+x.frameNoRound)%x.animlp;
            else
                x.frameNoRound += x.animsp;
            x.setFrame(Math.max(Math.floor(x.frameNoRound),0));
        }

        //handle player physics
        this.player.hsp = (this.moveR-this.moveL)*(7.5-3.5*(this.player.shotPower>10))*DELTATIME;
        this.player.vsp = (this.moveD-this.moveU)*(7.5-3.5*(this.player.shotPower>10))*DELTATIME;
        if (!this.player.dead){
            this.player.x = Math.max(Math.min(this.player.x + this.player.hsp,780),20);
            this.player.y = Math.min(Math.max(this.player.y + this.player.vsp,70+10*(this.player.health == 3)),590-10*(this.player.health == 3));
        }
        this.player.hit = 0&&!this.player.invincible&&!this.player.dead;

        //handle player parry
        if (this.superParry && this.player.hit){
            this.player.health += Math.floor;
            create_particle(11,this.player.x-10,this.player.y-5,0,0,0,0,1,"HIT",0.83,0,1.2);
            create_particle(1,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",0,0,1);
        }else if (this.parry > 50 && this.player.hit){
            this.player.hit = 0;
            this.player.health += Math.floor(this.player.reserve);
            this.player.reserve = 0;
            create_particle(11,this.player.x-10,this.player.y-5,0,0,0,0,1,"HIT",1,0,1);
        }else if (this.parry == 60){
            create_particle(11,this.player.x-10,this.player.y-5,0,0,0,0,1,"HIT",1,0,0.5);
            create_particle(2,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",0,0,0.25);
        }
        this.superParry = Math.max(this.superParry-DELTATIME,0);
        this.parry = Math.max(this.parry-DELTATIME,0);

        //handle player health
        if (this.player.reserve > 3)
            this.player.reserve = 3;
        if (this.player.health > 3)
            this.player.health = 3;
        if (this.player.hit){
            this.player.health --;
            create_particle(11,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",1,0,0.5);
        }
        if (this.player.health <= 0){
            this.corpse = this.make.sprite({add:1,frame:1,scale:{x:2,y:2},key:"SHIPS"});
            this.corpse.x = this.player.x;
            this.corpse.y = this.player.y;
            this.corpse.hsp = 35;
            this.corpse.vsp = -16;
            this.player.dead = 1;
            this.player.health = 1;
            this.player.invincible = 120;
            this.player.x = -200;
            this.player.y = 300;
            LIVES --;
        }

        //handle player death
        if (this.corpse){
            this.corpse.angle += 50*DELTATIME;
            this.corpse.x += this.corpse.hsp*DELTATIME;
            this.corpse.y += this.corpse.vsp*DELTATIME;
            this.corpse.hsp -= 2*DELTATIME;
            this.corpse.vsp += 1.5*DELTATIME;
            if(this.corpse.y>=580 || this.corpse.y<=70)
                this.corpse.vsp = -this.corpse.vsp;
            if (this.corpse.hsp <= -21 && this.corpse.alpha){
                create_particle(12,this.corpse.x+100,this.corpse.y,0,0,0,0,-2,"EXPLODE",1,0,0.5);
                create_particle(16,this.corpse.x-70,this.corpse.y-70,0,0,0,0,-6,"EXPLODE",1,0,0.5);
                create_particle(14,this.corpse.x-34,this.corpse.y+94,0,0,0,0,-4,"EXPLODE",1,0,0.5);
                create_particle(10,this.corpse.x,this.corpse.y,0,0,0,0,1,"EXPLODE",1);
                this.corpse.alpha = 0;
                this.corpse.hsp = 0;
            }
            if (LIVES && !this.corpse.alpha)
                this.player.x += ((this.corpse.hsp+240)/40)*DELTATIME
            if (this.corpse.hsp < -240){
                this.corpse.destroy();
                this.corpse = null;
                this.player.dead = !LIVES;
            }
        }

        //handle charge shot
        this.player.shotPower += this.player.shotIncrease*DELTATIME*!this.player.dead;
        let frameToDoParticle = !((Math.round(this.player.shotPower*10)%10)||(Math.floor(this.player.shotPower)%5));
        if (this.player.shotPower > 10 && this.player.shotPower < 60 && frameToDoParticle){
            //let angle = Math.floor(Math.random()*10)*Math.PI/5;
            let angle = this.player.shotPower;
            let x = Math.cos(angle);
            let y = Math.sin(angle);
            let plusX = this.player.hsp/DELTATIME;
            let plusY = this.player.vsp/DELTATIME;
            create_particle(8,this.player.x-x*80,this.player.y-y*80,x*4+plusX,y*4+plusY,x,y);
            create_particle(8,this.player.x+x*80,this.player.y+y*80,-x*4+plusX,-y*4+plusY,-x,-y);
        }else if (this.player.shotPower >= 60 && frameToDoParticle){
            let angle = Math.floor(Math.random()*10)*Math.PI/5;
            let x = Math.cos(angle);
            let y = Math.sin(angle);
            create_particle(12,this.player.x,this.player.y,-x*12,-y*12,x,y,60);
            create_particle(2,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",0,0,0.3);
        }

        //handle player bullet physics
        for (let x of this.myBullets){
            x.x += 20*DELTATIME;
            if (x.x > 800){
                x.destroy();
                this.myBullets.splice(this.myBullets.indexOf(x),1)
            }
            x.setScale((x.scaleY+4)/3); //increase scale to 2 w ease out
            x.angle += 10*DELTATIME;
            x.setFrame(Math.floor(this.player.anim/FLASHINGSPEED)+56-4*x.shotPower);
            if (x.shotPower && !(Math.round(x.angle)%10)){
                let angle = Math.floor(Math.random()*10)*Math.PI/5;
                let xP = Math.cos(angle);
                let y = Math.sin(angle);
                create_particle(12,x.x,x.y,-xP*5,-y*5);
            }else if (!(Math.round(x.angle)%10)){
                create_particle(4,x.x,x.y,0,0,0,0,57);
            }
        }

        //handle player bullet creation
        if (this.player.shoot && !this.makeBullet && !this.player.dead){
            let shotPow = (this.player.shotPower>=50)
            this.makeBullet = 5;
            this.myBullets.push(this.make.sprite({scale:{x:0,y:0},frame:52,key:"SHIPS",add:1}));
            this.myBullets[this.myBullets.length-1].y = this.player.y;
            this.myBullets[this.myBullets.length-1].x = this.player.x+20;
            this.myBullets[this.myBullets.length-1].shotPower = shotPow;
            create_particle(11-6*!shotPow,this.player.x+20,this.player.y,0,0,0,0,0,"HIT",1+!shotPow,0,0.3+0.7*shotPow);
            this.player.x = Math.max(this.player.x - 45*shotPow,20)
            this.player.shoot = 0;
            this.player.shotPower = 0;
        }

        //handle player anim
        //--sparks
        let pMeetWall = (this.player.y == 590-10*(this.player.health == 3))-(this.player.y == 70+10*(this.player.health == 3));
        this.player.angle = (this.moveD-this.moveU)*19+90+(this.parry*24)*(this.parry>30);
        //--sparks (and angle)
        this.player.sparkEffect.visible = pMeetWall;
        if (pMeetWall){
            this.player.angle = (this.moveD-this.moveU)*9+pMeetWall*13*(this.player.health != 3)+90+(this.parry*24)*(this.parry>30);
            this.player.sparkEffect.scaleY = 2+(this.moveD||this.moveU)*2-this.moveL+this.moveR;
            this.player.sparkEffect.angle = pMeetWall*24-90;
            this.player.sparkEffect.y = this.player.y+(pMeetWall)*(8+12*(this.player.health == 3));
            this.player.sparkEffect.x = this.player.x+22;
            this.player.sparkEffect.anim = (this.player.sparkEffect.anim+0.5*DELTATIME)%30;
            this.player.sparkEffect.setFrame(Math.floor(this.player.sparkEffect.anim));
        }
        //--flashing
        this.player.setFrame(Math.floor(this.player.anim/FLASHINGSPEED)+this.player.health*2-2,0);
        this.player.anim = (this.player.anim+DELTATIME)%(2*FLASHINGSPEED);

        //handle bullet cooldown
        this.makeBullet = (this.makeBullet-DELTATIME>0)*(this.makeBullet-DELTATIME)
    }
}

