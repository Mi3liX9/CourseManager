import { Faker, ar } from '@faker-js/faker';
import { Circle, Group, Student, StudentGroup, db, eq, Teacher } from 'astro:db';
import { v4 as uuid } from 'uuid';

// https://astro.build/db/seed
export default async function seed() {
	// Generate random 10 students
	await db.insert(Student).values(Array.from({ length: 100 }, () => createRandomStudent()))

	await db.insert(Circle).values(Array.from({ length: 12 }, (_, i) => ({ number: i + 1 })))

	await db.insert(Group).values(await generateGroups())

	await assignStudentsToGroups();
}


const faker = new Faker({
	locale: [ar],
});

/**
 * Create a random student data.
 * Warning: It is not typed yet.
 * @returns student
 */
function createRandomStudent() {
	return {
		id: faker.string.uuid(),
		firstName: faker.person.firstName("male"),
		fatherName: faker.person.firstName("male"),
		grandFatherName: faker.person.firstName("male"),
		lastName: faker.person.lastName(),
		birthDate: faker.date.between({ from: new Date(2006, 0, 0), to: new Date(2017, 12, 31) })
	}
}

const randomizeNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

type GroupType = typeof Group["$inferInsert"]
async function generateGroups(): Promise<GroupType[]> {
	const groups: GroupType[] = []
	for (let i = 0; i < 12; i++) {
		const randomNum = randomizeNumber(3, 10);

		for (let j = 0; j < randomNum; j++) {
			const groupTeacher = await insertRandomTeacher()
			groups.push({ circle: i + 1, name: faker.person.firstName(), id: Math.random() + "", year: randomizeNumber(2023, 2024), teacherId: groupTeacher }) // Just fake names :)
		}
	}

	return groups;
}

const calculateAge = (birthDate: Date) => Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

const randomElement = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)];

async function assignStudentsToGroups() {
	const students = await db.select().from(Student);

	const studentsWithAges = students.map((student) => ({ ...student, age: calculateAge(student.birthDate) }));

	const queries = [];

	for (const student of studentsWithAges) {
		// Students will join circle 1 with age of 6, 
		// The maximum age will be 18 which is group 12.
		// So, for calculaction we will be: age - 6.
		const circle = student.age - 6;

		if (circle > 0 && circle < 13) {
			const groups = await db.select().from(Group).where(eq(Group.circle, circle));
			const randomGroup = randomElement(groups);
			queries.push(db.insert(StudentGroup).values({ studentId: student.id, groupId: randomGroup.id }))
		}
	}

	await db.batch(queries as any);

}
type TeacherType = typeof Teacher["$inferInsert"]
function generateRandomTeacher(id?: string): TeacherType {
	return {
		id,
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
	}
}

async function insertRandomTeacher() {
	const id = uuid();
	await db.insert(Teacher).values([generateRandomTeacher(id)])
	return id;
}