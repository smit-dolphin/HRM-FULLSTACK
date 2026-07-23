import {
    updateCompneyPolicy
} from "./setting.reposetry.js"
import {
    updateCompanySettingsSchema
} from "./setting.validation.js"



export const updateCompneyPolicyService = async (reqBody) => {

    //
    //now what i am going to here??
    // i am going to get all
    // now how we are going to do setting ??
    // get all fields validate them
    //check scopes
    //if yes  then do setting 
    // its that simple



    const validateResult = updateCompanySettingsSchema.safeParse(reqBody)

    if (!validateResult.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid compney setting fields",
            error: validateResult.error.issues[0].message
        }
    }

    //now what ?? field validation done
    //fields are validation, 
    // so i can check scopes

    //yes now i should create a  finction which prevent me to edit compney policy ,
    // wait but  i need policy here?? sttings:update:compney ,i need scope , bcs there will be more settings in future
    //i am diching scopes bcs keep the, difrent resource whihc only super admin access
    //so i can directly update fields

    //     id   String @id @default(cuid())

    //   companyName String
    //   timezone    String
    //   currency    String

    //   officeStartTime DateTime?
    //   officeEndTime   DateTime?
    //   workingMinutes    Int

    //   defaultProbationMonths Int
    //   defaultNoticePeriodDays Int

    //   lateGraceMinutes Int

    //   weeklyOffDays String[]

    //   createdAt DateTime @default(now())
    //   updatedAt DateTime @updatedAt


    const update_result = await updateCompneyPolicy({
        data: validateResult.data
    })


    return {
        success: true,
        status: 200,
        message: "compney settings updated successfully",
        data:update_result
    }





}