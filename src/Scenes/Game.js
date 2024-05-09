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
        this.superParry = 0;
        this.cantSuperParry = 0;
        this.makeBullet = 0;
        this.LEVELSCORE = 0;
        this.SCOREMULT = 1;
    }
    preload(){
        this.load.setPath("./assets/music/");
        this.load.audio("FLIGHT", "theGauntletAndTheDragon.wav");
        this.load.setPath("./assets/visuals/");
        this.load.spritesheet("SHIPS", "simpleSpace_tiles.png",{frameWidth:32});
        this.load.spritesheet("SHIELD", "ElectricShield.png",{frameWidth:80});
        this.load.spritesheet("EXPLODE", "BigHit.png",{frameWidth:557});
        this.load.spritesheet("HIT", "Impact.png",{frameWidth:291});
        this.load.spritesheet("BACKDROP", "HyperSpeed.png",{frameWidth:517,frameHeight:515});
        this.load.spritesheet("SPARKS", "PowerChords.png",{frameWidth:240,frameHeight:96});
        this.load.spritesheet("BLOOD","Blood0.png",{frameWidth:128})
        this.load.spritesheet("BLOODP","Blood1.png",{frameWidth:128})
        //loadFont("OLDFAX", "assets/visuals/OLDFAX.ttf");
    }
    create(){
        if (!BGMACROSSLEVELS)
            BGMACROSSLEVELS = this.sound.add("FLIGHT",{loop: 1,volume:AUDIO.mstr*AUDIO.bgm});
        if ((!BGMACROSSLEVELS.isPlaying))
            BGMACROSSLEVELS.play();
        //i could set the depth of this a little lower but i like the way it looks so im keeping it
        this.backdrop = this.make.sprite({x:400,y:350,scale:{x:2,y:1.4},key:"BACKDROP",add:1,alpha:0.3});
        this.backdrop.currentframe = 0;
        this.backdrop.depth = -20;
        this.player = this.make.sprite({x:100,y:350,scale:{x:2,y:2},key:"SHIPS",add:1});
        this.player.sparkEffect = this.make.sprite({scale:{x:1,y:2.5},key:"SPARKS",origin:{x:0.5,y:1},angle:-90,add:1});
        this.player.sparkEffect.alpha = PARTICLES;
        this.player.sparkEffect.anim = 0;
        this.player.sparkEffect.depth = 11;
        this.player.health = 1;
        this.player.anim = 0;
        this.player.reserve = 0;
        this.player.shoot = 0;
        this.player.shotIncrease = 0;
        this.player.shotPower = 0;
        this.player.dead = 0;
        this.player.depth = 10;
        this.player.hit = 0;
        this.player.invincible = 0;
        this.player.inNoSpin = 0;
        this.scoreboard = [
            this.add.rectangle(400,0,850,112,0,1),
            this.add.text(25,25,"LEVEL 00 SCORE 00000000",{fontFamily:"'OLDFAX'",fontSize:25}).setOrigin(0,0.5),
            this.add.text(775,25,"RESERVE 0.00 LIVES 00",{fontFamily:"'OLDFAX'",fontSize:25}).setOrigin(1,0.5)
        ];
        for (let x of this.scoreboard){
            x.depth = 20;
        }
        this.enemies = [];
        this.enemyBullet = [];
        this.boundToEnemies = [];
        this.waves = 0;
        //[250,"stop",150,350,"stop",100,"delay",200,"delay","flip",500,600,"stop","flip","delay",350,200,"flip",500,"end"];

        this.input.keyboard.on('keydown',(event) => {
            switch ((event.key).toLowerCase()){
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
                    this.superParry = 1&&(!this.cantSuperParry);
                    this.cantSuperParry = 1;
                    break;
                case "escape":
                    this.scene.start('TitleScreen');
                    BGMACROSSLEVELS.destroy();
                    break;
            }
        });
        this.input.keyboard.on('keyup',(event) => {
            switch ((event.key).toLowerCase()){
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
                case CONTROLCONFIG.pry:
                case CONTROLCONFIG.pryAlt:
                    this.cantSuperParry = 0;
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
            if (!PARTICLES)
                return;
            let particle = {
                x:x,
                y:y,
                alpha:oppacity*PARTICLES,
                scale:{x:size,y:size},
                key: key,
                frame: Math.max(frame,0),
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

        //handle enemies
        function create_enemy(y,entrancePath="sine",follows=0,flip=0,superFlip=0){
            let newEnemy = {
                x:1200*!superFlip-200,
                y:y+Math.abs(PATHS[entrancePath][1]-600*flip),
                scale:{x:2,y:2},
                frame:28,
                key:"SHIPS",
                add:1,
                angle:-90
            };
            //why not use thisPassable since i have it already
            newEnemy = thisPassable.make.sprite(newEnemy);
            newEnemy.yDisplacement = y;
            newEnemy.pointInSeq = 0;
            newEnemy.stun = 0;
            newEnemy.follows = follows;
            newEnemy.flip = flip;
            newEnemy.superFlip = superFlip;
            newEnemy.timeToFlee = 1200; //20 seconds
            newEnemy.attacking = -Math.floor(Math.random()*150);
            newEnemy.fedUp = 0;
            newEnemy.health = 3;
            newEnemy.depth = 5;
            newEnemy.type = entrancePath;
            newEnemy.idlePos = [0,0];
            newEnemy.fleePos = Math.random()*500+100
            thisPassable.enemies.push(newEnemy);
        }
        function enemy_pathing(x,targetPoint=[800,350],perfect=0){
            let angleToTP = (x.angle+(Math.atan2(x.x-targetPoint[0],x.y-targetPoint[1])*180/Math.PI));
            angleToTP += -360*(angleToTP>180)+360*(angleToTP<-180)
            if (perfect >= 2)
                x.angle -= angleToTP;
            else if (perfect)
                x.angle -= angleToTP*DELTATIME/4;
            else if (Math.abs(angleToTP)>10)
                x.angle -= 5*Math.sign(angleToTP)*DELTATIME;
            x.x += Math.sin(x.angle*Math.PI/180)*(180-angleToTP)*DELTATIME/25;
            x.y -= Math.cos(x.angle*Math.PI/180)*(180-angleToTP)*DELTATIME/25;
        }
        for (let x of this.enemies){
            //--flashing
            x.setFrame(Math.floor(this.player.anim/FLASHINGSPEED)+28);

            //--bullet collision
            //there are at max 7~ of these in existance so this shouldn't be all that time consuming
            for (let y of this.myBullets){
                //enemy ships are roughly 48 pixels large in game so might as well save some calculation time (shouldn't matter too much though)
                //48/2 == 28 i promise
                let lowestDist = 28+y.shotPower*24
                if ((Math.abs(x.x-y.x) > lowestDist) || (Math.abs(x.y-y.y) > lowestDist))
                    continue;
                let bulletY = y.y;
                if (y.shotPower){
                    y.shotPower --;
                    x.health = 0;
                }else{
                    y.destroy();
                    this.myBullets.splice(this.myBullets.indexOf(y),1);
                    x.health --;
                }
                if (!x.health){
                    create_particle(12,x.x-100,x.y,0,0,0,0,-2,"EXPLODE",1,0,0.25);
                    create_particle(16,x.x+70,x.y-70,0,0,0,0,-6,"EXPLODE",1,0,0.25);
                    create_particle(14,x.x+34,x.y+94,0,0,0,0,-4,"EXPLODE",1,0,0.25);
                    create_particle(10,x.x,x.y,0,0,0,0,1,"EXPLODE",0.5); 
                    //oh yeah i should mention this is a 1 sized explosion that plays at half speed
                    //it's not a 0.5 sized explosion and isn't meant to be
                    x.destroy();
                    this.enemies.splice(this.enemies.indexOf(x),1);
                    SCORE += 320;
                    this.player.reserve += 25;
                }else{
                    create_particle(10,x.x-24,bulletY,0,0,0,0,1,"EXPLODE",1,0,0.25);
                    x.stun = 60;
                }
            }

            //--collision with player
            //super parries were too overpowered when accounted for here so only normal parries stun
            let lowestDist = 26+(this.parry>(55+PARRYWINDOW))*24; 
            //invincible check is to prevent miss timed parries from being partially beneficial missing a parry is punishing
            if ((Math.abs(x.x-this.player.x) < lowestDist) && (Math.abs(x.y-this.player.y) < lowestDist) && !this.player.invincible && !x.stun){
                if (this.parry>(55+PARRYWINDOW)){
                    x.stun = 60;
                    x.timeToFlee -= 20*(x.timeToFlee>30)*DELTATIME;
                }
                this.player.hit = 1;
            }

            //--if object is not a enemy but a part of a larger enemy
            if (x.follows){
                x.x = x.follows[0].x + x.follows[1];
                x.y = x.follows[0].y + x.follows[2];
                continue;
            }

            //--fleeing state
            if (x.timeToFlee < -60){
                x.setFrame(28);
                enemy_pathing(x,[1000,x.fleePos],Math.floor(x.fedUp))
                if (x.x >= 800){
                    SCORE -= 160;
                    this.player.reserve += 20;
                    x.destroy();
                    this.enemies.splice(this.enemies.indexOf(x),1);
                }
                continue;
            }
            if(x.timeToFlee > -3 && x.timeToFlee < 0){
                for (let i = 0; i < 4; i ++){
                    let angle = Math.floor(Math.random()*10)*Math.PI/5;
                    let xP = Math.cos(angle);
                    let y = Math.sin(angle);
                    create_particle(12,x.x,x.y,-xP*12,-y*12,xP,y,60-i);
                }
            }
            if (x.timeToFlee < 0){
                x.setFrame(28);
                x.timeToFlee -= DELTATIME;
                continue;
            }

            //--stun state
            if (x.stun){
                x.angle = Math.sin(x.stun*Math.PI/20)*x.stun-90
                x.stun -= DELTATIME;
                continue;
            }
            
            //enemy FSM
            //--entering state
            if (x.pointInSeq < PATHS[x.type].length){
                //console.log(x.pointInSeq)
                let goTo = [PATHS[x.type][x.pointInSeq]+x.yDisplacement,PATHS[x.type][x.pointInSeq+1]+x.yDisplacement]
                enemy_pathing(x,goTo,1)
                if ((Math.abs(x.x-goTo[0])<15 && Math.abs(x.y-goTo[1])<15))
                    x.pointInSeq +=2;
                for (let y of this.enemies){
                    if (x == y)
                        continue;
                    if (y.yDisplacement != x.yDisplacement)
                        continue;
                    if (y.type != x.type)
                        continue;
                    if (y.pointInSeq < PATHS[x.type].length)
                        continue;
                    else
                        y.attacking = -Math.floor(Math.random()*5)*30-10;
                    if ((Math.abs(x.x-y.x)<50 && Math.abs(x.y-y.y)<50))
                        x.pointInSeq = NaN;
                }
                continue;
            }
            
            //--firing bullets

            //--attacking state
            if (!x.attacking){
                x.attacking = 240;
                x.idlePos = [x.x,x.y];
                x.angle = 75+30*(x.y>this.player.y)+180*(x.x<this.player.x);
                x.fedUp = 0;
            }
            if (x.attacking > 1){
                x.attacking--;
                let targetPoint = x.idlePos
                if (x.attacking > 60)
                    targetPoint = [this.player.x,this.player.y];
                else if ((Math.abs(x.x-x.idlePos[0])>15 || Math.abs(x.y-x.idlePos[1])>15)){
                    x.attacking = 2;
                    x.fedUp += 0.01*DELTATIME
                }
                enemy_pathing(x,targetPoint,Math.floor(x.fedUp))
                continue;
            }
            if(x.attacking == 1 && x.timeToFlee > 900)
                x.attacking = -Math.floor(Math.random()*30)-30;
            else if(x.attacking == 1 && x.timeToFlee > 600)
                x.attacking = -Math.floor(Math.random()*60)-60;
            else if(x.attacking == 1)
                x.attacking = -Math.floor(Math.random()*120)-120;
            if (x.attacking < 0){
                let numAttackers = 0
                for (let y of this.enemies){
                    if (y.attacking > 1 && y != x)
                        numAttackers ++;
                    if (numAttackers > 1){
                        x.attacking --;
                        break;
                    }
                }
            }

            //--idle state
            x.angle = -90;
            x.timeToFlee -= DELTATIME;
            x.attacking += DELTATIME;
        }

        //handle waves
        if (!(this.waves%40) && this.waves < 40*5)
            create_enemy(250)
        this.waves ++;
        console.log(this.waves)

        //handle player parry
        if (this.superParry && this.player.hit){
            this.player.health += Math.floor(this.player.reserve/100) + 1;
            this.player.hit = 0;
            create_particle(10,this.player.x-10,this.player.y-5,0,0,0,0,1,"HIT",0.83,0,1.2);
            create_particle(1,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",0,0,1);
            for(let i = 0; i < 10; i++){
                let angle = Math.floor(Math.random()*10)*Math.PI/5;
                let x = Math.cos(angle);
                let y = Math.sin(angle);
                create_particle(12,this.player.x,this.player.y,-x*12,-y*12,x,y,60);
                create_particle(FLASHINGSPEED*2-6,this.player.x-10,this.player.y-3,0,0,0,0,1,"EXPLODE",0,0,0.2,1/(FLASHINGSPEED-3));
            }
        }else if (this.parry > (55+PARRYWINDOW) && this.player.hit){
            this.player.hit = 0;
            this.player.health += Math.floor(this.player.reserve/100);
            this.player.reserve = 0;
            create_particle(10,this.player.x-10,this.player.y-5,0,0,0,0,1,"HIT",1,0,1);
        }else if (this.parry == 60){
            create_particle(10,this.player.x-10,this.player.y-5,0,0,0,0,1,"HIT",1,0,0.5);
            create_particle(2,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",0,0,0.25);
        }
        this.superParry = Math.max(this.superParry-DELTATIME,0);
        this.parry = Math.max(this.parry-DELTATIME,0);

        //handle player health
        this.player.hit = this.player.hit&&(!this.player.invincible)&&!this.player.dead;
        if (this.player.reserve > 300)
            this.player.reserve = 300;
        if (this.player.health > 3)
            this.player.health = 3;
        if (this.player.hit){
            this.player.health --;
            this.player.hit = 0;
            this.player.invincible = 120;
            this.player.inNoSpin = 0;
            create_particle(10,this.player.x-10,this.player.y-5,0,0,0,0,1,"EXPLODE",0.5);
        }
        if (this.player.health <= 0){
            this.corpse = this.make.sprite({add:1,frame:1,scale:{x:2,y:2},key:"SHIPS"});
            this.corpse.x = this.player.x;
            this.corpse.y = this.player.y;
            this.corpse.hsp = 35;
            this.corpse.vsp = -16;
            this.player.dead = 1;
            this.player.health = 1;
            this.player.x = -200;
            this.player.y = 350;
            LIVES --;
        }
        if (this.player.invincible > 0){
            this.player.invincible --;
            create_particle(0,this.player.x,this.player.y,0,0,0,0,Math.floor(this.player.invincible/2)%30,"SHIELD",0,0,2,this.player.invincible/15);
        }

        //handle player death
        if (this.corpse){
            this.corpse.angle += 50*DELTATIME;
            this.corpse.x = Math.min(this.corpse.x + this.corpse.hsp*DELTATIME,780);
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
                this.player.invincible = 240;
                this.player.inNoSpin = 1;
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
            create_particle(FLASHINGSPEED*2-6,this.player.x-10,this.player.y-3,0,0,0,0,1,"EXPLODE",0,0,0.25,1/(FLASHINGSPEED-3));
        }

        //handle player bullet physics
        for (let x of this.myBullets){
            x.x += 20*DELTATIME;
            if (x.x > 800){
                x.destroy();
                //the first bullet to be fired is always the first bullet to leave the screen so shift works here
                this.myBullets.shift();
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

        //handle bullet cooldown
        this.makeBullet = (this.makeBullet-DELTATIME>0)*(this.makeBullet-DELTATIME)

        //handle player anim
        //--sparks
        let pMeetWall = (this.player.y == 590-10*(this.player.health == 3))-(this.player.y == 70+10*(this.player.health == 3));
        let inANG = Math.sin(this.player.invincible*Math.PI/20)*Math.min(this.player.invincible,30) * !this.player.inNoSpin;
        this.player.angle = (this.moveD-this.moveU)*19+90+(this.parry*24)*(this.parry>30)+inANG;
        //--sparks (and angle)
        this.player.sparkEffect.visible = pMeetWall;
        if (pMeetWall){
            this.player.angle = this.player.angle/2+pMeetWall*13*(this.player.health != 3)+45;
            this.player.sparkEffect.scaleY = 2+(this.moveD||this.moveU)*2-this.moveL+this.moveR;
            this.player.sparkEffect.angle = pMeetWall*24-90;
            this.player.sparkEffect.y = this.player.y+(pMeetWall)*(8+12*(this.player.health == 3));
            this.player.sparkEffect.x = this.player.x+22;
            this.player.sparkEffect.anim = (this.player.sparkEffect.anim+0.5*DELTATIME)%30;
            this.player.sparkEffect.setFrame(Math.floor(this.player.sparkEffect.anim));
        }
        //--flashing
        this.player.setFrame(Math.floor(this.player.anim/FLASHINGSPEED)+this.player.health*2-2);
        this.player.anim = (this.player.anim+DELTATIME)%(2*FLASHINGSPEED);
           
        
        //handle scoreboard
        this.scoreboard[0].setStrokeStyle(4,0xff0000+0xffff*Math.floor(this.player.anim/FLASHINGSPEED),100);
        this.scoreboard[1].setColor(Math.floor(this.player.anim/FLASHINGSPEED) ? "#f00" : "#fff");
        this.scoreboard[2].setColor(Math.floor(this.player.anim/FLASHINGSPEED) ? "#f00" : "#fff");
        this.scoreboard[1].setText("LEVEL "+(""+(LEVEL%100)).padStart(2,"0")+" SCORE "+(""+(SCORE%100000000)).padStart(8,"0"));
        this.scoreboard[2].setText("CACHE "+((""+(this.player.reserve/100+0.001)).padEnd(4,"0")).slice(0,4)+" LIVES "+(""+(LIVES%100)).padStart(2,"0"));
        
        //handle backdrop
        this.backdrop.currentframe = (this.backdrop.currentframe+DELTATIME/FLASHINGSPEED)%30;
        this.backdrop.setFrame(Math.floor(this.backdrop.currentframe));
    }
}

