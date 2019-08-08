
/* global ModelViewer */

// How webpack exports to the web.
window.ModelViewer = ModelViewer.default;

const glMatrix = ModelViewer.common.glMatrix;
const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;
const handlers = ModelViewer.viewer.handlers;

window.vec3 = vec3;
window.quat = quat;
window.handlers = handlers;
