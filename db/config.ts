import { defineDb, defineTable, column } from 'astro:db';
import { v4 as uuid } from 'uuid';

const Student = defineTable({
  columns: {
    id: column.text({ primaryKey: true, default: uuid() }),
    firstName: column.text(),
    fatherName: column.text(),
    grandFatherName: column.text(),
    lastName: column.text(),
    birthDate: column.date()
  },
});

const Circle = defineTable({
  columns: {
    number: column.number({ primaryKey: true })
  }

})

const Group = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    circle: column.number({ references: () => Circle.columns.number }),
    year: column.number(),
    teacherId: column.text({ references: () => Teacher.columns.id, optional: true })
  }
})

const StudentGroup = defineTable({
  columns: {
    studentId: column.text({ references: () => Student.columns.id }),
    groupId: column.text({ references: () => Group.columns.id })
  },
})

const Teacher = defineTable({
  columns: {
    id: column.text({ primaryKey: true, default: uuid() }),
    firstName: column.text(),
    lastName: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Student, Circle, Group, StudentGroup, Teacher },
});





