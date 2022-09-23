export function randomPos() {
    return Math.ceil(Math.random() * 7) * plusOrMinus();
}

export function plusOrMinus() {
    return (Math.round(Math.random()) ? 1 : -1)
}

export function getElapsed(currentTime, renderInfo) {
    let elapsed = 0.0;
    if (renderInfo.lastTime !== 0.0)	// Først gang er lastTime = 0.0.
        elapsed = (currentTime - renderInfo.lastTime) / 1000; // Deler på 1000 for å operere med sekunder.
    renderInfo.lastTime = currentTime;						// Setter lastTime til currentTime.
    return elapsed;
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
export function clearCanvas(gl) {
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export function initKeyPress(renderInfo) {
    document.addEventListener('keyup', (event) => {
        renderInfo.currentlyPressedKeys[event.which] = false;

        if (event.keyCode === 49) {
            renderInfo.cameraControl.camera = 1
        } else if (event.keyCode === 50) {
            renderInfo.cameraControl.camera = 2
        }

        // console.log(event)
    }, false);
    document.addEventListener('keydown', (event) => {
        renderInfo.currentlyPressedKeys[event.which] = true;
        // console.log(event)
    }, false);
}

export function bindBuffer(gl, vertices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer;
}

export function UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, drawType, bufferName) {
    let modelViewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix));
    renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program)
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix.elements);
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    renderInfo.gl.drawArrays(renderInfo.gl[drawType], 0, renderInfo[bufferName].vertexCount);
}