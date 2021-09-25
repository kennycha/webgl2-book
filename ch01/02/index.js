const init = () => {
  const canvas = document.getElementById("webgl-canvas");

  if (!canvas) {
    console.error("No HTML5 Canvas was found!");
    return;
  }

  const gl = canvas.getContext("webgl2");

  const message = gl
    ? "Hooray! You got a WebGL2 context"
    : "Sorry! WebGL is not available";

  alert(message);
};

window.addEventListener("load", init);
