var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 u_FragColor;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  ' u_FragColor = a_Color;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 u_FragColor;\n' +
  'void main(){\n' +
  ' gl_FragColor = u_FragColor;\n' +
  '}\n';

function main() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  document.querySelector('body').appendChild(canvas);
  const div = document.createElement('div');
  div.id = 'modelsAngle';
  document.querySelector('body').appendChild(div);
  const gl = canvas.getContext('webgl');

  for (let angleIndex in g_angles) {
    createInputAngleFigure(gl, angleIndex);
  }

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
  canvas.oncontextmenu = function (ev) {
    rightClick(ev, gl);
    return false;
  };
  div.addEventListener('change', (e) => {
    e.preventDefault();
    const modelId = e.target.parentElement.id;
    const angleOrient = e.target.name;
    g_angles[modelId][angleOrient] = e.target.value;
    draw(gl);
  });

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  draw(gl);
}

function rightClick(ev, gl) {
  console.log(g_points, g_colors, g_angles);
  index++;
  draw(gl);
}

function initVertexBuffers(gl, vertices, colors, n_model) {
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
  var modelMatrix = new Matrix4();
  modelMatrix.rotate(g_angles[n_model][0], 1, 0, 0);
  modelMatrix.rotate(g_angles[n_model][1], 0, 1, 0);
  modelMatrix.rotate(g_angles[n_model][2], 0, 0, 1);
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get location of u_ModelMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.0, 0.0, 3.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get location of u_ViewMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  var projMatrix = new Matrix4();
  projMatrix.setPerspective(120.0, 0.5, 0.1, 5.0);
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ProjMatrix) {
    console.log('Failed to get location of u_ProjMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get location of a_Color');
    return;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Color);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  return n;
}

function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (var i = 0; i < g_points.length; i++) {
    var n = initVertexBuffers(
      gl,
      new Float32Array(g_points[i]),
      new Float32Array(g_colors[i]),
      i
    );
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  }
}

/* var g_points = [];
var g_colors = [];
var g_angles = []; */
var g_points = [
  [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0],
];
var g_colors = [
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
];
var g_angles = [
  [0, 0, 0],
  [0, 0, 0],
];
var index = g_points.length;
function click(ev, gl, canvas) {
  if (event.buttons == 1) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    if (g_points.length <= index) {
      var arrayPoints = [];
      g_points.push(arrayPoints);
      var arrayColors = [];
      g_colors.push(arrayColors);
    }
    if (!g_angles[index]) {
      const angle = [0, 0, 0];
      g_angles.push(angle);

      createInputAngleFigure(gl, index);
    }

    g_points[index].push(x);
    g_points[index].push(y);
    g_points[index].push(0.0);

    g_colors[index].push(Math.random());
    g_colors[index].push(Math.random());
    g_colors[index].push(Math.random());

    draw(gl);
  }
}

function createInputAngleFigure(gl, i) {
  const modelsAnglesDiv = document.getElementById('modelsAngle');
  cos;
  const div = document.createElement('div');
  div.id = i;
  const labelX = document.createElement('label');
  labelX.innerHTML = 'X';
  const inputAngleX = document.createElement('input');
  inputAngleX.id = 'x';
  inputAngleX.name = '0';
  inputAngleX.type = 'number';
  inputAngleX.value = '0';
  inputAngleX.max = '360';
  inputAngleX.min = '-360';
  div.appendChild(labelX);
  div.appendChild(inputAngleX);

  const labelY = document.createElement('label');
  labelY.innerHTML = 'Y';
  const inputAngleY = document.createElement('input');
  inputAngleY.id = 'y';
  inputAngleY.name = '1';
  inputAngleY.type = 'number';
  inputAngleY.value = '0';
  inputAngleY.max = '360';
  inputAngleY.min = '-360';
  div.appendChild(labelY);
  div.appendChild(inputAngleY);

  const labelZ = document.createElement('label');
  labelZ.innerHTML = 'Z';
  const inputAngleZ = document.createElement('input');
  inputAngleZ.id = 'z';
  inputAngleZ.name = '2';
  inputAngleZ.type = 'number';
  inputAngleZ.value = '0';
  inputAngleZ.max = '360';
  inputAngleZ.min = '-360';
  div.appendChild(labelZ);
  div.appendChild(inputAngleZ);
  modelsAnglesDiv.appendChild(div);
}
