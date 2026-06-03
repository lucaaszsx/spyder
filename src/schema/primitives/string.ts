import {
    SpyderCheckBetweenLength,
    SpyderCheckLengthEquals,
    SpyderCheckStartsWith,
    SpyderCheckMaxLength,
    SpyderCheckMinLength,
    SpyderCheckUpperCase,
    SpyderCheckLowerCase,
    SpyderCheckEndsWith,
    SpyderCheckIncludes,
    SpyderCheckRegex,
    SpyderCheckSlug,
    SpyderCheckUrl
} from '../checks/string';
import type { SpyderSchemaPayload } from '../payload';
import { SpyderSchema, type SpyderSchemaDef } from '../schema';
import * as util from '../../utils';

export class SpyderStringSchema extends SpyderSchema<string> {
    public trim(): this {
        return this._addTransform((v) => v.trim());
    }

    public toLowerCase(): this {
        return this._addTransform((v) => v.toLowerCase());
    }

    public toUpperCase(): this {
        return this._addTransform((v) => v.toUpperCase());
    }

    public normalize(): this {
        return this._addTransform((v) => v.replace(/\s+/g, ' ').trim());
    }

    public replace(searchValue: string | RegExp, replaceValue: string): this {
        return this._addTransform((v) => v.replace(searchValue, replaceValue));
    }

    public slugify(): this {
        return this._addTransform(util.slugify);
    }

    public min(minimum: number, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMinLength(minimum, inclusive, abort));
    }

    public max(maximum: number, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckMaxLength(maximum, inclusive, abort));
    }

    public between(
        minimum: number,
        maximum: number,
        minInclusive?: boolean,
        maxInclusive?: boolean,
        abort?: boolean
    ): this {
        return this._addCheck(
            new SpyderCheckBetweenLength(minimum, maximum, minInclusive, maxInclusive, abort)
        );
    }

    public length(expected: number, abort?: boolean): this {
        return this._addCheck(new SpyderCheckLengthEquals(expected, abort));
    }

    public nonempty(abort?: boolean): this {
        return this.min(1, undefined, abort);
    }

    public startsWith(prefix: string, caseInsensitive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckStartsWith(prefix, caseInsensitive, abort));
    }

    public endsWith(suffix: string, caseInsensitive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckEndsWith(suffix, caseInsensitive, abort));
    }

    public includes(includes: string, caseInsensitive?: boolean, abort?: boolean): this {
        return this._addCheck(new SpyderCheckIncludes(includes, caseInsensitive, abort));
    }

    public lowercase(abort?: boolean): this {
        return this._addCheck(new SpyderCheckLowerCase(abort));
    }

    public uppercase(abort?: boolean): this {
        return this._addCheck(new SpyderCheckUpperCase(abort));
    }

    public regex(pattern: RegExp, abort?: boolean): this {
        return this._addCheck(new SpyderCheckRegex(pattern, abort));
    }

    public url(abort?: boolean): this {
        return this._addCheck(new SpyderCheckUrl(abort));
    }

    public slug(abort?: boolean): this {
        return this._addCheck(new SpyderCheckSlug(abort));
    }

    protected _parse(
        def: SpyderSchemaDef,
        payload: SpyderSchemaPayload<string>
    ): SpyderSchemaPayload<string> {
        if (def.coerce) payload.value = String(payload.value);
        if (typeof payload.value !== 'string')
            payload.addInvalidTypeIssue(payload.value, 'string', util.getParsedType(payload.value));

        return payload;
    }
}
