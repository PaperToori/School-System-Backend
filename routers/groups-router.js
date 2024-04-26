import { Elysia } from 'elysia'
import { Group } from "../schemas/group.js";

export const groups_router = new Elysia({ prefix: '/groups' })
    .get("/", async () => {
        return await Group.find();
    })
    .post("/", async ({ body, set }) => {
        // ...Not yet
        let newGroup = new Group();
        newGroup.name = body.name;
        newGroup.members = [...body.members];

        try {
            await newGroup.save();
        } catch (error) {
            console.log(error.message);
            set.status = 400;
        }
    })
    .delete("/groups/", async ({ body, set }) => {
        let target = body.name;
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
    });