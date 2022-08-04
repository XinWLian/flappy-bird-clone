import Phaser from "phaser";
import PlayScene from "./Scenes/PlayScene";
import MenuScene from "./Scenes/MenuScene";
import PreloadScene from "./Scenes/PreloadScene";
import ScoreScene from "./Scenes/ScoreScene";
import PauseScene from "./Scenes/PauseScene";


const WIDTH=400;
const HEIGHT=600;
const BIRD_POSITION={x:WIDTH/10, y:HEIGHT/2};
const SHARED_CONFIG={
  width:WIDTH,
  height:HEIGHT,
  startPosition:BIRD_POSITION
}

const Scenes=[PreloadScene,MenuScene,PlayScene,ScoreScene,PauseScene];
const createScene=Scene =>new Scene(SHARED_CONFIG);
const initScenes=()=>Scenes.map(createScene);

const config={
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  pixelArt:true,
  physics:{
    default: 'arcade'
  },
  scene: initScenes()
}

new Phaser.Game(config);