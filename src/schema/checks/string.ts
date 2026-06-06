import { type SpyderCheckDef, SpyderCheck } from './base';
import type { SpyderSchemaContext } from '../context';
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

    public run(ctx: SpyderSchemaContext, value: string): void {
        const { minimum, inclusive } = this._def;
        const len = value.length;
        if (inclusive ? len >= minimum : len > minimum) return;

        ctx.addTooSmall(
            ({ comparator, minimum, input }) =>
                `Expected ${comparator} ${minimum} characters, got ${input}`,
            len,
            minimum,
            inclusive
        );
    }
}

export class SpyderCheckMaxLength extends SpyderCheck<string, SpyderCheckMaxLengthDef> {
    constructor(maximum: number, inclusive = true, abort = false) {
        super({ kind: 'string_max_length', maximum, inclusive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        const { maximum, inclusive } = this._def;
        const len = value.length;
        if (inclusive ? len <= maximum : len < maximum) return;

        ctx.addTooBig(
            ({ comparator, maximum, input }) =>
                `Expected ${comparator} ${maximum} characters, got ${input}`,
            len,
            maximum,
            inclusive
        );
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

    public run(ctx: SpyderSchemaContext, value: string): void {
        const { minInclusive, maxInclusive, minimum, maximum, abort } = this._def;

        new SpyderCheckMinLength(minimum, minInclusive, abort).run(ctx, value);
        new SpyderCheckMaxLength(maximum, maxInclusive, abort).run(ctx, value);
    }
}

export class SpyderCheckLengthEquals extends SpyderCheck<string, SpyderCheckLengthEqualsDef> {
    constructor(expected: number, abort = false) {
        super({ kind: 'string_length_equals', expected, abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        if (value.length === this._def.expected) return;

        ctx.issue({
            code: 'invalid_length',
            message: `Expected ${this._def.expected} characters, got ${value.length}`,
            expected: this._def.expected,
            input: value
        });
    }
}

export class SpyderCheckStartsWith extends SpyderCheck<string, SpyderCheckStartsWithDef> {
    constructor(prefix: string, caseInsensitive = false, abort = false) {
        super({ kind: 'string_format', format: 'starts_with', prefix, caseInsensitive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        value = this._def.caseInsensitive ? value.toLowerCase() : value;

        const prefix = this._def.caseInsensitive
            ? this._def.prefix.toLowerCase()
            : this._def.prefix;
        if (value.startsWith(prefix)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected string to start with "${this._def.prefix}"`,
            format: 'starts_with',
            prefix: this._def.prefix,
            caseInsensitive: this._def.caseInsensitive,
            input: value
        });
    }
}

export class SpyderCheckEndsWith extends SpyderCheck<string, SpyderCheckEndsWithDef> {
    constructor(suffix: string, caseInsensitive = false, abort = false) {
        super({ kind: 'string_format', format: 'ends_with', suffix, caseInsensitive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        value = this._def.caseInsensitive ? value.toLowerCase() : value;

        const suffix = this._def.caseInsensitive
            ? this._def.suffix.toLowerCase()
            : this._def.suffix;
        if (value.endsWith(suffix)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected string to end with "${this._def.suffix}"`,
            format: 'ends_with',
            suffix: this._def.suffix,
            caseInsensitive: this._def.caseInsensitive,
            input: value
        });
    }
}

export class SpyderCheckIncludes extends SpyderCheck<string, SpyderCheckIncludesDef> {
    constructor(includes: string, caseInsensitive = false, abort = false) {
        super({ kind: 'string_format', format: 'includes', includes, caseInsensitive, abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        value = this._def.caseInsensitive ? value.toLowerCase() : value;
        const includes = this._def.caseInsensitive
            ? this._def.includes.toLowerCase()
            : this._def.includes;

        if (value.includes(includes)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected string to include "${this._def.includes}"`,
            format: 'includes',
            includes: this._def.includes,
            caseInsensitive: this._def.caseInsensitive,
            input: value
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

    public run(ctx: SpyderSchemaContext, value: string): void {
        if (util.makeRegexTest('lowercase', value)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected only lower case characters, got "${value}"`,
            format: 'lowercase',
            input: value
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

    public run(ctx: SpyderSchemaContext, value: string): void {
        if (util.makeRegexTest('uppercase', value)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected only upper case characters, got "${value}"`,
            format: 'uppercase',
            input: value
        });
    }
}

export class SpyderCheckRegex extends SpyderCheck<string, SpyderCheckRegexDef> {
    constructor(pattern: RegExp, abort = false) {
        super({ kind: 'string_format', format: 'regex', pattern, abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        if (this._def.pattern.test(value)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `String does not match provided pattern`,
            format: 'regex',
            pattern: String(this._def.pattern),
            input: value
        });
    }
}

export class SpyderCheckUrl extends SpyderCheck<string, SpyderCheckStringFormatDef<'url'>> {
    constructor(abort = false) {
        super({ kind: 'string_format', format: 'url', abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        if (URL.canParse(value)) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected a valid URL, got "${value}"`,
            format: 'url',
            input: value
        });
    }
}

export class SpyderCheckSlug extends SpyderCheck<string, SpyderCheckStringFormatDef<'slug'>> {
    constructor(abort = false) {
        super({ kind: 'string_format', format: 'slug', abort });
    }

    public run(ctx: SpyderSchemaContext, value: string): void {
        if (util.slugify(value) === value) return;

        ctx.issue({
            code: 'invalid_format',
            message: `Expected a valid slug, got "${value}"`,
            format: 'slug',
            input: value
        });
    }
}
