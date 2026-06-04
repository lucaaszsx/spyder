import type { SpyderExpectedType, SpyderIssue } from './errors';
import * as util from '../utils';

export class SpyderSchemaPayload<Value = unknown> {
    public issues: SpyderIssue[] | null = null;
    public value: Value;

    constructor(value: Value) {
        this.value = value;
    }

    public get hasIssues(): boolean {
        return !!this.issues && this.issues.length > 0;
    }

    public issue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): void {
        if (!this.issues) this.issues = [];

        this.issues.push({ ...issue, path: null });
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

    public tooSmall(
        message: string,
        received: util.Numeric,
        minimum: util.Numeric,
        inclusive: boolean
    ): void {
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

    public tooBig(
        message: string,
        received: util.Numeric,
        maximum: util.Numeric,
        inclusive: boolean
    ): void {
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
}
