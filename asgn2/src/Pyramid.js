class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertices = null;
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.vertices === null) {
            // Base corners: (0,0,0), (1,0,0), (1,0,1), (0,0,1)
            // Tip: (0.5, 1.0, 0.5)
            this.vertices = new Float32Array([
                // Front side
                0,0,0,  0.5,1,0.5,  1,0,0,
                // Right side
                1,0,0,  0.5,1,0.5,  1,0,1,
                // Back side
                1,0,1,  0.5,1,0.5,  0,0,1,
                // Left side
                0,0,1,  0.5,1,0.5,  0,0,0,
                // Base (Square)
                0,0,0,  1,0,0,  1,0,1,
                0,0,0,  1,0,1,  0,0,1
            ]);
        }

        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 18);
    }
}
