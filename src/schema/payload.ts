import type { SpyderExpectedType, SpyderIssue } from './errors';
import * as util from '../utils';

export class SpyderSchemaPayload<Value = unknown> {
    public readonly issues: SpyderIssue[] = [];
    public readonly path: readonly PropertyKey[];
    public value: Value;

    constructor(path: PropertyKey[], value: Value) {
        this.path = path;
        this.value = value;
    }

    public get hasIssues(): boolean {
        return this.issues.length > 0;
    }

    public issue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): void {
        this.issues.push(this._createIssue(issue));
    }

    public invalidType(expected: SpyderExpectedType, received: util.ParsedTypes): void {
        this.issue({
            code: 'invalid_type',
            message: `Expected a value of type ${expected}, received ${received}`,
            expected,
            received,
            input: this.value
        });
    }

    public tooSmall(message: string, received: number, minimum: number, inclusive: boolean): void {
        this.issue({
            code: 'too_small',
            message: util.replacePlaceholders(message, {
                comparator: inclusive ? 'at least' : 'more than',
                received,
                minimum
            }),
            minimum,
            inclusive,
            input: this.value
        });
    }

    public tooBig(message: string, received: number, maximum: number, inclusive: boolean): void {
        this.issue({
            code: 'too_big',
            message: util.replacePlaceholders(message, {
                comparator: inclusive ? 'at most' : 'less than',
                received,
                maximum
            }),
            maximum,
            inclusive,
            input: this.value
        });
    }

    private _createIssue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): SpyderIssue {
        return { ...issue, path: this.path };
    }
}
