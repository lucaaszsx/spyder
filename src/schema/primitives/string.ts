import { WebCrapType } from '../type';

export class WebCrapString<T = unknown> extends WebCrapType<T> {
    public min(): this {
        return this;
    }

    public max(): this {
        return this;
    }

    public between(): this {
        return this;
    }

    public length(): this {
        return this;
    }

    public startsWith(): this {
        return this;
    }

    public endsWith(): this {
        return this;
    }

    public includes(): this {
        return this;
    }

    public uppercase(): this {
        return this;
    }

    public lowercase(): this {
        return this;
    }

    public httpUrl(): this {
        return this;
    }

    public url(): this {
        return this;
    }

    public uuid(): this {
        return this;
    }

    /**public parse(context: unknown): T {
        
    }*/
}
