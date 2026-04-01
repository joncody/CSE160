class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        let d = this.size / 200.0;
        let step = 360 / this.segments;
        for (let i = 0; i < 360; i += step) {
            let a1 = i * Math.PI / 180;
            let a2 = (i + step) * Math.PI / 180;
            drawTriangle([
                this.position[0], this.position[1],
                this.position[0] + Math.cos(a1) * d, this.position[1] + Math.sin(a1) * d,
                this.position[0] + Math.cos(a2) * d, this.position[1] + Math.sin(a2) * d
            ]);
        }
    }
}
