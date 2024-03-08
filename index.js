import mongoose from "mongoose";
import { Elysia } from 'elysia';
import { brotliDecompressSync } from "zlib";

// ---------------------------------------------------------
// Schemas -------------------------------------------------

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
const Course = mongoose.model('Course', CourseSchema);

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
    course: {
        type: String,
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
    course: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    week: {
        type: Number, 
        required: true, 
        min: 1, 
        max: 52},
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
} catch (error) {
    console.log(`Could not connect to database: ${error.message}`);
}

console.log("Connected to database ...");

const app = new Elysia();

// ---------------------------------------------------------
// GET REQUESTS --------------------------------------------

app.get('/classrooms/', async () => {
    return await Classroom.find();
});
app.get('/courses/', async () => {
    return await Course.find();
});
app.get('/groups/', async () => {

    // let exam = await Group.find({});

    // exam.forEach(display);

    // function display(element){
    //     element.members.forEach(reveal)
    //     function reveal(element){
    //         console.log(element);
    //     }
    // }


    return await Group.find();
});
app.get('/lessons/', async () => {
    return await Lesson.find();
});
app.get('/students/', async () => {
    return await Student.find();
});
app.get('/teachers/', async () => {
    return await Teacher.find();
});

// ---------------------------------------------------------
// POST REQUESTS -------------------------------------------

app.post('/classrooms/', async ({ body, set }) => {
    let newClassroom = new Classroom();
    newClassroom.name = body.name;
    try { await newClassroom.save(); }
    catch (error) {
        console.log(error.message);
        set.status = 400;
        return "Post: Faliure";
    }
    return "Post: Success";
});
app.post('/courses/', async ({ body, set }) => {
    let newCourse = new Course();
    newCourse.name = body.name;
    try { await newCourse.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});
app.post('/groups/', async ({ body, set }) => { // Vibecheck error: Async bulshittery -> Ask Sebbe
    let newGroup = new Group();
    newGroup.name       = body.name;
    newGroup.members    = [...body.members];

    // Vibecheck
    // let ghost = false;
    // newGroup.members.forEach(Vibecheck);

    // async function Vibecheck(element){
    //     let check = await Student.exists({ name : element });
    //     if (!check) { ghost = true; console.log("ghost detected"); }
    // }

    // console.log(ghost);
    // if (ghost) { set.status =400; console.log("closing..."); return "Error: Ghost student present"; }

    try { await newGroup.save(); } 
    catch (error) 
    { console.log(error.message); set.status = 400; }
});
app.post('/lessons/', async ({ body, set }) => {
    // Input from body
    let newLesson = new Lesson();
    newLesson.classroom = body.classroom;
    newLesson.course    = body.course;
    newLesson.teacher   = body.teacher;
    newLesson.class     = body.class;
    newLesson.week      = body.week;
    newLesson.weekDay   = body.weekDay;
    newLesson.startTime = body.startTime;
    newLesson.endTime   = body.endTime;
    // Vibecheck
    let message = "Error:\n";
    if (! await Classroom.exists    ({name : newLesson.classroom})) { set.status = 400; message += "Ghost classroom detected\n"; }
    if (! await Course.exists       ({name : newLesson.course}))    { set.status = 400; message += "Ghost course detected\n"; } 
    if (! await Group.exists        ({name : newLesson.class}))     { set.status = 400; message += "Ghost class detected\n"; }
    if (! await Teacher.exists      ({name : newLesson.teacher}))   { set.status = 400; message += "Ghost teacher detected\n"; }
    if (400 == set.status) { return message; }
    if (newLesson.startTime > newLesson.endTime) { set.status = 400; return "Time travel detected."; }
    // Save!
    try { await newLesson.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});
app.post('/students/', async ({ body, set }) => {
    // Fill in from body
    let newStudent = new Student();
    newStudent.name         = body.name;
    newStudent.course       = body.course;
    newStudent.gmail        = body.gmail;
    newStudent.phoneNumber  = body.phoneNumber;
    // Vibecheck
    if (! await Course.exists({ name: newStudent.course })) { set.status = 400; return "Course doesn't exist."; }
    // Save!
    try { await newStudent.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});
app.post('/teachers/', async ({ body, set }) => {
    // Input from body
    let newTeacher = new Teacher();
    newTeacher.name         = body.name;
    newTeacher.gmail        = body.gmail;
    newTeacher.phoneNumber  = body.phoneNumber;
    // Save!
    try { await newTeacher.save(); }
    catch (error) 
    { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});

// ---------------------------------------------------------
// DELETE REQUESTS -----------------------------------------

app.delete('/classrooms/', async ({ body, set }) => {
    let target = body.name;
    if ("" == target) { set.status = 400; return "No classroom was specified." }
    if (! await Classroom.exists({ name: target })) { set.status = 400; return "Classroom doesn't exist."; }
    try { await Classroom.deleteOne({ name: target }); }
    catch (error) 
    { console.log(error); set.status = 400; return "Deletion: Faliure"; }
    return "Deletion: Success";
});
app.delete('/courses/', async ({ body, set }) => {
    let target = body.name;
    if ("" == target) { set.status = 400; return "No course was specified." }
    if (! await Course.exists({ name: target })) { set.status = 400; return "Course does not exist."; }
    try { await Course.deleteOne({ name: target }); }
    catch (error) 
    { console.log(error); set.status = 400; return "Deletion: Faliure"; }
    return "Deletion: Success";
})
app.delete('/groups/', async ({ body, set }) => {
    let target = body.name;
    if("" == target) { set.status = 400; return "No group was specified."; }
    if (! await Group.exists({name : target})) { set.status = 400; return "Group doesn't exist."; }
    try { await Group.deleteOne({name : target}); } 
    catch (error)
    { console.log(error); set.status = 400; return "Deletion: Faliure"; }
    return "Deletion: Success"; 
});
app.delete('/lessons/', async ({ body, set }) => { // Finish this after vibecheck overhaul
    // Input from body
    let targetCourse    = body.course;
    let targetTeacher   = body.teacher;
    let targetClass     = body.class;
    let targetWeek      = body.week;
    let targetDay       = body.weekDay;
    // Check existing
    set.status = 400;
    if (! await Lesson.exists({ course  : targetCourse }))  { return "Course not found"; }
    if (! await Lesson.exists({ teacher : targetTeacher })) { return "Teacher not found"; }
    if (! await Lesson.exists({ class   : targetClass }))   { return "Class not found"; }
    if (! await Lesson.exists({ week    : targetWeek, 
                                weekDay : targetDay }))     { return "Week/Day not found"; }
    // Delete!
    try { await Lesson.deleteOne({
            teacher : targetTeacher,
            course  : targetCourse,
            class   : targetClass,
            week    : targetWeek,
            weekDay : targetDay }); } 
    catch (error) { console.log( error); return "Deletion: Faliure"; }
    set.status = 200;
    return "Deletion: Success";
});
app.delete('/students/', async ({ body, set }) => {
    let target = body.name;
    if ("" == target) { set.status = 400; return "No student was specified."; }
    if (! await Student.exists({ name: target })) { set.status = 400; return "Student doesn't exist."; }
    try { await Student.deleteOne({ name: target }); }
    catch (error) { console.log(error); set.status = 400; return "Deletion: Faliure"; }
    return "Deletion: Success";
});
app.delete('/teachers/', async ({ body, set }) => {
    let target = body.name;
    if ("" == target) { set.status = 400; return "No teacher was specified."; }
    if (! await Teacher.exists({ name: target })) { set.status = 400; return "Teacher doesn't exist."; }
    try { await Teacher.deleteOne({ name: target }); }
    catch (error) { console.log(error); set.status = 400; return "Deletion: Faliure"; }
    return "Deletion: Success";
});

// ---------------------------------------------------------
// EDIT REQUESTS -------------------------------------------
app.patch('/classrooms/', async ({ body, set }) => { 
    if ("" == body.target || "" == body.newName){ set.status = 400; return "Lacking input"; }
    if (! await Classroom.exists({ name : body.target })) { set.status = 400; return "Classroom doesnt exist."; }
    const target = await Classroom.findOne({name : body.target});
    target.name = body.newName;
    try { await target.save(); } 
    catch (error) 
    { console.log(error); set.status = 400; return "Patch: Faliure"; }
    return "Patch: Success"; 
 });
app.patch('/courses/', async ({ body, set }) => { 
    if ("" == body.target || "" == body.newName){ set.status = 400; return "Lacking input"; }
    let check = await Course.exists({ name : body.target });
    if (!check) { set.status = 400; return "Course doesnt exist."; }
    const target = await Course.findOne({name : body.target});
    target.name = body.newName;
    try { await target.save(); } 
    catch (error) 
    { console.log(error); set.status = 400; return "Patch: Faliure"; }
    return "Patch: Success"; 
 });
app.patch('/lessons/', async ({ body, set }) => {  });
app.patch('/groups/', async ({ body, set }) => {  }); // Don't even bother
app.patch('/students/', async ({ body, set }) => { // This isn't done yet ... bug: text fields are emptied upon if-checking
    if ("" == body.target){ set.status = 400; return "Lacking target"; }
    if (! await Student.exists({ name : body.target })) { set.status = 400; return "Student doesnt exist."; }
    const target = await Student.findOne({name : body.target});
    console.log(target);
    if ("" != body.newName) {
        if (await Student.exists({ name: body.newName}))
        { set.status = 400; return "Student with suggested name already exists."; }
        else { target.name = body.newName; }  
    }
    console.log(target);
    if ("" != body.course) { target.course = body.newCourse }
    if ("" != body.newGmail) { target.gmail = body.newGmail; }
    if ("" != body.newPhoneNumber) { target.phoneNumber = body.newPhoneNumber; }
    console.log(target);
    try { await target.save(); } 
    catch (error) 
    { console.log(error); set.status = 400; return "Patch: Faliure"; }
    return "Patch: Success"; 
 });
app.patch('/teachers/', async ({ body, set }) => {  });


// ---------------------------------------------------------

// ---------------------------------------------------------
// GROUP REQUESTS -------------------------------------------



// ---------------------------------------------------------


app.get('/', () => {
    let message = "";
    message += "Functions:\n";
    message += "\ng/p/d\t/classrooms";
    message += "\ng/p/d\t/courses";
    message += "\ng/p/d\t/groups";
    message += "\ng/p/d\t/lessons";
    message += "\ng/p/d\t/students";
    message += "\ng/p/d\t/teachers";
    return message;
});

app.delete('/burnitall', async () => {
    await Classroom.deleteMany();
    await Course.deleteMany();
    await Group.deleteMany();
    await Lesson.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    let message = "The records: all burned.\nYou must start anew now.\nBut it will all be worth it in the end, right?\n\n...right?";
    return message;
});

// Put this on bottom
app.listen(8080, () => console.log("Webserver up and running at http://localhost:8080\n"));