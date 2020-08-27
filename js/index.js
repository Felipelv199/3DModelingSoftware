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

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
document.querySelector('body').appendChild(canvas);
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
  canvas.oncontextmenu = function (ev) {
    rightClick(ev, gl);
    return false;
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  draw(gl);
}

function rightClick(ev, gl) {
  index++;
  angle += 10.0;
  draw(gl);
}

function initVertexBuffers(gl, vertices, colors) {
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
  modelMatrix.rotate(angle, 0, 0, 1);
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
      new Float32Array(g_colors[i])
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }
}

var angle = 0.0;
var g_points = [[0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0]];
var index = g_points.length;
var g_colors = [[1, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1, 1, 0.5, 1]];
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

    g_points[index].push(x);
    g_points[index].push(y);
    g_points[index].push(0.0);

    g_colors[index].push(Math.random());
    g_colors[index].push(Math.random());
    g_colors[index].push(Math.random());

    draw(gl);
  }
}
