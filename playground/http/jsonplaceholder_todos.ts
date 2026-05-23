import { HttpClient } from '../../src';

interface Meta {
    readonly id: string;
    readonly startedAt: number;
}

interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

interface CreatedPost {
    id: number;
    title: string;
    body: string;
    userId: number;
}

const client = new HttpClient<Meta>();

client
    .onRequest((context) => {
        const { request, meta } = context;
        if (!meta) return;

        console.log(`[PreRequestHook] [${meta.id}] → ${request.method} ${request.url}`);

        request.headers['X-Request-Id'] = meta.id;
    })
    .onResponse((context, result) => {
        const { request, meta } = context;
        if (!meta) return;

        const elapsed = Date.now() - meta.startedAt;
        console.log(`[PostRequestHook] [${meta.id}] ← ${result.status} ${request.url} (${elapsed}ms)`);
    });

function makeMeta(): Meta {
    return {
        id: Math.random().toString(36).slice(2, 10),
        startedAt: Date.now()
    };
}

async function fetchTodos(): Promise<void> {
    console.log('\nFetching todos');

    const todos = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
            client.get<Todo>(`https://jsonplaceholder.typicode.com/todos/${i + 1}`, {
                responseType: 'json',
                meta: makeMeta()
            })
        )
    );

    for (const { body } of todos)
        console.log(`  Todo #${body.id} from user ${body.userId}: "${body.title}" [${body.completed ? 'done' : 'pending'}]`);
}

async function fetchPost(): Promise<void> {
    console.log('\nFetching single post');

    const { body } = await client.get<Post>('https://jsonplaceholder.typicode.com/posts/1', {
        responseType: 'json',
        accept: 'application/json',
        meta: makeMeta()
    });

    console.log(`  Post #${body.id} by user ${body.userId}: "${body.title}"`);
}

async function createPost(): Promise<void> {
    console.log('\nCreating post');

    const { body, status } = await client.post<CreatedPost>(
        'https://jsonplaceholder.typicode.com/posts',
        {
            responseType: 'json',
            body: { title: 'Hello', body: 'World', userId: 1 },
            meta: makeMeta()
        }
    );

    console.log(`  Created with status ${status}, assigned id: ${body.id}`);
}

async function testAbort(): Promise<void> {
    console.log('\nAbort signal test');

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 1);

    try {
        await client.get('https://jsonplaceholder.typicode.com/posts', {
            signal: controller.signal,
            meta: makeMeta()
        });
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') console.log('  Request was aborted as expected:', e);
        else console.error('  Unexpected error:', e);
    }
}

async function testWithoutMeta(): Promise<void> {
    console.log('\nRequest without meta (hooks should skip)');

    const { body } = await client.get<Todo>('https://jsonplaceholder.typicode.com/todos/1', {
        responseType: 'json'
    });

    console.log(`  Got todo without meta: "${(body as Todo).title}"`);
}

async function main() {
    await fetchTodos();
    await fetchPost();
    await createPost();
    await testAbort();
    await testWithoutMeta();
}

main();