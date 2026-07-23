import { Router } from "express" 
import { authorize } from "../../middleware/authorize.middleware.js"
import { compneyPolicySetting } from "./setting.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"


const router = Router()

router.patch("/compney-policy",authenticatUser,authorize("company_settings","update"),compneyPolicySetting)

export const settingRouter = router
