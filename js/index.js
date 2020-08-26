var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 u_FragColor;\n' +
  'uniform mat4 u_TransformMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = u_TransformMatrix * a_Position;\n' +
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
  var gl = canvas.getContext('webgl');

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
}

function rightClick(ev, gl) {
  if (g_points[index] !== undefined) {
    index++;
  }
  if (index > 15) {
    delta += 10;
  }
  draw(gl);
}

var index = 0;
var delta = 0;
var g_points = [];
var g_colors = [];
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
    var z = 0.0;
    if (ev.ctrlKey) {
      z = -0.5;
    } else if (ev.shiftKey) {
      z = -1.0;
    }
    g_points[index].push(z);

    g_colors[index].push(Math.random());
    g_colors[index].push(Math.random());
    g_colors[index].push(Math.random());

    draw(gl);
  }
}

function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (var i = 0; i < g_points.length; i++) {
    var n = initVertexBuffers(
      gl,
      new Float32Array(g_points[i]),
      new Float32Array(g_colors[i])
    );
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  }
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

  var radian = (delta * Math.PI) / 180.0;
  var cosB = Math.cos(radian);
  var sinB = Math.sin(radian);

  var transformMatrix = new Float32Array([
    cosB,
    -sinB,
    0,
    0,
    sinB,
    cosB,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ]);
  var u_TransformMatrix = gl.getUniformLocation(
    gl.program,
    'u_TransformMatrix'
  );
  if (!u_TransformMatrix) {
    console.log('Failed to get location for u_TransformMatrix');
    return;
  }
  gl.uniformMatrix4fv(u_TransformMatrix, false, transformMatrix);

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
