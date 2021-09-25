"use strict";

let gl,
  program,
  parts = [],
  projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

const initProgram = () => {
  const vertexShader = utils.getShader(gl, "vertex-shader");
  const fragmentShader = utils.getShader(gl, "fragment-shader");

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
};

const load = () => {
  for (let i = 1; i < 179; i += 1) {
    fetch(`/common/models/nissan-gtr/part${i}.json`)
      .then((res) => res.json())
      .then((data) => {
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(data.vertices),
          gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(program.aVertexPosition);
        gl.vertexAttribPointer(
          program.aVertexPosition,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );

        const indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(data.indices),
          gl.STATIC_DRAW
        );

        data.vao = vao;
        data.ibo = indexBufferObject;

        parts.push(data);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      })
      .catch(console.error);
  }
};

const draw = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    10,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [-10, 0, -100]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, (30 * Math.PI) / 180, [
    1,
    0,
    0,
  ]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, (30 * Math.PI) / 180, [
    0,
    1,
    0,
  ]);

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

  parts.forEach((part) => {
    gl.bindVertexArray(part.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.ibo);

    gl.drawElements(gl.LINES, part.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const init = () => {
  const canvas = utils.getCanvas("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  gl = utils.getGLContext(canvas);
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  initProgram();
  load();
  render();
};

window.addEventListener("load", init);
