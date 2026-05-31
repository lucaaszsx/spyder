export abstract class WebCrapType<T> {
    abstract _parse(context: unknown): T;
}
