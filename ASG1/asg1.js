// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
   attribute vec4 a_Position;
   uniform float u_Size;
   void main() {
      gl_Position = a_Position;
      gl_PointSize = u_Size;
   }`

// Fragment shader program
var FSHADER_SOURCE =`
   precision mediump float;
   uniform vec4 u_FragColor;
   void main() {
      gl_FragColor = u_FragColor;
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

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){
                           if(ev.buttons==1){click(ev)}
                           if(g_cat){catEvent(ev)}};



  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
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
   point.color = g_selectedColor.slice();
   point.size = g_selectedSize;
   g_shapesList.push(point);

  renderAllShapes();
}

function renderAllShapes(){
   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT);

   var len = g_shapesList.length;
   for(var i = 0; i < len; i++) {
      g_shapesList[i].render();
   }
}
