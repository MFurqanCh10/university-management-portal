import { getAllStudents as getAllStudentsService, createStudent, updateStudentById, deleteStudentById } from "../services/student.service.js";

export  async function getAllStudents(req, res, next) {
    try {
        const result = await getAllStudentsService({
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            departmentId: req.query.departmentId,
            sortBy: req.query.sortBy,

        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}


export const addStudent = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({ message: "Name and Email are required" });
        }
        const student = await createStudent(name.trim(), email.trim());
        res.status(201).json({
            message: "Student created successfully", student,
        });

    } catch (error) {
        next(error);

    }

};
export const updateStudent = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        const student = await updateStudentById(
            req.params.id,
            name.trim(),
            email.trim()
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({
            message: "Student updated successfully",
            student,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteStudent = async (req, res, next) => {
    try {
        const deleted = await deleteStudentById(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "student not found" });

        }
        res.json({ message: "Student deleted successfully" });
    } catch (error) {


        next(error);
    }

};

export { getAllStudents as listStudents };
