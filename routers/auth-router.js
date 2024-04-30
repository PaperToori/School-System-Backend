import { Elysia } from 'elysia'
import admin from 'firebase-admin';
import { UserDB } from "../schemas/users.js";

let serviceAccount = require("../desk-17e4d-firebase-adminsdk-xgca0-0de33bf30a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export async function Authenticator(permission, id) {
    let permitted = false;
    let uid = null;
    await admin.auth().verifyIdToken(id)
        .then((decodedToken) => {
            uid = decodedToken.uid;
        })
        .catch((error) => {
            console.log("Error in Authenticator function")
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorCode);
            console.error(errorMessage);
        });
    const user = await UserDB.findOne({ userID: uid });
    if (user != null) {
        if (user.permission >= permission) {
            permitted = true;
        }
    }
    console.log("Authenticator returning", permitted);
    return permitted;
}

// non typesafe way of doing guard
/*
app.guard(
    {
        //Beforehandle
        async beforeHandle({ set, headers }) {
            let id = headers.id;
            if (await Authenticator(1, id) == false) {
                console.log(id);
                console.log("NOT APPROVED!");
                return (set.status = 'Unauthorized')
            }
        }
        //Beforehandle
    },
    (app) =>
        app
            .get('/test/', ({ }) => {
                console.log("guard approved");
                return "guard approved";
            })
);
*/

export const auth_router = new Elysia({ prefix: '/auth' })
    .guard(
        {
            async beforeHandle({ set, headers }) {
                console.log("receieved");
                let id = headers.id;
                if (await Authenticator(-1, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
                console.log("APPROVED");
            }
        },
        (App) =>
            App
                .get('/test/', () => {
                    console.log("guard approved");
                    return JSON.stringify("guard approved");
                })
    )
    .get("/user/", async () => {
        return await UserDB.find();
    })
    .post("/user/", async ({ body, set }) => {
        let newUser = new UserDB();
        newUser.userID = JSON.parse(body).id;
        newUser.permission = JSON.parse(body).permission;
        try {
            await newUser.save();
        } catch (error) {
            console.log(error.message);
            set.status = 400;
            return "Post: Faliure";
        }
        return "Post: Success";
    })
    .get("/", async () => {
        return "not protected route";
    });