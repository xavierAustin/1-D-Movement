let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    fps: { target: 60, forceSetTimeOut: 1 }, 
    width: 800,
    height: 600,
    scene: [TitleScreen,OptionsMenu,Shmup,GameOver]
}

//credit to Nanoo on stack exchange for font loader function
function loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
}

loadFont("QUINQUEFIVE", "./assets/visuals/QuinqueFive.ttf");
loadFont("OLDFAX", "./assets/visuals/OldFax.ttf");
loadFont("HEALZONE", "./assets/visuals/healzone.ttf");

const game = new Phaser.Game(config);
BGMACROSSLEVELS = null;
SCORE = 0;
HIGHSCORES = [];
LEVEL = 0;
LIVES = 3;
PARRYWINDOW = 1;
ENDLESS = 0;
FLASHINGSPEED = 4;
PARTICLES = 1;
DELTATIME = 1;
AUDIO = {
    mstr: 0.8,
    sfx: 1,
    bgm: 1
};
CONTROLCONFIG = {
    up:"w",
    upAlt:"arrowup",
    dwn: "s",
    dwnAlt:"arrowdown",
    lft: "a",
    lftAlt: "arrowleft",
    rt: "d",
    rtAlt: "arrowright",
    sht: " ",
    shtAlt: " ",
    pry: "shift",
    pryAlt: "shift"
};
const PATHS = {
    sine:[
        800,100,
        750,200,
        700,200,
        650,100,
        600,0,
        550,0,
        500,100,
        450,200,
        400,200,
        350,100,
        300,0,
        250,0,
        200,100
    ],
    hook:[
        800,100,
        650,150,
        500,100,
        350,0,
        150,0,
        50,50,
        0,150,
        50,250,
        150,300
    ],
    web:[
        800,300,
        750,300,
        750,300,
        750,100,
        750,100,
        550,100,
        550,100,
        550,300,
        550,300,
        650,100,
        650,100,
        750,300,
        750,300,
        750,500,
        750,500,
        550,500,
        550,500,
        550,300,
        550,300,
        650,500,
        650,500,
        750,300,
        750,300,
        550,300,
        550,300
    ],
    sprl:[
        800,100,
        600,100,
        300,100,
        150,150,
        100,300,
        150,450,
        300,500,
        450,450,
        500,300,
        450,200,
        350,150,
        250,150,
        150,250,
        150,350,
        250,450,
        350,450,
        450,350,
        400,250,
        350,200,
        250,200,
        200,250,
        200,350,
        250,400,
        350,400,
        400,350,
        350,250,
        250,250,
        250,350,
        350,350,
        350,300,
        300,300
    ],
    alts:[
        800,100,
        500,100,
        350,150,
        300,300,
        350,450,
        500,500,
        650,450,
        700,300,
        650,200,
        550,150,
        450,150,
        350,250,
        350,350,
        450,450,
        550,450,
        650,350,
        600,250,
        550,200,
        450,200,
        400,250,
        400,350,
        450,400,
        550,400,
        600,350,
        550,250,
        450,250,
        450,350,
        550,350,
        550,300,
        500,300
    ]
}