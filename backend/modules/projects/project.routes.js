import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js" 
import { createProject, getAllProjects, getProjectById, updateProject, updateStatusProject, addProjectMember } from "./project.controller.js"



const router = Router()
 
router.get('/',authenticatUser, getAllProjects)
router.get('/:id', authenticatUser, getProjectById)
router.post('/',authenticatUser,createProject)
router.post('/:id/members', authenticatUser, addProjectMember)
router.patch('/:id',authenticatUser,updateProject   )
router.patch('/:id/status',authenticatUser,updateStatusProject)

export const projectRouter=router