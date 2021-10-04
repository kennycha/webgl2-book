"use strict";

let gl,
  scene,
  program,
  clock,
  WORLD_COORDINATES = "World Coordinates",
  CAMERA_COORDINATES = "Camera Coordinates",
  coordinates = WORLD_COORDINATES,
  home = [0, -2, -50],
  position = [0, -2, -50],
  rotation = [0, 0, 0],
  cameraMatrix = mat4.create(),
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create();

const configure = () => {
  const canvas = utils.getCanvas("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  gl = utils.getGLContext(canvas);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  clock = new Clock();

  program = new Program(gl, "vertex-shader", "fragment-shader");

  const uniforms = [
    "uProjectionMatrix",
    "uModelViewMatrix",
    "uNormalMatrix",

    "uMaterialDiffuse",

    "uLightAmbient",
    "uLightDiffuse",
    "uLightPosition",
    "uWireframe",
  ];

  const attributes = ["aVertexPosition", "aVertexNormal", "aVertexColor"];

  program.load(attributes, uniforms);

  scene = new Scene(gl, program);

  gl.uniform3fv(program.uLightPosition, [0, 120, 120]);
  gl.uniform4fv(program.uLightAmbient, [0.2, 0.2, 0.2, 1]);
  gl.uniform4fv(program.uLightDiffuse, [1, 1, 1, 1]);

  initTransforms();
};

const load = () => {
  scene.add(new Floor(80, 2));
  scene.add(new Axis(82));
  scene.load("/common/models/geometries/cone3.json", "cone");
};

const initTransforms = () => {
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, home);

  mat4.identity(cameraMatrix);
  mat4.invert(cameraMatrix, modelViewMatrix);

  mat4.identity(projectionMatrix);

  mat4.identity(normalMatrix);
  mat4.copy(normalMatrix, modelViewMatrix);
  mat4.invert(normalMatrix, normalMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
};

const updateTransforms = () => {
  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );

  if (coordinates === WORLD_COORDINATES) {
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, position);
    mat4.rotateX(
      modelViewMatrix,
      modelViewMatrix,
      (rotation[0] * Math.PI) / 180
    );
    mat4.rotateY(
      modelViewMatrix,
      modelViewMatrix,
      (rotation[1] * Math.PI) / 180
    );
    mat4.rotateZ(
      modelViewMatrix,
      modelViewMatrix,
      (rotation[2] * Math.PI) / 180
    );
  } else {
    mat4.identity(cameraMatrix);
    mat4.translate(cameraMatrix, cameraMatrix, position);
    mat4.rotateX(cameraMatrix, cameraMatrix, (rotation[0] * Math.PI) / 180);
    mat4.rotateY(cameraMatrix, cameraMatrix, (rotation[1] * Math.PI) / 180);
    mat4.rotateZ(cameraMatrix, cameraMatrix, (rotation[2] * Math.PI) / 180);
  }
};

const setMatrixUniforms = () => {
  if (coordinates === WORLD_COORDINATES) {
    mat4.invert(cameraMatrix, modelViewMatrix);
  } else {
    mat4.invert(modelViewMatrix, cameraMatrix);
  }

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
  mat4.transpose(normalMatrix, cameraMatrix);
  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);
};

const draw = () => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  try {
    updateTransforms();
    setMatrixUniforms();

    scene.traverse((object) => {
      gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
      gl.uniform1i(program.uWireframe, object.wireframe);

      gl.bindVertexArray(object.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);

      if (object.wireframe) {
        gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawElements(
          gl.TRIANGLES,
          object.indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
      }

      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    });
  } catch (error) {
    console.error(error);
  }
};

const init = () => {
  configure();
  load();
  clock.on("tick", draw);

  initControls();
};

window.addEventListener("load", init);

const initControls = () => {
  const coordinatesElement = document.getElementById("coordinates");

  utils.configureControls({
    Coordinates: {
      value: coordinates,
      options: [WORLD_COORDINATES, CAMERA_COORDINATES],
      onChange: (v) => {
        coordinates = v;
        coordinatesElement.innerText = coordinates;
        vec3.copy(home, position);
        rotation = [0, 0, 0];
        if (coordinates === CAMERA_COORDINATES) {
          vec3.negate(position, position);
        }
      },
    },
    ...["Rotate X", "Rotate Y", "Rotate Z"].reduce((result, name, i) => {
      result[name] = {
        value: rotation[i],
        min: -180,
        max: 180,
        step: 0.1,
        onChange(v, state) {
          rotation = [state["Rotate X"], state["Rotate Y"], state["Rotate Z"]];
        },
      };
      return result;
    }, {}),
  });

  clock.on("tick", () => {
    const matrix =
      coordinates === WORLD_COORDINATES ? modelViewMatrix : cameraMatrix;
    matrix.forEach((data, i) => {
      document.getElementById(`m${i}`).innerText = data.toFixed(1);
    });
  });
};
