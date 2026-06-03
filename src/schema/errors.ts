import type { WebCrapStringFormats } from './checks/string';
import type * as util from '../utils';

export interface WebCrapIssueBase {
    readonly code: string;
    readonly path: PropertyKey[];
    readonly message: string;
    readonly input?: unknown;
}

/** Issues */
export type WebCrapExpectedType =
    | 'string'
    | 'number'
    | 'int'
    | 'boolean'
    | 'date'
    | 'url'
    | 'array'
    | 'object'
    | 'null'
    | 'undefined'
    | 'never';

export interface WebCrapIssueInvalidType<Input = unknown> extends WebCrapIssueBase {
    readonly code: 'invalid_type';
    readonly expected: WebCrapExpectedType;
    readonly received: util.ParsedTypes;
    readonly input?: Input;
}

export interface WebCrapIssueTooSmall<Input = unknown> extends WebCrapIssueBase {
    readonly code: 'too_small';
    readonly minimum: number;
    readonly inclusive: boolean;
    readonly input?: Input;
}

export interface WebCrapIssueTooBig<Input = unknown> extends WebCrapIssueBase {
    readonly code: 'too_big';
    readonly maximum: number;
    readonly inclusive: boolean;
    readonly input?: Input;
}

export interface WebCrapIssueInvalidLength<Input = unknown> extends WebCrapIssueBase {
    readonly code: 'invalid_length';
    readonly expected: number;
    readonly input?: Input;
}

export interface WebCrapIssueInvalidStringFormat extends WebCrapIssueBase {
    readonly code: 'invalid_format';
    readonly format: WebCrapStringFormats;
    readonly pattern?: string;
    readonly input?: string;
}

export interface WebCrapIssueStringCommonFormats extends WebCrapIssueInvalidStringFormat {
    format: Exclude<WebCrapStringFormats, 'regex' | 'starts_with' | 'ends_with' | 'includes'>;
}

export interface WebCrapIssueStringStartsWith extends WebCrapIssueInvalidStringFormat {
    format: 'starts_with';
    prefix: string;
    caseInsensitive: boolean;
}

export interface WebCrapIssueStringEndsWith extends WebCrapIssueInvalidStringFormat {
    format: 'ends_with';
    suffix: string;
    caseInsensitive: boolean;
}

export interface WebCrapIssueStringIncludes extends WebCrapIssueInvalidStringFormat {
    format: 'includes';
    includes: string;
    caseInsensitive: boolean;
}

export interface WebCrapIssueStringInvalidRegex extends WebCrapIssueInvalidStringFormat {
    format: 'regex';
    pattern: string;
}

/** Utility types */
export type WebCrapStringFormatIssues =
    | WebCrapIssueStringCommonFormats
    | WebCrapIssueStringInvalidRegex
    | WebCrapIssueStringStartsWith
    | WebCrapIssueStringEndsWith
    | WebCrapIssueStringIncludes;

export type WebCrapIssue =
    | WebCrapIssueInvalidType
    | WebCrapIssueInvalidLength
    | WebCrapStringFormatIssues
    | WebCrapIssueTooSmall
    | WebCrapIssueTooBig;

export type WebCrapIssueCode = WebCrapIssue['code'];
