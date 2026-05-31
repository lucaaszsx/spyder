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
import { WebCrapSchema } from '../schema';

export class WebCrapString extends WebCrapSchema<string> {
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
        return this._addTransform((v) =>
            v
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\s-]/g, '')
                .trim()
                .replace(/[\s_]+/g, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-|-$/g, '')
                .toLowerCase()
        );
    }

    public min(minimum: number, inclusive?: boolean): this {
        return this._addCheck(new WebCrapCheckMinLength(minimum, inclusive));
    }

    public max(maximum: number, inclusive?: boolean): this {
        return this._addCheck(new WebCrapCheckMaxLength(maximum, inclusive));
    }

    public between(
        minimum: number,
        maximum: number,
        minInclusive?: boolean,
        maxInclusive?: boolean
    ): this {
        return this._addCheck(
            new WebCrapCheckBetweenLength(minimum, maximum, minInclusive, maxInclusive)
        );
    }

    public length(expected: number): this {
        return this._addCheck(new WebCrapCheckLengthEquals(expected));
    }

    public nonempty(): this {
        return this.min(1);
    }

    public startsWith(prefix: string, caseInsensitive?: boolean): this {
        return this._addCheck(new WebCrapCheckStartsWith(prefix, caseInsensitive));
    }

    public endsWith(suffix: string, caseInsensitive?: boolean): this {
        return this._addCheck(new WebCrapCheckEndsWith(suffix, caseInsensitive));
    }

    public includes(includes: string, caseInsensitive?: boolean): this {
        return this._addCheck(new WebCrapCheckIncludes(includes, caseInsensitive));
    }

    public lowercase(): this {
        return this._addCheck(new WebCrapCheckLowerCase());
    }

    public uppercase(): this {
        return this._addCheck(new WebCrapCheckUpperCase());
    }

    public regex(pattern: RegExp): this {
        return this._addCheck(new WebCrapCheckRegex(pattern));
    }

    public url(): this {
        return this._addCheck(new WebCrapCheckUrl());
    }

    public slug(): this {
        return this._addCheck(new WebCrapCheckSlug());
    }
}
