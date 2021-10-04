"use strict";

let gl,
  scene,
  program,
  camera,
  clock,
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

  camera = new Camera(Camera.TRACKING_TYPE);
  camera.goHome([0, 2, 50]);

  new Controls(camera, canvas);

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
  modelViewMatrix = camera.getViewTransform();

  mat4.identity(projectionMatrix);

  updateTransforms();

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
};

const setMatrixUniforms = () => {
  gl.uniformMatrix4fv(
    program.uModelViewMatrix,
    false,
    camera.getViewTransform()
  );
  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  mat4.transpose(normalMatrix, camera.matrix);
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
  utils.configureControls({
    "Camera Type": {
      value: camera.type,
      options: [Camera.TRACKING_TYPE, Camera.ORBITING_TYPE],
      onChange: (v) => {
        camera.goHome();
        camera.setType(v);
      },
    },
    Dolly: {
      value: 0,
      min: -100,
      max: 100,
      step: 0.1,
      onChange: (v) => camera.dolly(v),
    },
    Position: {
      ...["X", "Y", "Z"].reduce((result, name, i) => {
        result[name] = {
          value: camera.position[i],
          min: -100,
          max: 100,
          step: 0.1,
          onChange: (v, state) => {
            camera.setPosition([state.X, state.Y, state.Z]);
          },
        };
        return result;
      }, {}),
    },
    Rotation: {
      Elevation: {
        value: camera.elevation,
        min: -180,
        max: 180,
        step: 0.1,
        onChange: (v) => camera.setElevation(v),
      },
      Azimuth: {
        value: camera.azimuth,
        min: -180,
        max: 180,
        step: 0.1,
        onChange: (v) => camera.setAzimuth(v),
      },
    },
    "Go Home": () => camera.goHome(),
  });

  clock.on("tick", () => {
    camera.matrix.forEach((data, i) => {
      document.getElementById(`m${i}`).innerText = data.toFixed(1);
    });
  });
};
