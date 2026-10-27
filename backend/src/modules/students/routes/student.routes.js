import { Router } from "express";
import {
  listStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import { authenticate } from "../../../middleware/authenticate.js";

const router = Router();

router.get("/", authenticate, listStudents);
router.post("/", authenticate, addStudent);
router.put("/:id" , authenticate, updateStudent);
router.delete("/:id", authenticate, deleteStudent);

export default router;