import {WebGLShader} from "../../base/helpers/WebGLShader.js";

export function clearCanvas(gl) {
    gl.clearColor(0.7, 0.9, 0.9, 1);  // Clear screen farge.
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
        }
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

