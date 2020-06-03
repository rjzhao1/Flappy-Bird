// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
   attribute vec4 a_Position;
   uniform float u_Size;
   attribute vec2 a_UV;
   varying vec2 v_UV;
   void main() {
      gl_Position = a_Position;
      gl_PointSize = u_Size;
      v_UV = a_UV;
   }`

// Fragment shader program
var FSHADER_SOURCE =`
   precision mediump float;
   uniform vec4 u_FragColor;
   uniform vec4 u_BaseColor;
   varying vec2 v_UV;
   uniform sampler2D u_Sampler0;
   uniform int u_whichTexture;
   void main() {
      if(u_whichTexture==1){
         gl_FragColor = texture2D(u_Sampler0,v_UV);
      }else{
         gl_FragColor = u_FragColor;
      }

   }`

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_segment = 10;
// let g_cat = false;
let birdPosition = [-.9, -0.02];
let gameStarted = false;
let u_Sampler0;
let u_Sampler1;
let u_texColorWeight;
let u_whichTexture;
let a_UV;

function setupWebGL(){
   // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

   // Get the rendering context for WebGL
   // gl = getWebGLContext(canvas);
   gl = canvas.getContext('webgl',{preserveDrawingBuffer:true});
   if (!gl) {
     console.log('Failed to get the rendering context for WebGL');
     return;
   }
}

function connectVariableToGLSL(){
   // Initialize shaders
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
     console.log('Failed to intialize shaders.');
     return;
   }

   // // Get the storage location of a_Position
   a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0) {
     console.log('Failed to get the storage location of a_Position');
     return;
   }

   // Get the storage location of u_FragColor
   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
     console.log('Failed to get the storage location of u_FragColor');
     return;
   }

   u_Size =gl.getUniformLocation(gl.program,'u_Size');
   if (!u_Size) {
     console.log('Failed to get the storage location of u_Size');
     return;
   }


   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }

   // Get the storage location of u_whichTexture
   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
     console.log('Failed to get the storage location of u_whichTexture');
     return false;
   }

   a_UV = gl.getAttribLocation(gl.program, 'a_UV');
   if (a_UV < 0) {
     console.log('Failed to get the storage location of a_UV');
     return;
   }
}

function convertCoordinatesEventToGL(ev){
   var x = ev.clientX; // x coordinate of a mouse pointer
   var y = ev.clientY; // y coordinate of a mouse pointer
   var rect = ev.target.getBoundingClientRect();

   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
   return ([x,y])
}


function addActionsForHtmlUI(){

   document.getElementById('clearButton').onclick = function(){g_shapesList=[]; renderAllShapes();}

   document.getElementById('startGame').onclick = function(ev){
      restartGame();
      renderAllShapes();
      gameStarted = !gameStarted;
   }

   // document.getElementById('catButton').onclick = function(ev){g_shapesList=[];renderAllShapes(); g_cat = !g_cat;};



}

var g_shapesList = [];
function main() {
   //set up canvas and gl variables
   setupWebGL();
   //Set up GLSL shader programs and connect GLSL variables
   connectVariableToGLSL();
   addActionsForHtmlUI();



  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev){
  //                          if(ev.buttons==1){click(ev)}
  //                          if(g_cat){catEvent(ev)}};



  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  renderAllShapes();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  restartGame();
  initTextures(gl);

  document.onkeydown = keydown;

  renderAllShapes();
  requestAnimationFrame(tick);
}

function generate_pipe(pipe_x){
   let bot_height = Math.random()*(60-30)+30;
   let bot_pipe = new Rectangle();
   bot_pipe.position = [pipe_x,-1];
   bot_pipe.color = g_selectedColor.slice();
   bot_pipe.size = bot_height;
   g_shapesList.push(bot_pipe);


   let top_pipe = new Rectangle();
   let top_height = (Math.random()*(100-90)+90)-bot_height;
   top_pipe.position = [pipe_x,1];
   top_pipe.color = g_selectedColor.slice();
   top_pipe.size = top_height;
   top_pipe.top = true;
   g_shapesList.push(top_pipe);

   pipe_x+=0.65;
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
let restartGravity = false;
let fall = 0.00005;

function tick(){
   g_seconds=performance.now()/1000.0-g_startTime;
   // console.log(g_seconds);

   updateAnimationAngle();

   renderAllShapes();

   requestAnimationFrame(tick);
}

function updateAnimationAngle(){
   var len = g_shapesList.length;
   var pop = 0;
   if(gameStarted){
      for(var i = 0; i < len; i++) {
         g_shapesList[i].position[0]=g_shapesList[i].position[0]-0.01;
         if(g_shapesList[i].position[0]<-1){
            pop+=1;
         }
      }

      for(var i = 0; i < pop; i++) {
         g_shapesList.shift();
         let new_pipe_x = g_shapesList[g_shapesList.length-1].position[0]+0.65;
         generate_pipe(new_pipe_x);
      }

      if(restartGravity == true){
        fall = 0.00005
     }else{
        fall += 0.0005;
     }
     restartGravity = false;
     birdPosition[1] -= fall;
   }

   if(birdPosition[1] <= -0.93){
      restartGame();
      gameStarted = false;
   }
}



//attempt to create the cat and mouse game. When the cat button is
//pressed. the canvas will be cleared and a point will follow
//your mouse
function catEvent(ev){
   g_shapesList=[];
   let cat_point = new Point();
   var [x,y] = convertCoordinatesEventToGL(ev);
   cat_point.position = [x-0.05,y-0.05];
   cat_point.color = g_selectedColor.slice();
   cat_point.size = g_selectedSize;
   g_shapesList.push(cat_point);
   renderAllShapes();

}

function click(ev) {

   let [x,y] = convertCoordinatesEventToGL(ev);
   let point;
   if(g_selectedType==POINT){
      point = new Point();
   }else if (g_selectedType==TRIANGLE) {
      point = new Rectangle();
   }else{
      point = new Circle();
      point.segments = g_segment;
   }
   point.position = [x,y];
   point.color = g_selectedColor.slice();
   point.size = g_selectedSize;
   g_shapesList.push(point);

  renderAllShapes();
}

function renderAllShapes(){
   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT);

   point = new Rectangle();
   point.position=birdPosition;
   point.textureNum = 0;
   point.color = [1, 0, 0, 1];
   point.size = 9;
   point.render();


   var len = g_shapesList.length;
   for(var i = 0; i < len; i++) {
      if(point.collide(g_shapesList[i])){
         wait(1000);
         restartGame();
         gameStarted=false;
         break;
      }
      g_shapesList[i].render();
   }
}

function initTextures(gl) {
  // Create a texture object
  var texture0 = gl.createTexture();
  var texture1 = gl.createTexture();
  if (!texture0 || !texture1) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler0 and u_Sampler1
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0 ) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  var image0 = new Image();
  var image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, texture0, u_Sampler0, image0, 0); };
  // Tell the browser to load an Image
  image0.src = 'pipe.png';


  return true;
}


// Specify whether the texture unit is ready to use
function loadTexture(gl, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
  } else {
    gl.activeTexture(gl.TEXTURE1);
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, texUnit);   // Pass the texure unit to u_Sampler

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

 function keydown(ev){
    if (ev.keyCode==87) { //W key
       gameStarted = true;
       restartGravity = true;
       birdPosition[1] += 0.15;

    }else if(ev.keyCode==32){ //Space bar
       gameStarted = true;
       restartGravity = true;
       birdPosition[1] += 0.15;

    }
       // renderScene();
 }

function restartGame(){
   g_shapesList=[];
   pipe_x=-0.4;
   birdPosition = [-.9, -0.02];


   for(var i = 0;i<3;i++){
      generate_pipe(pipe_x);
      pipe_x+=0.5;
   }
}

//code from http://www.endmemo.com/js/pause.php
function wait(ms){
    var d = new Date();
    var d2 = null;

    while(d2-d < ms){
      d2 = new Date();
   }
}
