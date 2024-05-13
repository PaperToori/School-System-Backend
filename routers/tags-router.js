import { Elysia } from 'elysia'
import { Tag } from "../schemas/tag.js";

export const tags_router = new Elysia({ prefix: '/tags' })
    .get("/", async () => {
        return await Tag.find();
    })
    .post("/", async ({ body, set }) => {
        //
        let parsedBody = JSON.parse(body);
        // Input from body
        let newTag = new Tag();
        newTag.name        = parsedBody.name;
        newTag.gmail       = parsedBody.gmail;
        newTag.phoneNumber = parsedBody.phoneNumber;
        // Save!
        try {
            await newTag.save();
        } catch (error) {
            console.log(error.message);
            set.status = 400;
            return "Post: Faliure";
        }
        return "Post: Success";
    })
    .delete("/", async ({ body, set }) => {
        let target = JSON.parse(body).name;
        set.status = 400;
        if ("" == target) {
            return "No teacher was specified.";
        }
        if (!(await Tag.exists({ name: target }))) {
            return "Tag doesn't exist.";
        }
        try {
            await Tag.deleteOne({ name: target });
        } catch (error) {
            console.log(error);
            return "Deletion: Faliure";
        }
        set.status = 200;
        return "Deletion: Success";
    })
    .patch("/", async ({ body, set }) => {
        let parsedBody = JSON.parse(body);
        set.status = 400;
        if ("" == parsedBody.target || "" == parsedBody.newName) {
            return "Lacking input";
        }
        if (!(await Tag.exists({ name: parsedBody.target }))) {
            return "Classroom doesnt exist.";
        }
        const target = await Tag.findOne({ name: parsedBody.target });
        target.name = parsedBody.newName;
        try {
            await target.save();
        } catch (error) {
            console.log(error);
            return "Patch: Faliure";
        }
        set.status = 200;
        return "Patch: Success";
    });
