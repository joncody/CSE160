class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertices = null;
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (this.vertices === null) {
            this.vertices = new Float32Array([
                // Front face
                0,0,0, 1,1,0, 0,1,0,  0,0,0, 1,0,0, 1,1,0,
                // Top face
                0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0,
                // Back face
                0,0,1, 0,1,1, 1,1,1,  0,0,1, 1,1,1, 1,0,1,
                // Bottom face
                0,0,0, 0,0,1, 1,0,1,  0,0,0, 1,0,1, 1,0,0,
                // Left face
                0,0,0, 0,1,0, 0,1,1,  0,0,0, 0,1,1, 0,0,1,
                // Right face
                1,0,0, 1,1,0, 1,1,1,  1,0,0, 1,1,1, 1,0,1
            ]);
        }

        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        // Note: Use 3 for 3D coordinates (x,y,z)
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}
