class OptionsMenu extends Phaser.Scene {
    constructor(){
        super("OptionsMenu")
    }
    preload(){
        //sorry nothing!
    }
    create(){
        this.keyToBind = 0;
        this.input.keyboard.on('keydown',(event) => {
            if (this.keyToBind){
                CONTROLCONFIG[this.keyToBind] = event.key;
                this.keyToBind = 0;
            }
        });
    }
    update(){
        
    }
}

