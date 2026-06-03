import {
    WebCrapCheckBetweenLength,
    WebCrapCheckLengthEquals,
    WebCrapCheckStartsWith,
    WebCrapCheckMaxLength,
    WebCrapCheckMinLength,
    WebCrapCheckUpperCase,
    WebCrapCheckLowerCase,
    WebCrapCheckEndsWith,
    WebCrapCheckIncludes,
    WebCrapCheckRegex,
    WebCrapCheckSlug,
    WebCrapCheckUrl
} from '../checks/string';
import type { WebCrapSchemaPayload } from '../payload';
import { WebCrapSchema } from '../schema';
import * as util from '../../utils';

export class WebCrapStringSchema extends WebCrapSchema<string> {
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
        return this._addCheck(new WebCrapCheckMinLength(minimum, inclusive, abort));
    }

    public max(maximum: number, inclusive?: boolean, abort?: boolean): this {
        return this._addCheck(new WebCrapCheckMaxLength(maximum, inclusive, abort));
    }

    public between(
        minimum: number,
        maximum: number,
        minInclusive?: boolean,
        maxInclusive?: boolean,
        abort?: boolean
    ): this {
        return this._addCheck(
            new WebCrapCheckBetweenLength(minimum, maximum, minInclusive, maxInclusive, abort)
        );
    }

    public length(expected: number, abort?: boolean): this {
        return this._addCheck(new WebCrapCheckLengthEquals(expected, abort));
    }

    public nonempty(abort?: boolean): this {
        return this.min(1, undefined, abort);
    }

    public startsWith(prefix: string, caseInsensitive?: boolean, abort?: boolean): this {
        return this._addCheck(new WebCrapCheckStartsWith(prefix, caseInsensitive, abort));
    }

    public endsWith(suffix: string, caseInsensitive?: boolean, abort?: boolean): this {
        return this._addCheck(new WebCrapCheckEndsWith(suffix, caseInsensitive, abort));
    }

    public includes(includes: string, caseInsensitive?: boolean, abort?: boolean): this {
        return this._addCheck(new WebCrapCheckIncludes(includes, caseInsensitive, abort));
    }

    public lowercase(abort?: boolean): this {
        return this._addCheck(new WebCrapCheckLowerCase(abort));
    }

    public uppercase(abort?: boolean): this {
        return this._addCheck(new WebCrapCheckUpperCase(abort));
    }

    public regex(pattern: RegExp, abort?: boolean): this {
        return this._addCheck(new WebCrapCheckRegex(pattern, abort));
    }

    public url(abort?: boolean): this {
        return this._addCheck(new WebCrapCheckUrl(abort));
    }

    public slug(abort?: boolean): this {
        return this._addCheck(new WebCrapCheckSlug(abort));
    }

    protected _parse(payload: WebCrapSchemaPayload<string>): WebCrapSchemaPayload<string> {
        if (typeof payload.value !== 'string')
            payload.addInvalidTypeIssue('string', util.getParsedType(payload.value));

        return payload;
    }
}
