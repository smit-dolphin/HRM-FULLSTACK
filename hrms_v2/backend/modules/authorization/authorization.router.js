import { Router } from "express"
import {
    createRole,
    getPermissions,
    getRoles,
    getRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    assignPermissionToRole,
    removePermissionFromRole
} from "./authorization.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"


const router = Router()

router.get("/permissions",authenticatUser,authorize("authorization","view"), getPermissions)

router.post("/roles",authenticatUser,authorize("authorization","create"), createRole)
router.get("/roles",authenticatUser,authorize("authorization","view"), getRoles)
router.get("/roles/:id",authenticatUser,authorize("authorization","view"), getRole)
router.patch("/roles/:id",authenticatUser,authorize("authorization","update"), updateRole)
router.delete("/roles/:id",authenticatUser,authorize("authorization","delete"), deleteRole)

router.get("/roles/:id/permissions",authenticatUser,authorize("authorization","view"), getRolePermissions)
router.post("/roles/:id/permissions",authenticatUser,authorize("authorization","update"), assignPermissionToRole)
router.delete("/roles/:id/permissions/:permissionId",authenticatUser,authorize("authorization","update"), removePermissionFromRole)

export const authorizationRouter = router
