class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.buffer = null;
        this.vertices = null;
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniform1f(u_Size, this.size);

        if (this.vertices === null) {
            let d = this.size / 200.0;
            this.vertices = new Float32Array([
                this.position[0], this.position[1],
                this.position[0] + d, this.position[1],
                this.position[0], this.position[1] + d
            ]);
        }

        if (this.buffer === null) this.buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

// Specialized Triangle class for shapes with unique coordinates
class CustomTriangle {
    constructor(vertices, color) {
        this.vertices = new Float32Array(vertices);
        this.color = color;
        this.buffer = null;
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        if (this.buffer === null) this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
    }
}
