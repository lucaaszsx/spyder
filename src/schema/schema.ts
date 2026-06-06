import type { SpyderCheck } from './checks/base';
import { SpyderSchemaContext } from './context';
import * as util from '../utils';
import { SpyderSchemaParsingError } from './errors';

interface SpyderSchemaTransformStep {
    kind: 'transform';
    tx: (value: unknown) => unknown;
}

interface SpyderSchemaCheckStep {
    kind: 'check';
    check: SpyderCheck<unknown>;
}

export type SpyderSchemaStep = SpyderSchemaTransformStep | SpyderSchemaCheckStep;

export interface SpyderSchemaDef {
    steps: SpyderSchemaStep[];
    hasCatch: boolean;
    catchValue?: unknown;
    innerSchema: SpyderSchemaBase<unknown> | null;
}

export interface SpyderCoerceableSchemaDef extends SpyderSchemaDef {
    coerce: boolean;
}

export abstract class SpyderSchemaBase<O> {
    declare readonly _output: O;
    _def: SpyderSchemaDef;

    constructor(innerSchema: SpyderSchemaBase<unknown> | null = null) {
        this._def = {
            steps: [],
            hasCatch: false,
            innerSchema
        };
    }

    public parse(rawValue: unknown): O {
        const ctx = new SpyderSchemaContext();
        const result = this.run(ctx, rawValue);

        if (ctx.hasIssues) {
            if (this._def.hasCatch) return this._def.catchValue as O;

            throw new SpyderSchemaParsingError(ctx.issues);
        }

        return result as O;
    }

    public run(ctx: SpyderSchemaContext, rawValue: unknown): unknown {
        let value = rawValue;

        if (this._def.innerSchema) this._def.innerSchema.run(ctx, value);
        value = this._parse(ctx, value);

        if (!ctx.hasIssues) {
            stepLoop: for (const step of this._def.steps) {
                switch (step.kind) {
                    case 'transform':
                        value = step.tx(value);
                        break;

                    case 'check':
                        step.check.run(ctx, value);
                        if (step.check.abort && ctx.hasIssues) break stepLoop;
                        break;

                    default:
                        break;
                }
            }
        }

        return value;
    }

    public catch(value: O): this {
        const clone = this._clone();
        clone._def.hasCatch = true;
        clone._def.catchValue = value;

        return clone;
    }

    protected abstract _parse(ctx: SpyderSchemaContext, value: unknown): unknown;

    protected _addCheck(check: SpyderCheck<unknown>): this {
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
        clone._def = { ...this._def, steps: [...this._def.steps] };

        return clone;
    }
}

export abstract class SpyderCoerceableSchemaBase<O> extends SpyderSchemaBase<O> {
    declare _def: SpyderCoerceableSchemaDef;

    constructor(coerce = false, innerSchema?: SpyderSchemaBase<unknown> | null) {
        super(innerSchema);

        this._def.coerce = coerce === true;
    }
}

export type Infer<T extends SpyderSchemaBase<unknown>> = T['_output'];
