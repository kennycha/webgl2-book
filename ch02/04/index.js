"use strict";

let gl,
  program,
  indices,
  trapezoidVAO,
  trapezoidIndexBuffer,
  renderingMode = "TRIANGLES";

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
};

const initBuffers = () => {
  const vertices = [
    -0.5,
    -0.5,
    0,
    -0.25,
    0.5,
    0,
    0.0,
    -0.5,
    0,
    0.25,
    0.5,
    0,
    0.5,
    -0.5,
    0,
  ];

  indices = [0, 1, 2, 1, 3, 2, 2, 3, 4];

  trapezoidVAO = gl.createVertexArray();
  gl.bindVertexArray(trapezoidVAO);

  const trapezoidVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trapezoidVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  trapezoidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, trapezoidIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const draw = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.bindVertexArray(trapezoidVAO);

  switch (renderingMode) {
    case "TRIANGLES": {
      indices = [0, 1, 2, 1, 3, 2, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINES": {
      indices = [0, 1, 1, 2, 2, 3, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "POINTS": {
      indices = [1, 2, 3];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.POINTS, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINE_LOOP": {
      indices = [0, 2, 4, 3, 1];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINE_STRIP": {
      indices = [2, 3, 4, 1, 0];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "TRIANGLE_STRIP": {
      indices = [0, 1, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "TRIANGLE_FAN": {
      indices = [0, 1, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
  }
  gl.bindVertexArray(null);
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const initControls = () => {
  utils.configureControls({
    "Rendering Mode": {
      value: renderingMode,
      options: [
        "TRIANGLES",
        "LINES",
        "POINTS",
        "LINE_LOOP",
        "LINE_STRIP",
        "TRIANGLE_STRIP",
        "TRIANGLE_FAN",
      ],
      onChange: (v) => (renderingMode = v),
    },
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
  initBuffers();
  render();

  initControls();
};

window.addEventListener("load", init);
