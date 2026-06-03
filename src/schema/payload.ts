import type { SpyderExpectedType, SpyderIssue } from './errors';
import type * as util from '../utils';

export class SpyderSchemaPayload<Value = unknown> {
    public readonly issues: SpyderIssue[];
    public readonly path: PropertyKey[];
    public value: Value;

    constructor(path: PropertyKey[], value: Value) {
        this.issues = [];
        this.path = path;
        this.value = value;
    }

    public get hasIssues(): boolean {
        return this.issues.length > 0;
    }

    public addIssue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): void {
        this.issues.push(this._createIssue(issue));
    }

    public addInvalidTypeIssue(expected: SpyderExpectedType, received: util.ParsedTypes): void {
        this.addIssue({
            code: 'invalid_type',
            message: `Expected a value of type ${expected}, received ${received}`,
            expected,
            received
        });
    }

    private _createIssue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): SpyderIssue {
        return { ...issue, path: this.path };
    }
}
