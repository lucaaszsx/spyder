import type { SpyderStringFormats } from './checks/string';
import type * as util from '../utils';

export interface SpyderIssueBase {
    readonly code: string;
    readonly path: readonly PropertyKey[];
    readonly message: string;
    readonly input: unknown;
}

/** Issues */
export type SpyderExpectedType = 'string' | 'number' | 'NaN' | 'boolean';

export interface SpyderIssueInvalidType<Input = unknown> extends SpyderIssueBase {
    readonly code: 'invalid_type';
    readonly expected: SpyderExpectedType;
    readonly received: util.ParsedTypes;
    readonly input: Input;
}

export interface SpyderIssueInvalidValue<Input = unknown> extends SpyderIssueBase {
    readonly code: 'invalid_value';
    readonly expected: util.PrimitiveArray;
    readonly input: Input;
}

export interface SpyderIssueTooSmall<Input = unknown> extends SpyderIssueBase {
    readonly code: 'too_small';
    readonly minimum: number;
    readonly inclusive: boolean;
    readonly input: Input;
}

export interface SpyderIssueTooBig<Input = unknown> extends SpyderIssueBase {
    readonly code: 'too_big';
    readonly maximum: number;
    readonly inclusive: boolean;
    readonly input: Input;
}

export interface SpyderIssueInvalidLength<Input = unknown> extends SpyderIssueBase {
    readonly code: 'invalid_length';
    readonly expected: number;
    readonly input: Input;
}

export interface SpyderIssueNotFinite extends SpyderIssueBase {
    readonly code: 'not_finite';
    readonly input: number;
}

export interface SpyderIssueNotMultipleOf extends SpyderIssueBase {
    readonly code: 'not_multiple_of';
    readonly divisor: number;
    readonly input: number;
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
