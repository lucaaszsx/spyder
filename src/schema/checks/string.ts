import type {
    WebCrapIssueStringCommonFormats,
    WebCrapIssueStringInvalidRegex,
    WebCrapIssueStringStartsWith,
    WebCrapIssueStringEndsWith,
    WebCrapIssueStringIncludes,
    WebCrapIssueInvalidLength,
    WebCrapIssueTooSmall,
    WebCrapIssueTooBig
} from '../errors';
import { type WebCrapCheckDef, type WebCrapCheckPayload, WebCrapCheck } from './base';

export interface WebCrapCheckMinLengthDef extends WebCrapCheckDef {
    kind: 'string_min_length';
    minimum: number;
    inclusive: boolean;
}

export interface WebCrapCheckMaxLengthDef extends WebCrapCheckDef {
    kind: 'string_max_length';
    maximum: number;
    inclusive: boolean;
}

export interface WebCrapCheckBetweenLengthDef extends WebCrapCheckDef {
    kind: 'string_between_length';
    minimum: number;
    maximum: number;
    minInclusive: boolean;
    maxInclusive: boolean;
}

export interface WebCrapCheckLengthEqualsDef extends WebCrapCheckDef {
    kind: 'string_length_equals';
    expected: number;
}

export type WebCrapStringFormats =
    | 'starts_with'
    | 'ends_with'
    | 'includes'
    | 'lowercase'
    | 'uppercase'
    | 'regex'
    | 'url'
    | 'slug';

export interface WebCrapCheckStringFormatDef<
    Format extends WebCrapStringFormats = WebCrapStringFormats
> extends WebCrapCheckDef {
    kind: 'string_format';
    format: Format;
    pattern?: RegExp | undefined;
}

export interface WebCrapCheckStartsWithDef extends WebCrapCheckStringFormatDef<'starts_with'> {
    prefix: string;
    caseInsensitive: boolean;
}

export interface WebCrapCheckEndsWithDef extends WebCrapCheckStringFormatDef<'ends_with'> {
    suffix: string;
    caseInsensitive: boolean;
}

export interface WebCrapCheckIncludesDef extends WebCrapCheckStringFormatDef<'includes'> {
    includes: string;
    caseInsensitive: boolean;
}

// export interface WebCrapCheckLowercaseDef extends WebCrapCheckStringFormatDef<'lowercase'> {}
// export interface WebCrapCheckUppercaseDef extends WebCrapCheckStringFormatDef<'uppercase'> {}

export interface WebCrapCheckRegexDef extends WebCrapCheckStringFormatDef<'regex'> {
    pattern: RegExp;
}

export class WebCrapCheckMinLength extends WebCrapCheck<string, WebCrapCheckMinLengthDef> {
    constructor(minimum: number, inclusive = true) {
        super({ kind: 'string_min_length', minimum, inclusive });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        const valid = this._def.inclusive
            ? payload.value.length >= this._def.minimum
            : payload.value.length > this._def.minimum;

        if (valid) return;

        payload.issues.push({
            code: 'too_small',
            path: payload.path,
            message: `Expected at least ${this._def.minimum} characters, got ${payload.value.length}`,
            minimum: this._def.minimum,
            inclusive: this._def.inclusive,
            input: payload.value
        } satisfies WebCrapIssueTooSmall);
    }
}

export class WebCrapCheckMaxLength extends WebCrapCheck<string, WebCrapCheckMaxLengthDef> {
    constructor(maximum: number, inclusive = true) {
        super({ kind: 'string_max_length', maximum, inclusive });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        const valid = this._def.inclusive
            ? payload.value.length <= this._def.maximum
            : payload.value.length < this._def.maximum;

        if (valid) return;

        payload.issues.push({
            code: 'too_big',
            path: payload.path,
            message: `Expected at most ${this._def.maximum} characters, got ${payload.value.length}`,
            maximum: this._def.maximum,
            inclusive: this._def.inclusive,
            input: payload.value
        } satisfies WebCrapIssueTooBig);
    }
}

export class WebCrapCheckBetweenLength extends WebCrapCheck<string, WebCrapCheckBetweenLengthDef> {
    constructor(minimum: number, maximum: number, minInclusive = true, maxInclusive = true) {
        super({ kind: 'string_between_length', minimum, maximum, minInclusive, maxInclusive });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        const { minInclusive, maxInclusive, minimum, maximum } = this._def;
        const len = payload.value.length;

        const tooSmall = minInclusive ? len < minimum : len <= minimum;
        const tooBig = maxInclusive ? len > maximum : len >= maximum;

        if (tooSmall)
            payload.issues.push({
                code: 'too_small',
                path: payload.path,
                message: `Expected at least ${minimum} characters, got ${len}`,
                minimum,
                inclusive: minInclusive,
                input: payload.value
            } satisfies WebCrapIssueTooSmall);

        if (tooBig)
            payload.issues.push({
                code: 'too_big',
                path: payload.path,
                message: `Expected at most ${maximum} characters, got ${len}`,
                maximum,
                inclusive: maxInclusive,
                input: payload.value
            } satisfies WebCrapIssueTooBig);
    }
}

export class WebCrapCheckLengthEquals extends WebCrapCheck<string, WebCrapCheckLengthEqualsDef> {
    constructor(expected: number) {
        super({ kind: 'string_length_equals', expected });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        if (payload.value.length === this._def.expected) return;

        payload.issues.push({
            code: 'invalid_length',
            path: payload.path,
            message: `Expected ${this._def.expected} characters, got ${payload.value.length}`,
            expected: this._def.expected,
            input: payload.value
        } satisfies WebCrapIssueInvalidLength);
    }
}

export class WebCrapCheckStartsWith extends WebCrapCheck<string, WebCrapCheckStartsWithDef> {
    constructor(prefix: string, caseInsensitive = false) {
        super({ kind: 'string_format', format: 'starts_with', prefix, caseInsensitive });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        const value = this._def.caseInsensitive ? payload.value.toLowerCase() : payload.value;
        const prefix = this._def.caseInsensitive
            ? this._def.prefix.toLowerCase()
            : this._def.prefix;

        if (value.startsWith(prefix)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected string to start with "${this._def.prefix}"`,
            format: 'starts_with',
            prefix: this._def.prefix,
            caseInsensitive: this._def.caseInsensitive,
            input: payload.value
        } satisfies WebCrapIssueStringStartsWith);
    }
}

export class WebCrapCheckEndsWith extends WebCrapCheck<string, WebCrapCheckEndsWithDef> {
    constructor(suffix: string, caseInsensitive = false) {
        super({ kind: 'string_format', format: 'ends_with', suffix, caseInsensitive });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        const value = this._def.caseInsensitive ? payload.value.toLowerCase() : payload.value;
        const suffix = this._def.caseInsensitive
            ? this._def.suffix.toLowerCase()
            : this._def.suffix;

        if (value.endsWith(suffix)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected string to end with "${this._def.suffix}"`,
            format: 'ends_with',
            suffix: this._def.suffix,
            caseInsensitive: this._def.caseInsensitive,
            input: payload.value
        } satisfies WebCrapIssueStringEndsWith);
    }
}

export class WebCrapCheckIncludes extends WebCrapCheck<string, WebCrapCheckIncludesDef> {
    constructor(includes: string, caseInsensitive = false) {
        super({ kind: 'string_format', format: 'includes', includes, caseInsensitive });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        const value = this._def.caseInsensitive ? payload.value.toLowerCase() : payload.value;
        const includes = this._def.caseInsensitive
            ? this._def.includes.toLowerCase()
            : this._def.includes;

        if (value.includes(includes)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected string to include "${this._def.includes}"`,
            format: 'includes',
            includes: this._def.includes,
            caseInsensitive: this._def.caseInsensitive,
            input: payload.value
        } satisfies WebCrapIssueStringIncludes);
    }
}

export class WebCrapCheckLowerCase extends WebCrapCheck<
    string,
    WebCrapCheckStringFormatDef<'lowercase'>
> {
    constructor() {
        super({ kind: 'string_format', format: 'lowercase' });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        if (/^[^A-Z]*$/.test(payload.value)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected only lower case characters, got "${payload.value}"`,
            format: 'lowercase',
            input: payload.value
        } satisfies WebCrapIssueStringCommonFormats);
    }
}

export class WebCrapCheckUpperCase extends WebCrapCheck<
    string,
    WebCrapCheckStringFormatDef<'uppercase'>
> {
    constructor() {
        super({ kind: 'string_format', format: 'uppercase' });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        if (/^[^a-z]*$/.test(payload.value)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected only upper case characters, got "${payload.value}"`,
            format: 'uppercase',
            input: payload.value
        } satisfies WebCrapIssueStringCommonFormats);
    }
}

export class WebCrapCheckRegex extends WebCrapCheck<string, WebCrapCheckRegexDef> {
    constructor(pattern: RegExp) {
        super({ kind: 'string_format', format: 'regex', pattern });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        if (this._def.pattern.test(payload.value)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `String does not match provided pattern`,
            format: 'regex',
            pattern: String(this._def.pattern),
            input: payload.value
        } satisfies WebCrapIssueStringInvalidRegex);
    }
}

export class WebCrapCheckUrl extends WebCrapCheck<string, WebCrapCheckStringFormatDef<'url'>> {
    constructor() {
        super({ kind: 'string_format', format: 'url' });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        if (URL.canParse(payload.value)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected a valid URL, got "${payload.value}"`,
            format: 'url',
            input: payload.value
        } satisfies WebCrapIssueStringCommonFormats);
    }
}

export class WebCrapCheckSlug extends WebCrapCheck<string, WebCrapCheckStringFormatDef<'slug'>> {
    constructor() {
        super({ kind: 'string_format', format: 'slug' });
    }

    public run(payload: WebCrapCheckPayload<string>): void {
        if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.value)) return;

        payload.issues.push({
            code: 'invalid_format',
            path: payload.path,
            message: `Expected a valid slug, got "${payload.value}"`,
            format: 'slug',
            input: payload.value
        } satisfies WebCrapIssueStringCommonFormats);
    }
}
