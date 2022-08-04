import BaseScene from "./BaseScene";
const PIPES_TO_RENDER=10;

class PlayScene extends BaseScene{
    constructor(config){
        super('PlayScene',config);
        this.bird=null;
        this.pipes=null;
        this.isPaused=false;

        this.pipeHorizontalDistance=0;
        this.pipeVeritcalDistanceRange=[150,250];
        this.pipeHorizontalDistanceRange=[450,550];

        this.score=0;
        this.scoreText='';

        this.currentDifficulty='easy';
        this.difficulties={
          'easy':{
            pipeHorizontalDistanceRange:[300,350],
            pipeVeritcalDistanceRange:[150,200]
          },
          'normal':{
            pipeHorizontalDistanceRange:[280,330],
            pipeVeritcalDistanceRange:[140,190]
          },
          'hard':{
            pipeHorizontalDistanceRange:[250,310],
            pipeVeritcalDistanceRange:[120,160]
          }
        }
    }

    create(){
        super.create();
        this.currentDifficulty='easy';
        this.createBackground();
        this.createBird();
        this.createPipes();
        this.handleInputs();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.listenToEvents();
        this.anims.create({
          key:'fly',
          frames:this.anims.generateFrameNumbers('bird',{start:8,end:15}),
          frameRate:8,
          repeat:-1 //infinite
        })

        this.bird.play('fly');
    }

    update(){
        this.checkStatus();
        this.recyclePipes();
    }

    listenToEvents(){
      if(this.pauseEvent){return;}
      this.pauseEvent=this.events.on('resume',()=>{
        this.initialTime=3;
        this.countDownText=this.add.text(...this.screenCenter,"Fly in: "+this.initialTime,this.fontOptions).setOrigin(.5);
        this.timedEvent=this.time.addEvent({
          delay: 1000,
          callback:this.countDown,
          callbackScope: this,
          loop:true
        })
      })
    }


    countDown(){
      this.initialTime--;
      this.countDownText.setText("Fly in: "+this.initialTime);
      if(this.initialTime<=0){
        this.isPaused=false;
        this.countDownText.setText('');
        this.physics.resume();
        this.timedEvent.remove();
      }
    }

    checkStatus(){
        if(this.bird.body.y<=0||this.bird.getBounds().bottom>=this.config.height){
            this.restart();
        }
    }

    createBackground(){
        this.add.image(0,0,'sky').setOrigin(0,0);
    }

    createBird(){
        this.bird=this.physics.add.sprite(this.config.startPosition.x,this.config.startPosition.y,'bird')
        .setFlipX(true)
        .setScale(3)
        .setOrigin(0,0);
        this.bird.setBodySize(this.bird.width,this.bird.height-10);
        this.bird.body.gravity.y=600;
        this.bird.setCollideWorldBounds(true);
    }
    createPipes(){
        this.pipes=this.physics.add.group();
      
        for(let i=0;i<PIPES_TO_RENDER;i++){
          const upperPipe=this.pipes.create(0,0,'pipe')
          .setImmovable(true)
          .setOrigin(0,1);
          const lowerPipe=this.pipes.create(0,0,'pipe')
          .setImmovable(true)
          .setOrigin(0,0);
          this.placePipe(upperPipe,lowerPipe);
        }
        this.pipes.setVelocityX(-200);

    }

    createColliders(){
      this.physics.add.collider(this.bird,this.pipes, this.restart,null,this);
    }

    createScore(){
      this.score=0;
      const bestScore=localStorage.getItem('bestScore');
      this.scoreText=this.add.text(16,16,`Score: ${0}`,{font:'32px',fill:'#000'});
      this.add.text(16,52, `Best Score: ${bestScore||0}`,{font:'32px',fill:'#000'});
    }
    
    createPause(){
      this.isPaused=false;
      const pauseButton = this.add.image(this.config.width-10,this.config.height-10,'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1);
      pauseButton.on('pointerdown',()=>{
        this.isPaused=true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch('PauseScene');
      })
    }
    handleInputs(){
        this.input.keyboard.on('keydown_SPACE',this.flap,this);
        this.input.on('pointerdown',this.flap,this);
    }

    placePipe(upperPipe,lowerPipe){
        const difficulty=this.difficulties[this.currentDifficulty];
        const rightMostX=this.getRightMostPipe();
        const pipeVeritcalDistance=Phaser.Math.Between(...difficulty.pipeVeritcalDistanceRange);
        const pipeVerticalPosition=Phaser.Math.Between(0+20,this.config.startPosition.y-20-pipeVeritcalDistance);
        const pipeHorizontalDistance=Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);
        upperPipe.x=pipeHorizontalDistance+rightMostX;
        upperPipe.y=pipeVeritcalDistance;
        lowerPipe.x=upperPipe.x;
        lowerPipe.y=upperPipe.y+pipeVeritcalDistance;
      }

    getRightMostPipe(){
        let rightMostX=0;
        this.pipes.getChildren().forEach(function(pipe){
          rightMostX=Math.max(pipe.x,rightMostX)
        })
        return rightMostX;
      }
    recyclePipes(){
        const tempPipes=[];
        this.pipes.getChildren().forEach(pipe=>{
          if(pipe.getBounds().right<=0){
            tempPipes.push(pipe);
            if(tempPipes.length===2){
              this.placePipe(...tempPipes);
              this.increaseScore();
              this.saveBestScore();
              this.increaseDifficulty();
            }
          }
        })
      }
      increaseDifficulty(){
        if(this.score===20){
          this.currentDifficulty='normal';
        }
        if(this.score===50){
          this.currentDifficulty='hard';
        }
      }

    flap(){
      if(this.isPaused){
        return;
      }
        this.bird.body.velocity.y=-300;
      }

    increaseScore(){
      this.score++;
      this.scoreText.setText(`Score: ${this.score}`);
    }

    saveBestScore(){
      const bestScoreText=localStorage.getItem('bestScore');
      const bestScore=bestScoreText&&parseInt(bestScoreText,10);

      if(!bestScore||this.score>bestScore){
        localStorage.setItem('bestScore',this.score);
      }
    }
    restart(){
        this.physics.pause();
        this.bird.setTint(0xEE4824);
        this.saveBestScore();
        this.time.addEvent({
          delay:1000,
          callback:()=>{
            this.scene.restart();

          },
          loop:false
        })
      }
}

export default PlayScene;