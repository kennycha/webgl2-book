"use strict";

let gl,
  scene,
  program,
  camera,
  transforms,
  elapsedTime,
  initialTime,
  fixedLight = false,
  dxSphere = 0.5,
  dxCone = 0.15,
  spherePosition = 0,
  conePosition = 0,
  animationRate = 300,
  simulationRate = 30;

const configure = () => {
  const canvas = utils.getCanvas("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  gl = utils.getGLContext(canvas);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clearDepth(100);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  program = new Program(gl, "vertex-shader", "fragment-shader");

  const uniforms = [
    "uProjectionMatrix",
    "uModelViewMatrix",
    "uNormalMatrix",
    "uMaterialAmbient",
    "uMaterialDiffuse",
    "uMaterialSpecular",
    "uLightAmbient",
    "uLightDiffuse",
    "uLightSpecular",
    "uLightPosition",
    "uShininess",
    "uUpdateLight",
    "uWireframe",
  ];

  const attributes = ["aVertexPosition", "aVertexNormal", "aVertexColor"];

  program.load(attributes, uniforms);

  scene = new Scene(gl, program);

  camera = new Camera(Camera.ORBITING_TYPE);
  camera.goHome([0, 2, 50]);
  camera.setFocus([0, 0, 0]);
  new Controls(camera, canvas);

  transforms = new Transforms(gl, program, camera, canvas);

  gl.uniform3fv(program.uLightPosition, [0, 120, 120]);
  gl.uniform4fv(program.uLightAmbient, [0.2, 0.2, 0.2, 1]);
  gl.uniform4fv(program.uLightDiffuse, [1, 1, 1, 1]);
  gl.uniform4fv(program.uLightSpecular, [1, 1, 1, 1]);
  gl.uniform1f(program.uShininess, 230);
};

const load = () => {
  scene.add(new Floor(80, 2));
  scene.add(new Axis(82));
  scene.load("../../common/models/geometries/sphere2.json", "sphere");
  scene.load("../../common/models/geometries/cone3.json", "cone");
};

const draw = () => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  transforms.updatePerspective();

  try {
    gl.uniform1i(program.uUpdateLight, fixedLight);

    scene.traverse((object) => {
      transforms.calculateModelView();
      transforms.push();

      if (object.alias === "sphere") {
        const sphereTransform = transforms.modelViewMatrix;
        // prettier-ignore
        mat4.translate(sphereTransform, sphereTransform, [0, 0, spherePosition])
      } else if (object.alias === "cone") {
        const coneTransform = transforms.modelViewMatrix;
        mat4.translate(coneTransform, coneTransform, [conePosition, 0, 0]);
      }

      transforms.setMatrixUniforms();
      transforms.pop();

      gl.uniform4fv(program.uMaterialAmbient, object.ambient);
      gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
      gl.uniform4fv(program.uMaterialSpecular, object.specular);
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

const animate = () => {
  spherePosition += dxSphere;
  if (spherePosition >= 30 || spherePosition <= -30) {
    dxSphere = -dxSphere;
  }

  conePosition += dxCone;
  if (conePosition >= 35 || conePosition <= -35) {
    dxCone = -dxCone;
  }

  draw();
};

const onFrame = () => {
  elapsedTime = new Date().getTime() - initialTime;
  if (elapsedTime < animationRate) return;

  let steps = Math.floor(elapsedTime / simulationRate);
  while (steps > 0) {
    animate();
    steps -= 1;
  }

  initialTime = new Date().getTime();
};

const render = () => {
  initialTime = new Date().getTime();
  setInterval(onFrame, animationRate / 1000);
};

const init = () => {
  configure();
  load();
  render();

  initControls();
};

window.addEventListener("load", init);

const initControls = () => {
  utils.configureControls({
    "Camera Type": {
      value: camera.type,
      options: [Camera.ORBITING_TYPE, Camera.TRACKING_TYPE],
      onChange: (v) => {
        camera.goHome();
        camera.setType(v);
      },
    },
    "Animation Rate": {
      value: animationRate,
      onChange: (v) => (animationRate = v),
    },
    "Simulation Rate": {
      value: simulationRate,
      onChange: (v) => (simulationRate = v),
    },
    "Static Light Position": {
      value: fixedLight,
      onChange: (v) => (fixedLight = v),
    },
    "Go Home": () => camera.goHome(),
  });
};
