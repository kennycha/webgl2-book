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
