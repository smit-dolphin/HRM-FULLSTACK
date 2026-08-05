import { Router } from "express" 
import { authorize } from "../../middleware/authorize.middleware.js"
import { compneyPolicySetting, compneyLeaveSetting, createLeavePolicySetting, updateLeavePolicySetting } from "./setting.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"


const router = Router()

router.patch("/compney-policy", authenticatUser, authorize("company_settings", "update"), compneyPolicySetting)
router.patch("/leave-setting", authenticatUser, authorize("leave_settings", "update"), compneyLeaveSetting)
router.post("/leave-policy", authenticatUser, authorize("leave_settings", "update"), createLeavePolicySetting)
router.patch("/leave-policy/:id", authenticatUser, authorize("leave_settings", "update"), updateLeavePolicySetting)

// TODO:- add a global get route for all settings
export const settingRouter = router
