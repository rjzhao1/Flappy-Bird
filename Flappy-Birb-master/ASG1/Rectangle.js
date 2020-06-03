class Rectangle {
   constructor() {
      this.type = 'rectangle';
      this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0];
      this.size = 20.0;
      this.top = false;
      this.textureNum = 1;
      this.texColorWeight = 0;
   }
   render(){
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
      gl.uniform1i(u_whichTexture,this.textureNum);
      gl.uniform1i(u_texColorWeight,this.texColorWeight);

      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      //Pass the size of Object
      gl.uniform1f(u_Size, size);
      // Draw
      var d = this.size/60;

      if(this.top){
         drawTriangleUV([xy[0],xy[1],xy[0]+0.15,xy[1],xy[0],xy[1]-d], [xy[0]+0.15,xy[1]-d,xy[0],xy[1]-d,xy[0]+0.15,xy[1]]);
         drawTriangleUV([xy[0]+0.15,xy[1]-d,xy[0],xy[1]-d,xy[0]+0.15,xy[1]],  [xy[0],xy[1],xy[0]+0.15,xy[1],xy[0],xy[1]-d]);
      }else{
         drawTriangleUV([xy[0],xy[1],xy[0]+0.15,xy[1],xy[0],xy[1]+d], [xy[0]+0.15,xy[1]-d,xy[0],xy[1]-d,xy[0]+0.15,xy[1]]);
         drawTriangleUV([xy[0]+0.15,xy[1]+d,xy[0],xy[1]+d,xy[0]+0.15,xy[1]], [xy[0],xy[1],xy[0]+0.15,xy[1],xy[0],xy[1]-d]);
      }

   }

   collide(rect){

      var x_pos1=this.position[0];
      var x_pos2=this.position[0]+0.10;
      var contact_x1= rect.position[0];
      var contact_x2= rect.position[0]+0.15;


      if((x_pos1>=contact_x1 && x_pos1<=contact_x2)||(x_pos2>=contact_x1&&x_pos2<=contact_x2)){
         if(rect.top){
            let contact_y= rect.position[1]-rect.size/60;
            let y_pos = this.position[1]+this.size/60;
            if(y_pos>contact_y){
               return true;
            }
         }else{
            let contact_y= rect.position[1]+rect.size/60;
            let y_pos = this.position[1];
            if(y_pos<contact_y){
               return true;
            }
         }
      }else{
         return false;
      }

   }

}
