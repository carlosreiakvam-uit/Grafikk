import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';

/**
 * Et WebGL-program som tegner en enkel trekant.
 * Bruker ikke klasser, kun funksjoner.
 */
export function main() {
    // Oppretter et canvas for WebGL-tegning:
    const canvas = new WebGLCanvas('myCanvas', document.body, 650, 650);
    const gl = canvas.gl;
    let baseShaderInfo = initBaseShaders(gl);
    let buffers = initBuffers(gl);
    draw(gl, baseShaderInfo, buffers);
}

function initBaseShaders(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return {
        program: glslShader.shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor')
        }
    };
}

/**
 * Oppretter verteksbuffer for trekanten.
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initBuffers(gl) {

    const cartesianColors = new Float32Array([
        1, 0, 0, 1, // x
        0, 1, 0, 1, // x
        0, 0, 1, 1, // y
        1, 0, 0, 1, // y
        1, 0, 0, 1, //cart 1
        0, 1, 1, 1, //cart 1
        1, 0, 1, 1, //cart 1
        1, 0, 0, 1, //cart 2
        1, 0, 0, 1, //cart 2
        1, 1, 0, 1, //cart 2
        1, 0, 0, 1, //cart 3
        1, 0, 1, 1, //cart 3
        0, 1, 0, 1, //cart 3
        1, 0, 0, 1, //cart 4
        1, 1, 0, 1, //cart 4
        1, 0, 0, 1, //cart 4
        1, 0, 0, 1, //
        1, 1, 0, 1, //
        1, 0, 1, 1, //
        1, 0, 1, 1, //
        1, 0, 1, 1, //
        1, 0, 0, 1, //
        1, 0, 0, 1, //
        1, 1, 0, 1, //
        1, 1, 1, 1, //
        1, 0, 1, 1, //
        1, 0, 1, 1, //
        1, 1, 0, 1, //
        1, 0, 1, 1, //
        1, 1, 0, 1, //
    ])


    const cartesianPositions = new Float32Array([
        -0.75, 0.0, 0, //x
        0.75, 0, 0,  // x
        0, -0.75, 0,   // y
        0, 0.75, 0,      // y
        0, 0.75, 0,  // cartesian arrow 1
        -0.02, 0.70, 0,  // cartesian arrow 1
        0.02, 0.70, 0,  // cartesian arrow 1
        0, -0.75, 0,  // cartesian arrow 2
        -0.02, -0.70, 0,  // cartesian arrow 2
        0.02, -0.70, 0,  // cartesian arrow 2
        -0.70, 0.02, 0,  // cartesian arrow 3
        -0.75, 0, 0,  // cartesian arrow 3
        -0.70, -0.02, 0,  // cartesian arrow 3
        0.73, 0.03, 0,  // cartesian arrow 4
        0.75, 0, 0,  // cartesian arrow 4
        0.73, -0.03, 0,  // cartesian arrow 4
        // large triangle
        -0.4, -0.15, 0, // down left
        0.3, -0.15, 0, // down right
        -0.4, 0.15, 0, // top
        0.3, 0.15, 0, // connecting stripe
        //wing_top
        -0.55, 0.15, 0,
        -0.4, 0, 0,
        -0.4, 0.15, 0,
        // wing lower
        -0.55, -0.15, 0,
        -0.4, 0, 0,
        -0.4, -0.15, 0,
        // pointer
        0.3, 0.25, 0,
        0.55, 0, 0,
        0.3, -0.25, 0,

    ]);


    const positionBuffer = gl.createBuffer();
    // Kopler til
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Fyller
    gl.bufferData(gl.ARRAY_BUFFER, cartesianPositions, gl.STATIC_DRAW);

    // samme for fargebuffer
    const cartesianColorBuffer = gl.createBuffer()
    const arrowColorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cartesianColorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, cartesianColors, gl.STATIC_DRAW);

    // Kopler fra
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    return {
        position: positionBuffer,
        color: cartesianColorBuffer,
        vertexCount: cartesianPositions.length / 4
    };
}

/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
function connectPositionAttribute(gl, baseShaderInfo, positionBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexPosition);
}

function connectColorAttribute(gl, baseShaderInfo, colorBuffer) {
    let ape = 'gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexColor'
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexColor);
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


/**
 * Tegner!
 */
function draw(gl, baseShaderInfo, buffers) {
    clearCanvas(gl);

    // Aktiver shader:
    gl.useProgram(baseShaderInfo.program);

    // Kople posisjon-attributtet til tilhørende buffer:
    connectPositionAttribute(gl, baseShaderInfo, buffers.position);
    // Kople til farge :
    connectColorAttribute(gl, baseShaderInfo, buffers.color)
    // Tegn!
    gl.drawArrays(gl.LINES, 0, 4);
    gl.drawArrays(gl.TRIANGLES, 4, 12); // cartesian arrows
    gl.drawArrays(gl.TRIANGLE_STRIP, 16, 4); // block
    gl.drawArrays(gl.TRIANGLES, 20, 9); // wings
}
