 - [X] GET classrooms
 - [X] POST classrooms
 - [X] DELETE classrooms 

 - [X] GET courses
 - [X] POST courses
 - [X] DELETE courses

 - [X] GET groups
 - [X] POST groups
 - [X] DELETE groups

 - [X] GET students
 - [X] POST students
 - [X] DELETE students

 - [X] GET teachers
 - [X] POST teachers
 - [X] DELETE teachers

 - [X] GET lessons
 - [X] POST lessons (after vibecheck overhaul)
 - [X] DELETE lessons

 - [X] Lessons : Vibecheck
 - [ ] Lessons : Collision check // check with Sebbe about Date format
 - [ ] Group   : Vibecheck
 - [X] Student : Vibecheck

 - [X] Delete command sends false positives on less-than-full successes (ex. SvenA exists. requests to delete "Sven", db finds SvenA, confirms he exists, but doesn't delete him. Sends false positive on deletion request.) This has no impact on data sequrity, will only actally delete if both strings are pefect match.  

- [X] Edit Classroom
- [X] Edit Course
- [X] Edit Student Name 
- [ ] Edit Student Course
- [ ] Edit Student Contact Info
- [ ] Edit Teacher Name 
- [ ] Edit Teacher Contact Info
- [ ] Edit Group Name (and update across all who cites previous name)
- [ ] Add specific student to group
- [ ] Remove specific student from group
- [ ] Edit Course Name (-//-)
- [ ] Edit Classroom Name (-//-)

- [ ] Add multiple lessions in a row unsing a single template
- [ ] Edit template, and have all related template lessons updated to match