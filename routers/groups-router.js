import { Elysia } from 'elysia'
import { Group } from "../schemas/group.js";
import { Authenticator } from './admin-router.js';

export const groups_router = new Elysia({ prefix: '/groups' })
    .guard(
        {
            async beforeHandle({ set, headers }) {
                let id = headers.id;
                if (await Authenticator(2, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
            }
        },
        (App) =>
            App
                .get("/", async () => {
                    return await Group.find();
                })
    )
    .guard(
        {
            async beforeHandle({ set, headers }) {
                let id = headers.id;
                if (await Authenticator(3, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
            }
        },
        (App) =>
            App
                .post("/", async ({ body, set }) => {
                    let parsedBody = JSON.parse(body);
                    let newGroup = new Group();
                    newGroup.name = parsedBody.name;
                    newGroup.members = [...parsedBody.members];

                    try {
                        await newGroup.save();
                    } catch (error) {
                        console.log(error.message);
                        set.status = 400;
                    }
                })
                .delete("/", async ({ body, set }) => {
                    let target = JSON.parse(body).name;
                    set.status = 400;
                    if ("" == target) {
                        return "No group was specified.";
                    }
                    if (!(await Group.exists({ name: target }))) {
                        return "Group doesn't exist.";
                    }
                    try {
                        await Group.deleteOne({ name: target });
                    } catch (error) {
                        console.log(error);
                        return "Deletion: Faliure";
                    }
                    set.status = 200;
                    return "Deletion: Success";
                })
                .patch("/", async () => {
                    return "not implemented yet";
                })
    )
    ;