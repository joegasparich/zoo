import { IPoint, Point } from "pixi.js";
import { lerp } from "engine/helpers/math";
import * as Planck from "planck-js";

export default class Vector {
    public x: number;
    public y: number;

    public constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y ?? x;
    }

    public inverse(): Vector {
        return new Vector(-this.x, -this.y);
    }

    public add(vector: Vector): Vector {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    public subtract(vector: Vector): Vector {
        return this.add(vector.inverse());
    }
    public multiply(amount: number): Vector {
        return new Vector(this.x * amount, this.y * amount);
    }
    public divide(amount: number): Vector{
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
    public magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    public truncate(amount: number): Vector {
        return this.normalize().multiply(amount);
    }
    public normalize(): Vector {
        if (this.magnitude() === 0) return this;
        return this.divide(this.magnitude());
    }
    public round(): Vector {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }
    public floor(): Vector {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
    public ceil(): Vector {
        return new Vector(Math.ceil(this.x), Math.ceil(this.y));
    }

    public equals(vector: Vector): boolean {
        return this.x == vector.x && this.y == vector.y;
    }

    public toString(): string {
        return `[${this.x}, ${this.y}]`;
    }

    public toPoint(): Point {
        return new Point(this.x, this.y);
    }

    public toVec2(): Planck.Vec2 {
        return new Planck.Vec2(this.x, this.y);
    }

    public static Distance(vectorA: Vector, vectorB: Vector): number {
        return vectorA.subtract(vectorB).magnitude();
    }

    public static Lerp(startPos: Vector, endPos: Vector, amount: number): Vector {
        return new Vector(
            lerp(startPos.x, endPos.x, amount),
            lerp(startPos.y, endPos.y, amount),
        );
    }

    public static FromPoint(point: Point): Vector {
        return new Vector(point.x, point.y);
    }

    public static FromVec2(vec2: Planck.Vec2): Vector {
        return new Vector(vec2.x, vec2.y);
    }

    public static Zero = new Vector(0, 0);
}
