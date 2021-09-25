"use strict";

let gl,
  program,
  indices,
  coneVAO,
  vboName,
  iboName,
  coneIndexBuffer,
  vboSize = 0,
  vboUsage = 0,
  iboSize = 0,
  iboUsage = 0,
  isVerticesVbo = false,
  isConeVertexBufferVbo = false,
  isIndicesVbo = false,
  isConeIndexBufferVbo = false,
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
};

const initBuffers = () => {
  // prettier-ignore
  const vertices = [
    1.5, 0, 0,
    -1.5, 1, 0,
    -1.5, 0.809017, 0.587785,
    -1.5, 0.309017, 0.951057,
    -1.5, -0.309017, 0.951057,
    -1.5, -0.809017, 0.587785,
    -1.5, -1, 0,
    -1.5, -0.809017, -0.587785,
    -1.5, -0.309017, -0.951057,
    -1.5, 0.309017, -0.951057,
    -1.5, 0.809017, -0.587785
  ];

  // prettier-ignore
  indices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 6,
    0, 6, 7,
    0, 7, 8,
    0, 8, 9,
    0, 9, 10,
    0, 10, 1
  ];

  coneVAO = gl.createVertexArray();
  gl.bindVertexArray(coneVAO);

  const coneVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  coneIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  if (coneVertexBuffer === gl.getParameter(gl.ARRAY_BUFFER_BINDING)) {
    vboName = "coneVertexBuffer";
  }
  if (coneIndexBuffer === gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)) {
    iboName = "coneIndexBuffer";
  }

  vboSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
  vboUsage = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_USAGE);

  iboSize = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
  iboUsage = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_USAGE);

  try {
    isVerticesVbo = gl.isBuffer(vertices);
    isIndicesVbo = gl.isBuffer(indices);
  } catch (e) {
    isVerticesVbo = false;
    isIndicesVbo = false;
  }

  isConeVertexBufferVbo = gl.isBuffer(coneVertexBuffer);
  isConeIndexBufferVbo = gl.isBuffer(coneIndexBuffer);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
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
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

  gl.bindVertexArray(coneVAO);

  gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindVertexArray(null);
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const updateInfo = () => {
  document.getElementById("t-vbo-name").innerText = vboName;
  document.getElementById("t-ibo-name").innerText = iboName;
  document.getElementById("t-vbo-size").innerText = vboSize;
  document.getElementById("t-vbo-usage").innerText = vboUsage;
  document.getElementById("t-ibo-size").innerText = iboSize;
  document.getElementById("t-ibo-usage").innerText = iboUsage;
  document.getElementById("s-is-vertices-vbo").innerText = isVerticesVbo
    ? "Yes"
    : "No";
  document.getElementById(
    "s-is-cone-vertex-buffer-vbo"
  ).innerText = isConeVertexBufferVbo ? "Yes" : "No";
  document.getElementById("s-is-indices-vbo").innerText = isIndicesVbo
    ? "Yes"
    : "No";
  document.getElementById(
    "s-is-cone-index-buffer-vbo"
  ).innerText = isConeIndexBufferVbo ? "Yes" : "No";
};

const init = () => {
  const canvas = utils.getCanvas("webgl-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl = utils.getGLContext(canvas);
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  initProgram();
  initBuffers();
  render();

  updateInfo();
};

window.addEventListener("load", init);
