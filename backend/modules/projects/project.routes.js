import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js" 
import { createProject, getAllProjects, getProjectById, updateProject, updateStatusProject, addProjectMember,getAllMembers ,removeMember} from "./project.controller.js"

const router = Router()
 
router.get('/',authenticatUser,autherize('project:list:view'), getAllProjects)
router.get('/:id', authenticatUser,autherize('project:view'), getProjectById)
router.get('/:id/members', authenticatUser,autherize('project:members:view'), getAllMembers)

//for super admin 
//dashboard

router.post('/',authenticatUser,autherize('project:create'),createProject)
router.post('/:id/members', authenticatUser,autherize('project:member:create'), addProjectMember)

router.delete('/:id/members/:employeeId',authenticatUser,autherize('project:member:delete'),removeMember)

router.patch('/:id',authenticatUser,autherize('project:edit'),updateProject   )
router.patch('/:id/status',authenticatUser,autherize('project:status:edit'),updateStatusProject)

export const projectRouter=router