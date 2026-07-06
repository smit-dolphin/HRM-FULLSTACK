import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js" 
import { createProject, getAllProjects, getProjectById, updateProject, updateStatusProject, addProjectMember,getAllMembers ,removeMember} from "./project.controller.js"

const router = Router()
 
router.get('/',authenticatUser, getAllProjects)
router.get('/:id', authenticatUser, getProjectById)
router.get('/:id/members', authenticatUser, getAllMembers)

router.post('/',authenticatUser,createProject)
router.post('/:id/members', authenticatUser, addProjectMember)

router.delete('/:id/members/:employeeId',authenticatUser,removeMember)

router.patch('/:id',authenticatUser,updateProject   )
router.patch('/:id/status',authenticatUser,updateStatusProject)

export const projectRouter=router