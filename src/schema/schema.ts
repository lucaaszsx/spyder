import type { WebCrapCheck, WebCrapCheckPayload } from './checks/base';

export interface WebCrapSchemaDef {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checks: WebCrapCheck<any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transforms: ((value: any) => any)[];
    hasCatch: boolean;
    catchValue?: unknown;
}

export abstract class WebCrapSchema<O> {
    declare readonly _output: O;
    readonly _def: WebCrapSchemaDef;

    constructor() {
        this._def = {
            checks: [],
            transforms: [],
            hasCatch: false
        };
    }

    public parse(rawValue: O): O {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = rawValue;

        for (const transform of this._def.transforms)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value = transform(value);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const payload: WebCrapCheckPayload<O> = { path: [], issues: [], value };

        for (const check of this._def.checks) check.run(payload);

        if (payload.issues.length > 0) {
            if (this._def.hasCatch) return this._def.catchValue;

            const err = new Error(
                `One or more issues found when parsing value: ${value as string}`
            );
            Object.assign(err, { issues: payload.issues });

            throw err;
        }

        return value as O;
    }

    public catch(value: O): this {
        const clone = this._clone();
        clone._def.hasCatch = true;
        clone._def.catchValue = value;

        return clone;
    }

    protected _addCheck(checker: WebCrapCheck<unknown>): this {
        const clone = this._clone();
        clone._def.checks.push(checker);

        return clone;
    }

    protected _addTransform(transformer: (value: O) => O): this {
        const clone = this._clone();
        clone._def.transforms.push(transformer);

        return clone;
    }

    protected _clone(): this {
        const proto = Object.getPrototypeOf(this) as object;
        const next = Object.create(proto) as this;

        Object.assign(next, {
            _def: {
                ...this._def,
                checks: [...this._def.checks],
                transforms: [...this._def.transforms]
            }
        });

        return next;
    }
}

export type Infer<T extends WebCrapSchema<unknown>> = T['_output'];
