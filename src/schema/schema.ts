import type { WebCrapCheck } from './checks/base';
import { WebCrapSchemaPayload } from './payload';
import * as util from '../utils';

interface WebCrapTransformStep {
    kind: 'transform';
    tx: (value: unknown) => unknown;
}

interface WebCrapCheckStep {
    kind: 'check';
    check: WebCrapCheck<unknown>;
}

export type WebCrapStep = WebCrapTransformStep | WebCrapCheckStep;

export interface WebCrapSchemaDef {
    steps: WebCrapStep[];
    hasCatch: boolean;
    catchValue?: unknown;
    innerSchema: WebCrapSchema<unknown> | null;
}

export abstract class WebCrapSchema<O> {
    declare readonly _output: O;
    readonly _def: WebCrapSchemaDef;

    constructor(innerSchema: WebCrapSchema<unknown> | null = null) {
        this._def = {
            steps: [],
            hasCatch: false,
            innerSchema
        };
    }

    public parse(rawValue: unknown): O {
        let value: unknown = rawValue;
        const payload = this._parse(new WebCrapSchemaPayload<unknown>([], value));

        if (!payload.hasIssues) {
            stepLoop: for (const step of this._def.steps) {
                switch (step.kind) {
                    case 'transform':
                        value = step.tx(value);
                        payload.value = value;
                        break;

                    case 'check':
                        step.check.run(payload);
                        if (step.check.abort && payload.hasIssues) break stepLoop;
                        break;

                    default:
                        break;
                }
            }
        }

        if (payload.hasIssues) {
            if (this._def.hasCatch) return this._def.catchValue as O;

            const err = new Error(`One or more issues found when parsing value: ${String(value)}`);
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

    protected abstract _parse(
        payload: WebCrapSchemaPayload<unknown>
    ): WebCrapSchemaPayload<unknown>;

    protected _addCheck(check: WebCrapCheck<unknown>): this {
        const clone = this._clone();
        clone._def.steps.push({ kind: 'check', check });

        return clone;
    }

    protected _addTransform(tx: (value: O) => O): this {
        const clone = this._clone();
        clone._def.steps.push({ kind: 'transform', tx: tx as (value: unknown) => unknown });

        return clone;
    }

    protected _clone(): this {
        const clone = util.shallowClone(this) as this;
        clone._def.steps = [...this._def.steps];

        return clone;
    }
}

export type Infer<T extends WebCrapSchema<unknown>> = T['_output'];
