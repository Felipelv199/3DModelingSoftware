var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main(){\n' +
  ' gl_FragColor = u_FragColor;\n' +
  '}\n';

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
document.querySelector('#canvas').prepend(canvas);
const gl = canvas.getContext('webgl');

function main() {
  if (!gl) {
    console.log('Failed to get the WebGL context');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }

  canvas.onmousedown = function (ev) {
    click(ev, gl, canvas);
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  draw(gl);
}

function initVertexBuffers(gl, vertices, modelMatrix, red, green, blue, alpha) {
  var n = vertices.length / 3;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get program for a_Position');
    return;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get location of u_ModelMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  gl.uniform4f(u_FragColor, red, green, blue, alpha);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  return n;
}

function setViewProjMatrices(gl) {
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get location of u_ViewMatrix');
    return;
  }
  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.0, 0.0, 1.8, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) {
    console.log('Failed to get location of u_ProjMatrix');
    return;
  }
  var projMatrix = new Matrix4();
  //projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 1.0, 2.0);
  projMatrix.setPerspective(60.0, 1.0, 0.1, 5.0);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
}

function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (var i = 0; i < models.length; i++) {
    var modelMatrix = new Matrix4();
    setViewProjMatrices(gl);
    const { g_points, g_angles, g_color, g_translate, g_scale } = models[i];

    // rotation
    modelMatrix.rotate(g_angles[0], 1, 0, 0);
    modelMatrix.rotate(g_angles[1], 0, 1, 0);
    modelMatrix.rotate(g_angles[2], 0, 0, 1);

    // translate
    modelMatrix.translate(g_translate[0], g_translate[1], g_translate[2]);

    // scale
    modelMatrix.scale(g_scale, g_scale, g_scale);

    var n = initVertexBuffers(
      gl,
      new Float32Array(g_points),
      modelMatrix,
      g_color.r / 255,
      g_color.g / 255,
      g_color.b / 255,
      g_color.t
    );
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  }
}

var models = [];
var index = 0;
function click(ev, gl, canvas) {
  if (event.buttons == 1) {
    if (models.length === 0) {
      alert('Create a model first');
      return;
    }
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    z = Number(zDeepNum.value);

    const { g_points } = models[index];

    g_points.push(x);
    g_points.push(y);
    g_points.push(z);

    draw(gl, true);
  }
}

var axisValue = 0;
const divAxis = document.querySelector('#axis');
divAxis.addEventListener('change', (e) => {
  e.preventDefault();
  axisValue = e.target.value;
  setInputsModelValues(models[index]);
});

const zDeepInput = document.querySelector('#zDeepInput');
const zDeepSpan = document.querySelector('#zDeepSpan');
const zDeepNum = document.querySelector('#zDeepNum');
zDeepInput.addEventListener('input', (e) => {
  e.preventDefault();
  zDeepNum.value = Number(e.target.value);
});
zDeepNum.addEventListener('input', (e) => {
  e.preventDefault();
  zDeepInput.value = Number(e.target.value);
});

const translateInput = document.querySelector('#translateInput');
const translateSpan = document.querySelector('#translateSpan');
const translateNum = document.querySelector('#translateNum');
translateInput.addEventListener('input', (e) => {
  e.preventDefault();
  translateNum.value = e.target.value;
  if (models[index]) {
    models[index].g_translate[axisValue] = Number(e.target.value);
    draw(gl);
  }
});
translateNum.addEventListener('input', (e) => {
  e.preventDefault();
  translateInput.value = e.target.value;
  if (models[index]) {
    models[index].g_translate[axisValue] = Number(e.target.value);
    draw(gl);
  }
});

const rotateInput = document.querySelector('#rotateInput');
const rotateSpan = document.querySelector('#rotateSpan');
const rotateNum = document.querySelector('#rotateNum');
rotateInput.addEventListener('input', (e) => {
  e.preventDefault();
  rotateNum.value = e.target.value;
  if (models[index]) {
    models[index].g_angles[axisValue] = Number(e.target.value);
    draw(gl);
  }
});
rotateNum.addEventListener('input', (e) => {
  e.preventDefault();
  rotateInput.value = e.target.value;
  if (models[index]) {
    models[index].g_angles[axisValue] = Number(e.target.value);
    draw(gl);
  }
});

const scaleInput = document.querySelector('#scaleInput');
const scaleSpan = document.querySelector('#scaleSpan');
const scaleNum = document.querySelector('#scaleNum');
scaleInput.addEventListener('input', (e) => {
  e.preventDefault();
  scaleNum.value = e.target.value;
  if (models[index]) {
    models[index].g_scale = Number(e.target.value);
    draw(gl);
  }
});
scaleNum.addEventListener('input', (e) => {
  e.preventDefault();
  scaleInput.value = e.target.value;
  if (models[index]) {
    models[index].g_scale = Number(e.target.value);
    draw(gl);
  }
});

const colorModelInput = document.querySelector('#colorModelInput');
colorModelInput.addEventListener('change', (e) => {
  e.preventDefault();
  const color = hexToRgb(e.target.value);
  models[index].g_color = { ...models[index].g_color, ...color };
  draw(gl);
});

const deleteModelButton = document.querySelector('#deleteModelButton');
const modelsContainerDiv = document.querySelector('#modelsContainer');
deleteModelButton.addEventListener('click', (e) => {
  e.preventDefault();
  models = models.filter((model, i) => i !== Number(index));
  while (modelsContainerDiv.firstChild) {
    modelsContainerDiv.removeChild(modelsContainerDiv.lastChild);
  }
  const lastIndex = models.length - 1;
  if (lastIndex !== -1) {
    models.map((model, i) => {
      model.name = `Model ${i + 1}`;
      createModelSelector(i + 1, i);
    });
    index = lastIndex;
    setInputsModelValues(models[lastIndex]);
  } else {
    setDefaultInputValues();
    alert('There are not elements to delete');
  }
  draw(gl);
});

const createModelButton = document.querySelector('#modelsButton');
createModelButton.addEventListener('click', (e) => {
  e.preventDefault();
  const modelIndex = models.length + 1;
  models.push(createNewModel(modelIndex));
  index = modelIndex - 1;
  createModelSelector(modelIndex, index);
  setInputsModelValues(models[index]);
});

const modelsDiv = document.querySelector('#models');
const modelSelectedLabel = document.querySelector('#modelSelectedLabel');
modelsDiv.addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.value && e.target.value !== 'Create Model') {
    const modelsIndex = e.target.value;
    const modelSelected = models[modelsIndex];
    setInputsModelValues(modelSelected);
    index = modelsIndex;
  }
});

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function setInputsModelValues(model) {
  const { g_angles, g_scale, g_translate, g_color, name } = model;
  rotateInput.value = g_angles[axisValue];
  rotateNum.value = g_angles[axisValue];

  scaleInput.value = g_scale;
  scaleNum.value = g_scale;

  translateInput.value = g_translate[axisValue];
  translateNum.value = g_translate[axisValue];

  const color = rgbToHex(g_color.r, g_color.g, g_color.b);
  colorModelInput.value = color;
  zDeepInput.value = 0;
  zDeepNum.value = 0;
  modelSelectedLabel.innerHTML = name;
}

function setDefaultInputValues() {
  rotateInput.value = 0;
  rotateNum.value = 0;

  scaleInput.value = 1;
  scaleNum.value = 1;

  translateInput.value = 0;
  translateNum.value = 0;

  const color = rgbToHex(0, 0, 0);
  colorModelInput.value = color;
  zDeepInput.value = 0;
  zDeepNum.value = 0;
  modelSelectedLabel.innerHTML = 'No model has been added';
}

function createModelSelector(modelIndex, indexValue) {
  const button = document.createElement('button');
  button.innerHTML = `Model ${modelIndex}`;
  button.value = indexValue;
  const modelsDiv = document.querySelector('#modelsContainer');
  modelsDiv.appendChild(button);
}

function createNewModel(i) {
  const model = {
    name: `Model ${i}`,
    g_points: [],
    g_angles: [0, 0, 0],
    g_color: { r: 255, g: 255, b: 255, t: 1 },
    g_translate: [0, 0, 0],
    g_scale: 1,
  };
  return model;
}
