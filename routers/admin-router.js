import { Elysia, error } from 'elysia'
import admin from 'firebase-admin';
import { UserDB } from "../schemas/users.js";
import { Teacher } from "../schemas/teacher.js";
import { Guardian } from "../schemas/guardian.js";
import { Student } from "../schemas/student.js";

let serviceAccount = require("../desk-17e4d-firebase-adminsdk-xgca0-0de33bf30a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
export async function Authenticator(permission, id) {
    let permitted = false;
    let uid = null;
    try {
        await admin.auth().verifyIdToken(id)
            .then((decodedToken) => {
                uid = decodedToken.uid;
            })
    }
    catch (error) {
        console.log(`Error in Authenticator function.\nError message: "${error.message}"`);
        uid = null;
    }
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

export const admin_router = new Elysia({ prefix: '/admin' })
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
                .get("/user/", async () => {
                    return await UserDB.find();
                })
    )
    .get("/profile/", async ({ set, headers }) => {
        let id = headers.id;

        let uid = null;
        try {
            await admin.auth().verifyIdToken(id)
                .then((decodedToken) => {
                    uid = decodedToken.uid;
                })
        }
        catch (error) {
            console.log(`Error in Authenticator function.\nError message: "${error.message}"`);
        }

        const user = await UserDB.findOne({ userID: uid });
        if (user != null) {
            let response = {
                profile: [],
                profileType: []
            };
            if (user.dataType.length === 0) {
                return "user not linked to any profile"
            }
            for (let i = 0; i < user.dataType.length; i++) {
                let profileID = user.dataType[i].split(":");
                profileID = profileID[1];
                if (user.dataType[i][0] == "S") {
                    response.profile[i] = await Student.findOne({ _id: profileID });
                    response.profileType[i] = "Elev";
                    console.log(response);
                }
                else if (user.dataType[i][0] == "G") {
                    response.profile[i] = await Guardian.findOne({ _id: profileID });
                    response.profileType[i] = "Vårdnashavare";
                    console.log(response);
                }
                else if (user.dataType[i][0] == "T") {
                    response.profile[i] = await Teacher.findOne({ _id: profileID });
                    response.profileType[i] = "Lärare";
                    console.log(response);
                }
                else {
                    set.status = "Internal Server Error";
                    return JSON.stringify("Not logged in")
                }
            }

            return response;
        }
        else {
            return JSON.stringify("Not logged in");
        }
    })
    .post("/profile/", async ({ set, body, headers }) => {
        // guard this thing

        // make sure no inapropriate data mad it through
        // const user = await UserDB.findOne({ userID: uid });
        // if (user.dataType[i][0] == "S") {
        //     response.profile[i] = await Student.findOne({ _id: profileID });
        //     response.profileType[i] = "Elev";
        //     console.log(response);
        // }
        // else if (user.dataType[i][0] == "G") {
        //     response.profile[i] = await Guardian.findOne({ _id: profileID });
        //     response.profileType[i] = "Vårdnashavare";
        //     console.log(response);
        // }
        // else if (user.dataType[i][0] == "T") {
        //     response.profile[i] = await Teacher.findOne({ _id: profileID });
        //     response.profileType[i] = "Lärare";
        //     console.log(response);
        // }
        
        return set.status="OK";
    })
    .get("/", async () => {
        return "not protected route";
    });