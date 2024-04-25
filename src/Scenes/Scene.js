class OneDMovement extends Phaser.Scene {
    constructor(){
        super("OneDMovement")
        this.myBullets = [];
        this.anim = 0;
        this.player = [];
        this.effects = [];
        this.moveLeft = 0;
        this.moveRight = 0;
        this.makeBullet = 0;
        this.shoot = 0;
    }
    preload(){
        this.load.setPath("./assets/");
        this.load.image("body0", "BugF0.png");
        this.load.image("body1", "BugF1.png");
        this.load.image("gun", "Gun.png");
        this.load.image("bullet", "Bullet.png");
        this.load.image("bulletImpact", "BulletImpact.png");
    }
    create(){
        this.player = [
            this.make.sprite({x:400,y:500,scale:{x:5,y:5},key:"body0",add:1}),
            this.make.sprite({x:400,y:500,scale:{x:5,y:5},key:"body1",add:1}),
            this.make.sprite({x:400,y:440,angle:-90,scale:{x:5,y:5},key:"gun",add:1})
        ];
        this.input.keyboard.on('keydown',(event) => {
            if (event.key == 'a' || event.key == 'ArrowLeft')
                this.moveLeft = 1;
            if (event.key == 'd' || event.key == 'ArrowRight')
                this.moveRight = 1;
            if (event.key == ' ')
                this.shoot = 1; 
        });
        this.input.keyboard.on('keyup',(event) => {
            console.log(event.key)
            if (event.key == 'a' || event.key == 'ArrowLeft')
                this.moveLeft = 0;
            if (event.key == 'd' || event.key == 'ArrowRight')
                this.moveRight = 0;
            if (event.key == ' ')
                this.shoot = 0;
        });
        //this.TIMESINCEEPOCH = new Date();
        //this.NEWTIME = this.TIMESINCEEPOCH.getTime();
    }
    update(){
        //alternate method to do the uniform game logic speed thing we talked about in class
        //pros: allows for uncapped framerate; cons: ugly and complicated
        //let DELTATIMESCALAR = 16;
        //let PREVTIME = this.NEWTIME;
        //this.TIMESINCEEPOCH = new Date();
        //this.NEWTIME = this.TIMESINCEEPOCH.getTime();
        let DELTATIME = 1//(this.NEWTIME-PREVTIME)/DELTATIMESCALAR;


        for (let x of this.player){
            x.x += (this.moveRight-this.moveLeft)*7*DELTATIME;
            if (!x.angle)
                x.flipX = this.moveLeft;
        }
        for (let x of this.myBullets){
            x.    y -= 20*DELTATIME;
            if (x.y < 0){
                x.destroy();
                this.myBullets.splice(this.myBullets.indexOf(x),1)
            }
        }
        if (this.shoot && !this.makeBullet){
            this.makeBullet = 10;
            this.myBullets.push(this.make.sprite({x:0,y:440,angle:-90,scale:{x:5,y:5},key:"bullet",add:1}));
            this.myBullets[this.myBullets.length-1].x = this.player[0].x;
        }
        this.player[0].visible = Math.floor(this.anim/15);
        this.player[1].visible = !Math.floor(this.anim/15);
        this.anim = (this.anim+DELTATIME)%30;
        this.makeBullet = (this.makeBullet-DELTATIME>0)*(this.makeBullet-DELTATIME)
    }
}

