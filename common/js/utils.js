"use strict";

const utils = {
  // Find and return a DOM element given an ID
  getCanvas(id) {
    const canvas = document.getElementById(id);

    if (!canvas) {
      console.error(`There is no canvas with id ${id} on this page.`);
      return null;
    }

    return canvas;
  },

  // Given a canvas element, return the WebGL2 context
  getGLContext(canvas) {
    return (
      canvas.getContext("webgl2") ||
      console.error("WebGL2 is not available in your browser.")
    );
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
