import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
import { getAllPermissions, getPermissionByUserId, updatePermission } from "./permissions.controller.js"



const router = Router()

//what will be my task??
// i have to assign permissions to user 
// what action i will take for that ??
// action can be assign perissions to user
// edit the permissions 
// get permission to user tats it 

router.get('/permissions',authenticatUser, getAllPermissions)
router.get('/:userId',authenticatUser,getPermissionByUserId)
router.patch('/:userId',authenticatUser,updatePermission)

export const permissionRouter=router