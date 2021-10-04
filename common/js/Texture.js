"use strict";

class Texture {
  constructor(gl, source) {
    this.gl = gl;
    this.glTexture = gl.createTexture();

    this.image = new Image();
    this.image.onload = () => this.handleLoadedTexture();

    if (source) {
      this.setImage(source);
    }
  }

  setImage(source) {
    this.image.src = source;
  }

  handleLoadedTexture() {
    const { gl, image, glTexture } = this;

    gl.bindTexture(gl.TEXTURE_2D, glTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_NEAREST
    );
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
