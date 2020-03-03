export default class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    inverse(): Vector {
        return new Vector(-this.x, -this.y);
    }

    add(vector: Vector): Vector {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector: Vector): Vector {
        return this.add(vector.inverse());
    }
    multiply(amount: number): Vector {
        return new Vector(this.x * amount, this.y * amount);
    }
    divide(amount: number) : Vector{
        if (amount === 0) {
            try {
                throw "Can't divide by zero";
            } catch(e) {
                console.error(e);
                return this;
            }
        }
        return this.multiply(1 / amount);
    }
    magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }
    truncate(amount: number): Vector {
        return this.normalize().multiply(amount);
    }
    normalize(): Vector {
        return this.divide(this.magnitude());
    }

    toString(): string {
        return `[${this.x}, ${this.y}]`
    }
}