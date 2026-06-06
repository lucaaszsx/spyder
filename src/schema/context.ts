import type { SpyderExpectedType, SpyderIssue } from './errors';
import * as util from '../utils';

export class SpyderSchemaContext {
    private readonly _issues: SpyderIssue[] = [];
    private readonly _parent: SpyderSchemaContext | null;
    private readonly _key: PropertyKey | null;

    constructor(parent: SpyderSchemaContext | null = null, key: PropertyKey | null = null) {
        this._parent = parent;
        this._key = key;
    }

    public get hasIssues(): boolean {
        return !!this._issues && this._issues.length > 0;
    }

    public get fullPath(): readonly PropertyKey[] {
        return [...(this._parent?.fullPath || []), ...(this._key != null ? [this._key] : [])];
    }

    public get issues(): readonly SpyderIssue[] {
        return this._issues;
    }

    public addIssue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): void {
        this._issues.push({ ...issue, path: this.fullPath });
    }

    public addInvalidType(
        expected: SpyderExpectedType,
        received: util.ParsedTypes,
        input: unknown
    ): void {
        this.addIssue({
            code: 'invalid_type',
            message: `Expected a value of type ${expected}, received ${received}`,
            expected,
            received,
            input
        });
    }

    public addTooSmall(
        message: (params: { comparator: string; minimum: string; input: string }) => string,
        input: unknown,
        minimum: util.Numeric,
        inclusive: boolean
    ): void {
        this.addIssue({
            code: 'too_small',
            message: message({
                comparator: inclusive ? 'at least' : 'more than',
                minimum: util.parsePrimitive(minimum),
                input: util.parsePrimitive(input)
            }),
            minimum,
            inclusive,
            input
        });
    }

    public addTooBig(
        message: (params: { comparator: string; maximum: string; input: string }) => string,
        input: unknown,
        maximum: util.Numeric,
        inclusive: boolean
    ): void {
        this.addIssue({
            code: 'too_big',
            message: message({
                comparator: inclusive ? 'at most' : 'less than',
                maximum: util.parsePrimitive(maximum),
                input: util.parsePrimitive(input)
            }),
            maximum,
            inclusive,
            input
        });
    }

    public child(key: PropertyKey): SpyderSchemaContext {
        return new SpyderSchemaContext(this, key);
    }

    public merge(child: SpyderSchemaContext): void {
        this._issues.push(...child.issues);
    }
}
