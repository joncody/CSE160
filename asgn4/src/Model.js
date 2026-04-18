class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.isFullyLoaded = false;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.numVertices = 0;
        this.getFileContent(gl);
    }

    parseModel(gl, fileContent) {
        const lines = fileContent.split(/\r?\n/);
        const allVertices = [];
        const allNormals = [];
        const unpackedVerts = [];
        const unpackedNormals = [];

        for (let line of lines) {
            const tokens = line.trim().split(/\s+/);
            if (tokens[0] === "v") {
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] === "vn") {
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] === "f") {
                for (let i = 1; i <= 3; i++) {
                    const parts = tokens[i].split("/");
                    const vIdx = (parseInt(parts[0]) - 1) * 3;
                    unpackedVerts.push(allVertices[vIdx], allVertices[vIdx + 1], allVertices[vIdx + 2]);

                    let nIdx = -1;
                    if (parts.length === 3) {
                        nIdx = (parseInt(parts[2]) - 1) * 3;
                    } else if (parts.length === 2 && tokens[i].includes("//")) {
                        nIdx = (parseInt(parts[1]) - 1) * 3;
                    }

                    if (nIdx >= 0 && allNormals.length > nIdx) {
                        unpackedNormals.push(allNormals[nIdx], allNormals[nIdx + 1], allNormals[nIdx + 2]);
                    } else {
                        unpackedNormals.push(0, 1, 0);
                    }
                }
            }
        }

        this.numVertices = unpackedVerts.length / 3;
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedVerts), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedNormals), gl.STATIC_DRAW);

        this.isFullyLoaded = true;
    }

    render(gl) {
        if (!this.isFullyLoaded) {
            return;
        }

        gl.uniform1i(u_whichTexture, -2);
        gl.uniform4fv(u_FragColor, this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const nm = new Matrix4();
        nm.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, nm.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }

    async getFileContent(gl) {
        try {
            const response = await fetch(this.filePath);
            const text = await response.text();
            this.parseModel(gl, text);
        } catch (e) {
            console.error("OBJ Error:", e);
        }
    }
}
