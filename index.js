import mongoose from "mongoose";
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

// ---------------------------------------------------------
// Schemas -------------------------------------------------

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
const Tag = mongoose.model('Tag', TagSchema);

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
const Subject = mongoose.model('Subject', SubjectSchema);

const ClassroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
const Classroom = mongoose.model('Classroom', ClassroomSchema);

const TeacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    gmail: {
        type: String
    },
    phoneNumber: {
        type: String
    }
});
const Teacher = mongoose.model('Teacher', TeacherSchema);

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tags: {
        type: [String],
        required: true
    },
    gmail: {
        type: String
    },
    phoneNumber: {
        type: String
    }
});
const Student = mongoose.model('Student', StudentSchema);

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    members: {
        type: [String]
    }
});
const Group = mongoose.model('Group', GroupSchema);

const LessonTimeSchema = new mongoose.Schema({
    weekDay: Number,
    startTime: Number,
    endTime: Number
});
const LessonTime = mongoose.model('LessonTime', LessonTimeSchema);

const LessonTemplateSchema = new mongoose.Schema({
    name: String,
    template: [LessonTimeSchema],
    weeks: [Number]
});
const LessonTemplate = mongoose.model('LessonTemplate', LessonTemplateSchema);

const LessonSchema = new mongoose.Schema({
    classroom: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    week: {
        type: Number,
        required: true,
        min: 1,
        max: 53
    },
    weekDay: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    startTime: {
        type: Number,
        required: true,
        min: 0,
    },
    endTime: {
        type: Number,
        required: true,
        max: 143
    },
    date: {
        type: Number,
        min: 1,
        max: 31
    },
    month: {
        type: Number,
        min: 1,
        max: 12
    },
});
const Lesson = mongoose.model('Lesson', LessonSchema);

// ---------------------------------------------------------
// Server --------------------------------------------------

const dbURI = `mongodb+srv://garrattkarl:${process.env.DB_PASSWORD}@cluster0.ar0kjrf.mongodb.net/?retryWrites=true&w=majority`

try {
    await mongoose.connect(dbURI);
    console.log("Connected to database ...");
} catch (error) {
    console.log(`Could not connect to database: ${error.message}`);
}

const app = new Elysia();
app.use(cors());

// ---------------------------------------------------------
// GET REQUESTS --------------------------------------------

app.get('/classrooms/', async () => {
    return await Classroom.find();
});
app.get('/tags/', async () => {
    return await Tag.find();
});
app.get('/subjects', async () => {
    return await Subject.find();
});
app.get('/groups/', async () => {
    return await Group.find();
});
app.get('/lessons/', async () => {
    return await Lesson.find();
});
app.get('/students/', async () => {
    return await Student.find({});
});
app.get('/teachers/', async () => {
    return await Teacher.find();
});

app.get('deleteTag/:target', async ({ params }) => {
    if (! await Tag.exists({ name : params.target })) { return "Doesn't Exist"; }
    await Tag.deleteOne({ name : params.target });
    return "Deletion: Success";
});

// ---------------------------------------------------------
// POST REQUESTS -------------------------------------------

app.post('/classrooms/', async ({ body, set }) => {
    let newClassroom = new Classroom();
    newClassroom.name = JSON.parse(body).name;
    try { await newClassroom.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});
app.post('/tags/', async ({ body, set }) => {
    let newTag = new Tag();
    newTag.name = JSON.parse(body).name;
    try { await newTag.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});
app.post('/subjects/', async ({ body, set }) => {
    let newSubject = new Subject();
    newSubject.name = JSON.parse(body).name;
    try { await newSubject.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});
app.post('/groups/', async ({ body, set }) => {
    let parsedBody = JSON.parse(body);
    let newGroup = new Group();
    newGroup.name = parsedBody.name;
    newGroup.members = [...parsedBody.members];
    try { await newGroup.save(); }
    catch (error) { console.log(error.message); set.status = 400; }
    return "Post: Success";
});
app.post('/lessons/', async ({ body, set }) => { // Not yet
    set.status = 400;
    // Input from body
    let newLesson = new Lesson();
    newLesson.classroom = body.classroom;
    newLesson.subject = body.subject;
    newLesson.teacher = body.teacher;
    newLesson.group = body.group;
    newLesson.week = body.week;
    newLesson.weekDay = body.weekDay;
    newLesson.startTime = body.startTime;
    newLesson.endTime = body.endTime;
    // Check for timetravel
    if (newLesson.startTime > newLesson.endTime) { return "Time travel detected."; }

    // Save!
    try { await newLesson.save(); }
    catch (error) { console.log(error.message); return "Post: Faliure"; }
    set.status = 200;
    return "Post: Success";
});
app.post('/students/', async ({ body, set }) => { 
    set.status = 400;
    let parsedBody = JSON.parse(body);
    // Fill in from body
    let newStudent = new Student();
    newStudent.name = parsedBody.name;
    newStudent.gmail = parsedBody.gmail;
    newStudent.phoneNumber = parsedBody.phoneNumber;
    newStudent.tags = parsedBody.tags;
    // Save!
    try { await newStudent.save(); }
    catch (error) { console.log(error.message); return "Post: Faliure"; }
    set.status = 200;
    return "Post: Success";
});
app.post('/teachers/', async ({ body, set }) => {
    // 
    let parsedBody = JSON.parse(body);
    // Input from body
    let newTeacher = new Teacher();
    newTeacher.name = parsedBody.name;
    newTeacher.gmail = parsedBody.gmail;
    newTeacher.phoneNumber = parsedBody.phoneNumber;
    // Save!
    try { await newTeacher.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});

// ---------------------------------------------------------
// DELETE REQUESTS -----------------------------------------

app.delete('/classrooms/', async ({ body, set }) => {
    let target = body.name;
    set.status = 400;
    if ("" == target) { return "No classroom was specified." }
    if (! await Classroom.exists({ name: target })) { return "Classroom doesn't exist."; }
    try { await Classroom.deleteOne({ name: target }); }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/tags/:target', async ({ params, set }) => {
    let target = params.target;
    console.log(target);
    console.log(await Tag.exists({ name: target }));
    set.status = 400;
    if ("" == target) { return "No tag was specified." }
    if (! await Tag.exists({ name: target })) { return "Tag does not exist."; }
    try { await Tag.deleteOne({ name: target }); }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/subjects/', async ({ body, set }) => {
    let target = body.name;
    set.status = 400;
    if ("" == target) { return "No subject was specified." }
    if (! await Subject.exists({ name: target })) { return "Subject does not exist."; }
    try { await Subject.deleteOne({ name: target }); }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/groups/', async ({ body, set }) => {
    let target = body.name;
    set.status = 400;
    if ("" == target) { return "No group was specified."; }
    if (! await Group.exists({ name: target })) { return "Group doesn't exist."; }
    try { await Group.deleteOne({ name: target }); }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/lessons/', async ({ body, set }) => {
    // Input from body
    let targetSubject = body.subject;
    let targetTeacher = body.teacher;
    let targetGroup = body.group;
    let targetWeek = body.week;
    let targetDay = body.weekDay;
    // Check existing
    set.status = 400;
    if (! await Lesson.exists({ subject: targetSubject   })) { return "Subject not found"; }
    if (! await Lesson.exists({ teacher: targetTeacher  })) { return "Teacher not found"; }
    if (! await Lesson.exists({ group: targetGroup      })) { return "Group not found"; }
    if (! await Lesson.exists({
                                week: targetWeek,
                                weekDay: targetDay
                                                        })) { return "Week/Day not found"; }
    // Delete!
    try {
        await Lesson.deleteOne({
            teacher: targetTeacher,
            subject: targetSubject,
            group: targetGroup,
            week: targetWeek,
            weekDay: targetDay
        });
    }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/students/', async ({ body, set }) => {
    let target = body.name;
    set.status = 400;
    if ("" == target) { return "No student was specified."; }
    if (! await Student.exists({ name: target })) { return "Student doesn't exist."; }
    try { await Student.deleteOne({ name: target }); }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/teachers/', async ({ body, set }) => {
    let target = body.name;
    set.status = 400;
    if ("" == target) { return "No teacher was specified."; }
    if (! await Teacher.exists({ name: target })) { return "Teacher doesn't exist."; }
    try { await Teacher.deleteOne({ name: target }); }
    catch (error) { console.log(error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});

// ---------------------------------------------------------
// EDIT REQUESTS -------------------------------------------
app.patch('/classrooms/', async ({ body, set }) => {
    set.status = 400;
    if ("" == body.target || "" == body.newName) { return "Lacking input"; }
    if (! await Classroom.exists({ name: body.target })) { return "Classroom doesnt exist."; }
    const target = await Classroom.findOne({ name: body.target });
    target.name = body.newName;
    try { await target.save(); }
    catch (error) { console.log(error); return "Patch: Faliure"; }
    set.status = 200;
    return "Patch: Success";
});
app.patch('/tags/', async ({ body, set }) => {
    set.status = 400;
    if ("" == body.target || "" == body.newName) { return "Lacking input"; }
    if (! await Tag.exists({ name: body.target })) { return "Tag doesn't exist."; }
    const target = await Tag.findOne({ name: body.target });
    target.name = body.newName;
    try { await target.save(); }
    catch (error) { console.log(error); return "Patch: Faliure"; }
    set.status = 200;
    return "Patch: Success";
});
app.patch('/lessons/', async ({ body, set }) => { // May god have mercy on my soul
    set.status = 400;
    if (! await Lesson.exists({
        classroom: body.classroom,
        subject: body.subject,
        teacher: body.teacher,
        group: body.group,
        week: body.week,
        weekDay: body.weekDay
    })) { return "Specified lesson doesn't exist."; }
    const target = await Lesson.findOne({
        classroom: body.classroom,
        subject: body.subject,
        teacher: body.teacher,
        group: body.group,
        week: body.week,
        weekDay: body.weekDay
    });
    if (-1 != body.newStartTime) {
        if (0 > body.newStartTime || 143 < body.newStartTime) { return "Illegal start time."; }
        target.startTime = body.newStartTime;
    }
    if (-1 != body.newEndTime) {
        if (target.startTime > body.newEndTime) { return "Time travel detected."; }
        if (143 < body.newEndTime) { return "Illegal end time."; }
        target.endTime = body.newEndTime;
    }
    try { await target.save(); }
    catch (error) { console.log(error); return "Patch: Faliure"; }
    set.status = 200;
    return "Patch: Success";
});
app.patch('/groups/', async ({ body, set }) => { }); // Don't even bother
app.patch('/students/', async ({ body, set }) => { // Needs editing to fit tags
    set.status = 400;
    if ("" == body.target) { return "Lacking target"; }
    if (! await Student.exists({ name: body.target })) { return "Student doesnt exist."; }
    const target = await Student.findOne({ name: body.target });
    if ("" != body.newName) {
        if (await Student.exists({ name: body.newName })) { return "Student with suggested name already exists."; }
        target.name = body.newName;
    }
    if ("" != body.newGmail) { target.gmail = body.newGmail; }
    if ("" != body.newPhoneNumber) { target.phoneNumber = body.newPhoneNumber; }
    try { await target.save(); }
    catch (error) { console.log(error); return "Patch: Faliure"; }
    set.status = 200;
    return "Patch: Success";
});
app.patch('/teachers/', async ({ body, set }) => {
    set.status = 400;
    if ("" == body.target) { return "Lacking target"; }
    if (! await Teacher.exists({ name: body.target })) { return "Teacher doesnt exist."; }
    const target = await Teacher.findOne({ name: body.target });
    if ("" != body.newName) {
        if (await Teacher.exists({ name: body.newName })) { return "Teacher with suggested name already exists."; }
        target.name = body.newName;
    }
    if ("" != body.newGmail) { target.gmail = body.newGmail; }
    if ("" != body.newPhoneNumber) { target.phoneNumber = body.newPhoneNumber; }
    try { await target.save(); }
    catch (error) { console.log(error); return "Patch: Faliure"; }
    set.status = 200;
    return "Patch: Success";
});


// ---------------------------------------------------------

// ---------------------------------------------------------
// GROUP REQUESTS -------------------------------------------

// Not sure if I'll ever end up filling this section...

// ---------------------------------------------------------


app.get('/', () => {
    let message = "";
    message += "Functions:\n";
    message += "\ng/p/d\t/classrooms";
    message += "\ng/p/d\t/tags";
    message += "\ng/p/d\t/groups";
    message += "\ng/p/d\t/lessons";
    message += "\ng/p/d\t/students";
    message += "\ng/p/d\t/teachers";
    return message;
});

app.delete('/burnitall', async () => {
    await Classroom.deleteMany();
    await Tag.deleteMany();
    await Group.deleteMany();
    await Lesson.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    let message = "The records: all burned.\nYou must start anew now.\nBut it will all be worth it in the end, right?\n\n...right?";
    return message;
});

// Put this on bottom
app.listen(8080, () => console.log("Webserver up and running at http://localhost:8080\n"));