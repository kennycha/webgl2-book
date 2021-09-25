"use strict";

let gl,
  program,
  model,
  vao,
  modelIndexBuffer,
  projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

const getShader = (id) => {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  let shader;
  if (script.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else if (script.type === "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

const initProgram = () => {
  const vertexShader = getShader("vertex-shader");
  const fragmentShader = getShader("fragment-shader");

  program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Could not initialize shaders");
  }

  gl.useProgram(program);

  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uModelColor = gl.getUniformLocation(program, "uModelColor");
};

const draw = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5.0]);

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

  gl.bindVertexArray(vao);

  gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindVertexArray(null);
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const load = (filePath) => {
  return fetch(filePath)
    .then((res) => res.json())
    .then((data) => {
      model = data;

      vao = gl.createVertexArray();

      gl.bindVertexArray(vao);

      gl.uniform3fv(program.uModelColor, model.color);

      const modelVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(model.vertices),
        gl.STATIC_DRAW
      );

      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

      modelIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(model.indices),
        gl.STATIC_DRAW
      );

      gl.bindVertexArray(null);
    });
};

const init = () => {
  const canvas = utils.getCanvas("webgl-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl = utils.getGLContext(canvas);
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  initProgram();
  load("/common/models/geometries/cone1.json").then(render);
};

window.addEventListener("load", init);
