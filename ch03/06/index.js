"use strict";

let gl,
  program,
  vao,
  indices,
  indicesBuffer,
  azimuth = 0,
  elevation = 0,
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create();

const initProgram = () => {
  const canvas = utils.getCanvas("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  gl = utils.getGLContext(canvas);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clearDepth(100);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

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
  program.aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");

  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");

  program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");

  program.uLightAmbient = gl.getUniformLocation(program, "uLightAmbient");
  program.uLightDiffuse = gl.getUniformLocation(program, "uLightDiffuse");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
};

const initLights = () => {
  gl.uniform3fv(program.uLightDirection, [0, 0, -1]);
  gl.uniform4fv(program.uLightAmbient, [0.01, 0.01, 0.01, 1]);
  gl.uniform4fv(program.uLightDiffuse, [0.5, 0.5, 0.5, 1]);

  gl.uniform4f(program.uMaterialDiffuse, 0.1, 0.5, 0.8, 1);
};

const handleKeyDown = (event) => {
  const lightDirection = gl.getUniform(program, program.uLightDirection);
  const incrementValue = 10;

  switch (event.key) {
    case "ArrowLeft": {
      azimuth -= incrementValue;
      break;
    }
    case "ArrowUp": {
      elevation += incrementValue;
      break;
    }
    case "ArrowRight": {
      azimuth += incrementValue;
      break;
    }
    case "ArrowDown": {
      elevation -= incrementValue;
      break;
    }
  }

  azimuth %= 360;
  elevation %= 360;

  const theta = (elevation * Math.PI) / 180;
  const phi = (azimuth * Math.PI) / 180;

  lightDirection[0] = Math.cos(theta) * Math.sin(phi);
  lightDirection[1] = Math.sin(theta);
  lightDirection[2] = Math.cos(theta) * -Math.cos(phi);

  gl.uniform3fv(program.uLightDirection, lightDirection);
};

function initBuffers() {
  // prettier-ignore
  const vertices = [
    -20, -8, 20, // 0
    -10, -8, 0,  // 1
    10, -8, 0,   // 2
    20, -8, 20,  // 3
    -20, 8, 20,  // 4
    -10, 8, 0,   // 5
    10, 8, 0,    // 6
    20, 8, 20    // 7
  ];

  // prettier-ignore
  indices = [
    0, 5, 4,
    1, 5, 0,
    1, 6, 5,
    2, 6, 1,
    2, 7, 6,
    3, 7, 2
  ];

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const normals = utils.calculateNormals(vertices, indices);

  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexPosition);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexNormal);
  gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

const draw = () => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -40]);

  mat4.copy(normalMatrix, modelViewMatrix);
  mat4.invert(normalMatrix, normalMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);

  try {
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } catch (error) {
    console.error(error);
  }
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const init = () => {
  initProgram();
  initBuffers();
  initLights();
  render();

  window.addEventListener("keydown", handleKeyDown);
};

window.addEventListener("load", init);
