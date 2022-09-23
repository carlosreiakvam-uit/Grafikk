import {WebGLCanvas} from "../../base/helpers/WebGLCanvas.js";
import {clearCanvas, initBaseShaders, connectPositionAttribute} from "./init.js"


export function main() {
    const webGLCanvas = new WebGLCanvas('canvas', document.body, 960, 640);
    const renderInfo = {
        gl: webGLCanvas.gl,
        baseShaderInfo: initBaseShaders(webGLCanvas.gl),
        buffer: initBuffer(webGLCanvas.gl)
    }
    draw(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.buffer)
}


function initBuffer(gl) {

    const positions = new Float32Array([
        -1, -1, 0,
        0, 1, 0,
        1, -1, 0
    ]);

    let colors = new Float32Array([
        1, 0, 0, 1,
        1, 1, 0, 1,
        1, 0, 0, 1
    ])

    // connecting buffers to gl
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return {positions: positionBuffer, colors: colorBuffer, vertexCount: positions.length / 3}
}

function draw(gl, baseShaderInfo, buffers) {
    clearCanvas(gl)
    // Aktiver shader:
    gl.useProgram(baseShaderInfo.program);


    // Kople posisjon-attributtet til tilhørende buffer:
    connectPositionAttribute(gl, baseShaderInfo, buffers.positions);
    // connectColorUniform(gl, baseShaderInfo);
    gl.drawArrays(gl.TRIANGLES, 0, buffers.vertexCount);


}




