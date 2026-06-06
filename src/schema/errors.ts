import type { SpyderStringFormats } from './checks/string';
import type * as util from '../utils';

export interface SpyderIssueBase {
    readonly code: string;
    readonly path: readonly PropertyKey[];
    readonly message: string;
    readonly input: unknown;
}

/** Issues */
export type SpyderExpectedType =
    | 'string'
    | 'number'
    | 'int'
    | 'bigint'
    | 'NaN'
    | 'boolean'
    | 'array';

export interface SpyderIssueInvalidType extends SpyderIssueBase {
    readonly code: 'invalid_type';
    readonly expected: SpyderExpectedType;
    readonly received: util.ParsedTypes;
    readonly input: unknown;
}

export interface SpyderIssueInvalidValue extends SpyderIssueBase {
    readonly code: 'invalid_value';
    readonly expected: util.PrimitiveArray;
    readonly input: unknown;
}

export interface SpyderIssueTooSmall extends SpyderIssueBase {
    readonly code: 'too_small';
    readonly minimum: util.Numeric;
    readonly inclusive: boolean;
    readonly input: unknown;
}

export interface SpyderIssueTooBig extends SpyderIssueBase {
    readonly code: 'too_big';
    readonly maximum: util.Numeric;
    readonly inclusive: boolean;
    readonly input: unknown;
}

export interface SpyderIssueInvalidLength extends SpyderIssueBase {
    readonly code: 'invalid_length';
    readonly expected: number;
    readonly input: unknown;
}

export interface SpyderIssueNotFinite extends SpyderIssueBase {
    readonly code: 'not_finite';
    readonly input: number;
}

export interface SpyderIssueNotMultipleOf extends SpyderIssueBase {
    readonly code: 'not_multiple_of';
    readonly divisor: util.Numeric;
    readonly input: util.Numeric;
}

export interface SpyderIssueInvalidStringFormat extends SpyderIssueBase {
    readonly code: 'invalid_format';
    readonly format: SpyderStringFormats;
    readonly pattern?: string;
    readonly input: string;
}

export interface SpyderIssueStringCommonFormats extends SpyderIssueInvalidStringFormat {
    format: Exclude<SpyderStringFormats, 'regex' | 'starts_with' | 'ends_with' | 'includes'>;
}

export interface SpyderIssueStringStartsWith extends SpyderIssueInvalidStringFormat {
    format: 'starts_with';
    prefix: string;
    caseInsensitive: boolean;
}

export interface SpyderIssueStringEndsWith extends SpyderIssueInvalidStringFormat {
    format: 'ends_with';
    suffix: string;
    caseInsensitive: boolean;
}

export interface SpyderIssueStringIncludes extends SpyderIssueInvalidStringFormat {
    format: 'includes';
    includes: string;
    caseInsensitive: boolean;
}

export interface SpyderIssueStringInvalidRegex extends SpyderIssueInvalidStringFormat {
    format: 'regex';
    pattern: string;
}

/** Utility types */
export type SpyderStringFormatIssues =
    | SpyderIssueStringCommonFormats
    | SpyderIssueStringInvalidRegex
    | SpyderIssueStringStartsWith
    | SpyderIssueStringEndsWith
    | SpyderIssueStringIncludes;

export type SpyderIssue =
    | SpyderIssueInvalidType
    | SpyderIssueInvalidValue
    | SpyderIssueInvalidLength
    | SpyderIssueNotFinite
    | SpyderIssueNotMultipleOf
    | SpyderStringFormatIssues
    | SpyderIssueTooSmall
    | SpyderIssueTooBig;

export type SpyderIssueCode = SpyderIssue['code'];

/** Errors */
export class SpyderSchemaParsingError extends Error {
    public issues: readonly SpyderIssue[];

    constructor(issues: readonly SpyderIssue[]) {
        super('One or more errors occurred during the parsing attempt');

        this.issues = issues;
    }
}
