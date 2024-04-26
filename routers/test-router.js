import { Elysia } from 'elysia'

export const test_router = new Elysia({ prefix: '/testrouter/' })
    .get("/", async () => {
        return "it works";
    });