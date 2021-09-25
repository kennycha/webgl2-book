"use strict";

const utils = {
  // Find and return a DOM element given an ID
  getCanvas(id) {
    const canvas = document.getElementById(id);

    if (!canvas) {
      console.error(`There is no canvas with id ${id} on this page.`);
      return null;
    }

    return canvas;
  },

  // Given a canvas element, return the WebGL2 context
  getGLContext(canvas) {
    return (
      canvas.getContext("webgl2") ||
      console.error("WebGL2 is not available in your browser.")
    );
  },
};
