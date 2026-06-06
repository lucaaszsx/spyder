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
import { SpyderCoerceableSchemaBase } from '../schema';
import type { SpyderSchemaContext } from '../context';
import * as util from '../../utils';

export class SpyderStringSchema extends SpyderCoerceableSchemaBase<string> {
    public trim(): this {
        return this._addTransform((v) => v.trim());
    }

    public trimStart(): this {
        return this._addTransform((v) => v.trimStart());
    }

    public trimEnd(): this {
        return this._addTransform((v) => v.trimEnd());
    }

    public slice(start?: number, end?: number): this {
        return this._addTransform((v) => v.slice(start, end));
    }

    public substring(start: number, end?: number): this {
        return this._addTransform((v) => v.substring(start, end));
    }

    public after(
        str: string,
        options?: {
            trimOnlyWhenFound?: boolean;
            trimStart?: boolean;
            trimEnd?: boolean;
            trim?: boolean;
        }
    ): this {
        if (!util.isPlainObject(options)) options = {};

        options = util.mergeObjects(
            {
                trimOnlyWhenFound: true,
                trimStart: false,
                trimEnd: false,
                trim: false
            },
            options
        );

        return this._addTransform((v) => {
            const idx = v.indexOf(str);
            let found = idx > -1 ? v.slice(idx + str.length) : v;

            if (options.trimOnlyWhenFound && idx <= -1) return found;
            if (options.trim) found = found.trim();
            if (options.trimStart) found = found.trimStart();
            if (options.trimEnd) found = found.trimEnd();

            return found;
        });
    }

    public padStart(maxLength: number, fillString?: string): this {
        return this._addTransform((v) => v.padStart(maxLength, fillString));
    }

    public padEnd(maxLength: number, fillString?: string): this {
        return this._addTransform((v) => v.padEnd(maxLength, fillString));
    }

    public prefix(str: string): this {
        return this._addTransform((v) => str + v);
    }

    public suffix(str: string): this {
        return this._addTransform((v) => v + str);
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

    protected _parse(ctx: SpyderSchemaContext, value: string): string {
        if (this._def.coerce) value = String(value);
        if (typeof value !== 'string')
            ctx.addInvalidType('string', util.getParsedType(value), value);

        return value;
    }
}
