import {WebGLShader} from "../../base/helpers/WebGLShader.js";

export function clearCanvas(gl) {
    gl.clearColor(1, 0.97, 0.96, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


export function initBaseShaders(gl) {
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
            vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
        },
    };
}

export function connectPositionAttribute(gl, baseShaderInfo, positionBuffer) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexPosition);
}

export function connectColorAttribute(gl, baseShaderInfo, colorBuffer) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexColor);
}

/**
 * Genererer view- og projeksjonsmatrisene.
 * Disse utgjør tilsanmmen det virtuelle kameraet.
 */
export function intCamera(gl) {
    let viewMatrix = new Matrix4();

    // init projectionMatrix
    let projectionMatrix = new Matrix4();
    const fieldOfView = 45; // I grader.
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 1000.0;
    projectionMatrix.setPerspective(fieldOfView, aspect, near, far);


    // VIEW-matrisa:
    viewMatrix.setLookAt(
        -0.9,
        0,
        4,
        0.9,
        -0.2,
        0,
        0,
        1,
        0);

    return {viewMatrix: viewMatrix, projectionMatrix: projectionMatrix};
}
