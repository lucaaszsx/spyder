import type { SpyderExpectedType, SpyderIssue } from './errors';
import * as util from '../utils';

export class SpyderSchemaContext {
    public issues: SpyderIssue[] = [];
    public path: readonly PropertyKey[];

    constructor(path: readonly PropertyKey[] = []) {
        this.path = path;
    }

    public get hasIssues(): boolean {
        return !!this.issues && this.issues.length > 0;
    }

    public issue(issue: util.DistributiveOmit<SpyderIssue, 'path'>): void {
        this.issues.push({ ...issue, path: this.path });
    }

    public issueWithPath(issue: SpyderIssue): void {
        this.issues.push(issue);
    }

    public addInvalidType(
        expected: SpyderExpectedType,
        received: util.ParsedTypes,
        input: unknown
    ): void {
        this.issue({
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
        this.issues.push({
            code: 'too_small',
            message: message({
                comparator: inclusive ? 'at least' : 'more than',
                minimum: util.parsePrimitive(minimum),
                input: util.parsePrimitive(input)
            }),
            path: this.path,
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
        this.issues.push({
            code: 'too_big',
            message: message({
                comparator: inclusive ? 'at most' : 'less than',
                maximum: util.parsePrimitive(maximum),
                input: util.parsePrimitive(input)
            }),
            path: this.path,
            maximum,
            inclusive,
            input
        });
    }

    public child(key: PropertyKey): SpyderSchemaContext {
        return new SpyderSchemaContext([...this.path, key]);
    }
}
