import BaseScene from "./BaseScene";

class PreloadScene extends BaseScene{
    constructor(config){
        super('PreloadScene',config);
    }


    create(){
        super.create();
        this.scene.start('MenuScene');
    }

    preload(){
        this.load.image('sky','assets/sky.png');
        this.load.image('pipe','assets/pipe.png');
        this.load.image('pause','assets/pause.png');
        this.load.image('back','assets/back.png');
        this.load.spritesheet('bird','assets/birdSprite.png',{
            frameWidth:16,frameHeight:16
        });
    }
}
export default PreloadScene;