/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
import {WebGLShader} from "../base/helpers/WebGLShader.js";

export function connectPositionAttribute(gl, baseShaderInfo, positionBuffer) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(baseShaderInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexPosition);
}

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
export function connectColorAttribute(gl, baseShaderInfo, colorBuffer) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(baseShaderInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexColor);
}

export function initBaseShaders(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return {
        program: glslShader.shaderProgram, attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
        }, uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
        },
    };
}