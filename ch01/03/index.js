"use strict";

let gl;

const updateClearColor = (...color) => {
  if (gl) {
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, 0, 0);
  }
};

const handleKeyDown = (event) => {
  if (gl) {
    switch (event.key) {
      case "1": {
        updateClearColor(0.2, 0.8, 0.2, 1.0);
        break;
      }
      case "2": {
        updateClearColor(0.2, 0.2, 0.8, 1.0);
        break;
      }
      case "3": {
        updateClearColor(
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random()
        );
        break;
      }
      case "4": {
        const color = gl.getParameter(gl.COLOR_CLEAR_VALUE);
        alert(`clearColor: (
            ${color[0].toFixed(1)},
            ${color[1].toFixed(1)},
            ${color[2].toFixed(1)}
          )`);
        window.focus();
        break;
      }
    }
  }
};

const init = () => {
  const canvas = document.getElementById("webgl-canvas");

  if (!canvas) {
    console.error("No HTML5 Canvas was found!");
    return;
  }

  gl = canvas.getContext("webgl2");

  const message = gl
    ? "Hooray! You got a WebGL2 context"
    : "Sorry! WebGL is not available";

  alert(message);
  window.addEventListener("keydown", handleKeyDown);
};

window.addEventListener("load", init);
