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
   uniform int u_texColorWeight;
   uniform int u_whichTexture;

   void main() {
      if(u_whichTexture==0){
         gl_FragColor = float(1-u_texColorWeight)*(u_BaseColor)+float(u_texColorWeight)*(texture2D(u_Sampler0,v_UV));
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
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segment = 10;
let g_cat = false;
let u_Sampler0;
let u_texColorWeight;
let u_whichTexture;


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

   // Get the storage location of u_texColorWeight
   u_texColorWeight = gl.getUniformLocation(gl.program,'u_texColorWeight');
   if (!u_texColorWeight) {
     console.log('Failed to get the storage location of u_texColorWeight');
     return false;
   }

   // Get the storage location of u_whichTexture
   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
     console.log('Failed to get the storage location of u_whichTexture');
     return false;
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


let birdPosition = [-.69, -0.02];
let gameStarted = false;



function addActionsForHtmlUI(){

   document.getElementById('clearButton').onclick = function(){g_shapesList=[]; renderAllShapes();}
   document.getElementById('startGame').onclick = function(){
                                                               gameStarted = true; 
                                                               
                                                            
                                                            }

   document.getElementById('pointButton').onclick = function(){g_selectedType=POINT};
   document.getElementById('triangleButton').onclick = function(){g_selectedType=TRIANGLE};
   document.getElementById('circleButton').onclick = function(){g_selectedType=CIRCLE};


   document.getElementById('redSlide').addEventListener('mouseup',function(){g_selectedColor[0]=this.value/100});
   document.getElementById('greenSlide').addEventListener('mouseup',function(){g_selectedColor[1]=this.value/100});
   document.getElementById('blueSlide').addEventListener('mouseup',function(){g_selectedColor[2]=this.value/100});
   document.getElementById('segmentSlide').addEventListener('mouseup',function(){g_segment=this.value});

   document.getElementById('sizeSlide').addEventListener('mouseup',function(){g_selectedSize=this.value});

   document.getElementById('circleButton').onclick = function(){g_selectedType=CIRCLE};

   document.getElementById('catButton').onclick = function(ev){g_shapesList=[];renderAllShapes(); g_cat = !g_cat;};



}
function main() {
   //set up canvas and gl variables
   setupWebGL();
   //Set up GLSL shader programs and connect GLSL variables
   connectVariableToGLSL();
   addActionsForHtmlUI();
   initTextures(gl);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){
                           if(ev.buttons==1){click(ev)}
                           if(g_cat){catEvent(ev)}};



  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  document.onkeydown = keydown;
     
   requestAnimationFrame(tick);
  
}

function initTextures(gl) {
   // Create a texture object
   
   var image0 = new Image();
   var texture0 = gl.createTexture();
   if (!texture0) {
     console.log('Failed to create the texture object');
     return false;
   }
 
   // Get the storage location of u_Sampler0 and u_Sampler1
   var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler');
     return false;
   }
 
   if (!image0) {
     console.log('Failed to create the image object');
     return false;
   }
 
   image0.onload = function(){ sendImageToTEXTURE(gl, texture0, u_Sampler0, image0); };
 
   image0.src = 'flappybird.jpg';
 
 
   return true;
 }

 function sendImageToTEXTURE(gl, texture, u_Sampler, image) {

   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
 
   gl.activeTexture(gl.TEXTURE0);
 
   gl.bindTexture(gl.TEXTURE_2D, texture);
 
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
 
   gl.uniform1i(u_Sampler, 0);   
 
   gl.clear(gl.COLOR_BUFFER_BIT);
 }
 

let restartGravity = false;
let fall = 0.00005;

function tick() {
   // Save the current info
   // g_seconds=performance.now()/1000.0-g_startTime;

   // updateAnimationAngles();
   // Draw everything
   renderAllShapes();
   
   if (gameStarted == true) {
      if(restartGravity == true){
         fall = 0.00005
      }else{
         console.log("In here");
         fall += 0.0005;
      }
      console.log(fall);
      restartGravity = false;
      birdPosition[1] -= fall;

      // Tell the browser to update again when it has time 
   }
   // if bird hits the bottom, in here add if bird touches pipe
   if(birdPosition[1] <= -0.93)
   {
      gameStarted = false;
      birdPosition = [-.69, -0.02];
   }
   requestAnimationFrame(tick);
   
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

var g_shapesList = [];

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
   console.log("x: " + x);
   console.log("y: " + y);
   point.color = g_selectedColor.slice();
   point.size = g_selectedSize;
   g_shapesList.push(point);

   renderAllShapes();
}

function renderAllShapes(){
   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT);

   point = new Point();
   point.position=birdPosition;
   point.textureNum = 1;
   point.color = [1, 0, 0, 1];
   point.size = 30;
   point.render();
   

   var len = g_shapesList.length;
   for(var i = 0; i < len; i++) {
      g_shapesList[i].render();
   }
}
