import { Elysia } from 'elysia'

export const test_router = new Elysia({prefix :'/testrouter/'});

test_router.get("/", async () => {
    return "it works";
});