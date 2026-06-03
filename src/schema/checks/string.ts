import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaPayload } from '../payload';
import * as util from '../../utils';

export interface SpyderCheckMinLengthDef extends SpyderCheckDef {
    kind: 'string_min_length';
    minimum: number;
    inclusive: boolean;
}

export interface SpyderCheckMaxLengthDef extends SpyderCheckDef {
    kind: 'string_max_length';
    maximum: number;
    inclusive: boolean;
}

export interface SpyderCheckBetweenLengthDef extends SpyderCheckDef {
    kind: 'string_between_length';
    minimum: number;
    maximum: number;
    minInclusive: boolean;
    maxInclusive: boolean;
}

export interface SpyderCheckLengthEqualsDef extends SpyderCheckDef {
    kind: 'string_length_equals';
    expected: number;
}

export type SpyderStringFormats =
    | 'starts_with'
    | 'ends_with'
    | 'includes'
    | 'lowercase'
    | 'uppercase'
    | 'regex'
    | 'url'
    | 'slug';

export interface SpyderCheckStringFormatDef<
    Format extends SpyderStringFormats = SpyderStringFormats
> extends SpyderCheckDef {
    kind: 'string_format';
    format: Format;
    pattern?: RegExp | undefined;
}

export interface SpyderCheckStartsWithDef extends SpyderCheckStringFormatDef<'starts_with'> {
    prefix: string;
    caseInsensitive: boolean;
}

export interface SpyderCheckEndsWithDef extends SpyderCheckStringFormatDef<'ends_with'> {
    suffix: string;
    caseInsensitive: boolean;
}

export interface SpyderCheckIncludesDef extends SpyderCheckStringFormatDef<'includes'> {
    includes: string;
    caseInsensitive: boolean;
}

// export interface SpyderCheckLowercaseDef extends SpyderCheckStringFormatDef<'lowercase'> {}
// export interface SpyderCheckUppercaseDef extends SpyderCheckStringFormatDef<'uppercase'> {}

export interface SpyderCheckRegexDef extends SpyderCheckStringFormatDef<'regex'> {
    pattern: RegExp;
}

// export interface SpyderCheckSlugDef extends SpyderCheckStringFormatDef<'slug'> {}

export class SpyderCheckMinLength extends SpyderCheck<string, SpyderCheckMinLengthDef> {
    constructor(minimum: number, inclusive = true, abort = false) {
        super({ kind: 'string_min_length', minimum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        const valid = this._def.inclusive
            ? payload.value.length >= this._def.minimum
            : payload.value.length > this._def.minimum;

        if (valid) return;

        payload.addIssue({
            code: 'too_small',
            message: `Expected at least ${this._def.minimum} characters, got ${payload.value.length}`,
            minimum: this._def.minimum,
            inclusive: this._def.inclusive,
            input: payload.value
        });
    }
}

export class SpyderCheckMaxLength extends SpyderCheck<string, SpyderCheckMaxLengthDef> {
    constructor(maximum: number, inclusive = true, abort = false) {
        super({ kind: 'string_max_length', maximum, inclusive, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        const valid = this._def.inclusive
            ? payload.value.length <= this._def.maximum
            : payload.value.length < this._def.maximum;

        if (valid) return;

        payload.addIssue({
            code: 'too_big',
            message: `Expected at most ${this._def.maximum} characters, got ${payload.value.length}`,
            maximum: this._def.maximum,
            inclusive: this._def.inclusive,
            input: payload.value
        });
    }
}

export class SpyderCheckBetweenLength extends SpyderCheck<string, SpyderCheckBetweenLengthDef> {
    constructor(
        minimum: number,
        maximum: number,
        minInclusive = true,
        maxInclusive = true,
        abort = false
    ) {
        super({
            kind: 'string_between_length',
            minimum,
            maximum,
            minInclusive,
            maxInclusive,
            abort
        });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        const { minInclusive, maxInclusive, minimum, maximum } = this._def;
        const len = payload.value.length;

        const tooSmall = minInclusive ? len < minimum : len <= minimum;
        const tooBig = maxInclusive ? len > maximum : len >= maximum;

        if (tooSmall)
            payload.addIssue({
                code: 'too_small',
                message: `Expected at least ${minimum} characters, got ${len}`,
                minimum,
                inclusive: minInclusive,
                input: payload.value
            });

        if (tooBig)
            payload.addIssue({
                code: 'too_big',
                message: `Expected at most ${maximum} characters, got ${len}`,
                maximum,
                inclusive: maxInclusive,
                input: payload.value
            });
    }
}

export class SpyderCheckLengthEquals extends SpyderCheck<string, SpyderCheckLengthEqualsDef> {
    constructor(expected: number, abort = false) {
        super({ kind: 'string_length_equals', expected, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        if (payload.value.length === this._def.expected) return;

        payload.addIssue({
            code: 'invalid_length',
            message: `Expected ${this._def.expected} characters, got ${payload.value.length}`,
            expected: this._def.expected,
            input: payload.value
        });
    }
}

export class SpyderCheckStartsWith extends SpyderCheck<string, SpyderCheckStartsWithDef> {
    constructor(prefix: string, caseInsensitive = false, abort = false) {
        super({ kind: 'string_format', format: 'starts_with', prefix, caseInsensitive, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        const value = this._def.caseInsensitive ? payload.value.toLowerCase() : payload.value;
        const prefix = this._def.caseInsensitive
            ? this._def.prefix.toLowerCase()
            : this._def.prefix;

        if (value.startsWith(prefix)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected string to start with "${this._def.prefix}"`,
            format: 'starts_with',
            prefix: this._def.prefix,
            caseInsensitive: this._def.caseInsensitive,
            input: payload.value
        });
    }
}

export class SpyderCheckEndsWith extends SpyderCheck<string, SpyderCheckEndsWithDef> {
    constructor(suffix: string, caseInsensitive = false, abort = false) {
        super({ kind: 'string_format', format: 'ends_with', suffix, caseInsensitive, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        const value = this._def.caseInsensitive ? payload.value.toLowerCase() : payload.value;
        const suffix = this._def.caseInsensitive
            ? this._def.suffix.toLowerCase()
            : this._def.suffix;

        if (value.endsWith(suffix)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected string to end with "${this._def.suffix}"`,
            format: 'ends_with',
            suffix: this._def.suffix,
            caseInsensitive: this._def.caseInsensitive,
            input: payload.value
        });
    }
}

export class SpyderCheckIncludes extends SpyderCheck<string, SpyderCheckIncludesDef> {
    constructor(includes: string, caseInsensitive = false, abort = false) {
        super({ kind: 'string_format', format: 'includes', includes, caseInsensitive, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        const value = this._def.caseInsensitive ? payload.value.toLowerCase() : payload.value;
        const includes = this._def.caseInsensitive
            ? this._def.includes.toLowerCase()
            : this._def.includes;

        if (value.includes(includes)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected string to include "${this._def.includes}"`,
            format: 'includes',
            includes: this._def.includes,
            caseInsensitive: this._def.caseInsensitive,
            input: payload.value
        });
    }
}

export class SpyderCheckLowerCase extends SpyderCheck<
    string,
    SpyderCheckStringFormatDef<'lowercase'>
> {
    constructor(abort = false) {
        super({ kind: 'string_format', format: 'lowercase', abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        if (util.makeRegexTest('lowercase', payload.value)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected only lower case characters, got "${payload.value}"`,
            format: 'lowercase',
            input: payload.value
        });
    }
}

export class SpyderCheckUpperCase extends SpyderCheck<
    string,
    SpyderCheckStringFormatDef<'uppercase'>
> {
    constructor(abort = false) {
        super({ kind: 'string_format', format: 'uppercase', abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        if (util.makeRegexTest('uppercase', payload.value)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected only upper case characters, got "${payload.value}"`,
            format: 'uppercase',
            input: payload.value
        });
    }
}

export class SpyderCheckRegex extends SpyderCheck<string, SpyderCheckRegexDef> {
    constructor(pattern: RegExp, abort = false) {
        super({ kind: 'string_format', format: 'regex', pattern, abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        if (this._def.pattern.test(payload.value)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `String does not match provided pattern`,
            format: 'regex',
            pattern: String(this._def.pattern),
            input: payload.value
        });
    }
}

export class SpyderCheckUrl extends SpyderCheck<string, SpyderCheckStringFormatDef<'url'>> {
    constructor(abort = false) {
        super({ kind: 'string_format', format: 'url', abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        if (URL.canParse(payload.value)) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected a valid URL, got "${payload.value}"`,
            format: 'url',
            input: payload.value
        });
    }
}

export class SpyderCheckSlug extends SpyderCheck<string, SpyderCheckStringFormatDef<'slug'>> {
    constructor(abort = false) {
        super({ kind: 'string_format', format: 'slug', abort });
    }

    public run(payload: SpyderSchemaPayload<string>): void {
        if (util.slugify(payload.value) === payload.value) return;

        payload.addIssue({
            code: 'invalid_format',
            message: `Expected a valid slug, got "${payload.value}"`,
            format: 'slug',
            input: payload.value
        });
    }
}
