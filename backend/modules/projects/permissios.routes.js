import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js" 



const router = Router()
 

router.get('/',(req,res)=>{
    res.send('hello project')
})
// router.get('/permissions',authenticatUser,autherize('admin:permission:view'), getAllPermissions)
// router.get('/:userId',authenticatUser,autherize('admin:permission:view'),getPermissionByUserId)
// router.patch('/:userId',authenticatUser,autherize('admin:permission:edit'),updatePermission)

export const projectRouter=router