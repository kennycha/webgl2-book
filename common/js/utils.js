"use strict";

const utils = {
  getCanvas(id) {
    const canvas = document.getElementById(id);

    if (!canvas) {
      console.error(`There is no canvas with id ${id} on this page.`);
      return null;
    }

    return canvas;
  },

  getGLContext(canvas) {
    return (
      canvas.getContext("webgl2") ||
      console.error("WebGL2 is not available in your browser.")
    );
  },

  autoResizeCanvas(canvas) {
    const expandFullScreen = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    expandFullScreen();
    window.addEventListener("resize", expandFullScreen);
  },

  getShader(gl, id) {
    const script = document.getElementById(id);
    if (!script) {
      return null;
    }

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
  },

  calculateNormals(vs, ind) {
    const x = 0;
    const y = 1;
    const z = 2;
    const ns = [];

    for (let i = 0; i < vs.length; i += 3) {
      ns[i + x] = 0.0;
      ns[i + y] = 0.0;
      ns[i + z] = 0.0;
    }

    for (let i = 0; i < ind.length; i += 3) {
      const v1 = [];
      const v2 = [];
      const normals = [];

      v1[x] = vs[3 * ind[i + 2] + x] - vs[3 * ind[i + 1] + x];
      v1[y] = vs[3 * ind[i + 2] + y] - vs[3 * ind[i + 1] + y];
      v1[z] = vs[3 * ind[i + 2] + z] - vs[3 * ind[i + 1] + z];

      v2[x] = vs[3 * ind[i] + x] - vs[3 * ind[i + 1] + x];
      v2[y] = vs[3 * ind[i] + y] - vs[3 * ind[i + 1] + y];
      v2[z] = vs[3 * ind[i] + z] - vs[3 * ind[i + 1] + z];

      normals[x] = v1[x] * v2[z] - v1[z] * v2[y];
      normals[y] = v1[z] * v2[x] - v1[x] * v2[z];
      normals[z] = v1[x] * v2[y] - v1[y] * v2[x];

      for (let j = 0; j < 3; j += 1) {
        ns[3 * ind[i + j] + x] = ns[3 * ind[i + j] + x] + normals[x];
        ns[3 * ind[i + j] + y] = ns[3 * ind[i + j] + y] + normals[y];
        ns[3 * ind[i + j] + z] = ns[3 * ind[i + j] + z] + normals[z];
      }
    }

    for (let i = 0; i < vs.length; i += 3) {
      const nn = [];
      nn[x] = ns[i + x];
      nn[y] = ns[i + y];
      nn[z] = ns[i + z];

      let len = Math.sqrt(nn[x] * nn[x] + nn[y] * nn[y] + nn[z] * nn[z]);
      if (len === 0) len = 1.0;

      nn[x] = nn[x] / len;
      nn[y] = nn[y] / len;
      nn[z] = nn[z] / len;

      ns[i + x] = nn[x];
      ns[i + y] = nn[y];
      ns[i + z] = nn[z];
    }

    return ns;
  },

  configureControls(settings, options = { width: 300 }) {
    const gui = options.gui || new dat.GUI(options);
    const state = {};

    const isAction = (v) => typeof v === "function";

    const isFolder = (v) =>
      !isAction(v) &&
      typeof v === "object" &&
      (v.value === null || v.value === undefined);

    const isColor = (v) =>
      (typeof v === "string" && ~v.indexOf("#")) ||
      (Array.isArray(v) && v.length >= 3);

    Object.keys(settings).forEach((key) => {
      const settingValue = settings[key];

      if (isAction(settingValue)) {
        state[key] = settingValue;
        return gui.add(state, key);
      }
      if (isFolder(settingValue)) {
        return utils.configureControls(settingValue, {
          gui: gui.addFolder(key),
        });
      }

      const {
        value,
        min,
        max,
        step,
        options,
        onChange = () => null,
      } = settingValue;

      state[key] = value;

      let controller;

      if (options) {
        controller = gui.add(state, key, options);
      } else if (isColor(value)) {
        controller = gui.addColor(state, key);
      } else {
        controller = gui.add(state, key, min, max, step);
      }

      controller.onChange((v) => onChange(v, state));
    });
  },
};
