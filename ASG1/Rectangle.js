class Rectangle {
   constructor() {
      this.type = 'rectangle';
      this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0];
      this.size = 20.0;
      this.top = false;
   }
   render(){
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;

      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      //Pass the size of Object
      gl.uniform1f(u_Size, size);
      // Draw
      var d = this.size/60;

      if(this.top){
         drawTriangle([xy[0],xy[1],xy[0]+0.15,xy[1],xy[0],xy[1]-d]);
         drawTriangle([xy[0]+0.15,xy[1]-d,xy[0],xy[1]-d,xy[0]+0.15,xy[1]]);
      }else{
         drawTriangle([xy[0],xy[1],xy[0]+0.15,xy[1],xy[0],xy[1]+d]);
         drawTriangle([xy[0]+0.15,xy[1]+d,xy[0],xy[1]+d,xy[0]+0.15,xy[1]]);
      }

   }
}
