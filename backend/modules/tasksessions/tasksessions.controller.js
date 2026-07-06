import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import prisma from "../../config/prisma.config.js"
import {
  createTaskSessionSchema,
  updateTaskSessionSchema,
  updateTaskSessionStatusSchema,
} from "./tasksessionsValidation.schema.js"

// export const startTaskSession = async (req, res) => {
//   try {
//     //buissmess logic??
//     // create a timer ,but first check if already ceated?? for today only??
//     //for task start we have to check if todays timer is created?? //so first fint dodays timer??
//     //what front end will do ?? if he click btn 
//     //logic is changed now 
//     //now we check if active session exist??
//     // no then create new for that task
//     //check from status first
//     // if timer exist then resume it if (if there is break active )
//     //if break not exist than do nothing 
//     //all opreatioms

//     const taskId = req.params.taskId

//     const userId = req.user.id

//     //current active tasl??
//     const currentEmployee = await prisma.employee.findUnique({ where: { userId } })
//     const currentTask = await prisma.taskSessionTimer.findMany({
//       where:
//       {
//         taskId,
//         employeeId: currentEmployee.id,
//         startTime: {
//           gte: new Date(new Date().setHours(0, 0, 0, 0)),
//           lt: new Date(new Date().setHours(23, 59, 59, 999))
//         }
//       }, orderBy: {
//         createdAt: "desc"
//       }, take: 1
//     })

//     // running
//     // paused
//     // completed

//     if (currentTask.length === 0) {

//       const result = await prisma.taskSessionTimer.create({
//         data: {
//           taskId,
//           employeeId: currentEmployee.id,
//           taskSessionStatus: "running",
//           startTime: new Date(),
//         }
//       })
//       return successResponse(res, 201, "created timer successfully", result)

//     }
//     else if(currentTask[0].taskSessionStatus=="pushed"){
//       const currentBreak=await prisma.break.update({
//         where:{taskSessionTimerId:currentTask[0].id,startedAt:!null,endedAt:null},
//         data:{endedAt:new Date()}
//       })
//       return successResponse(res, 200, "resumed timer successfully", currentBreak)
//     }
//     else if(currentTask[0].taskSessionStatus=="completed"){
//       const result = await prisma.taskSessionTimer.create({
//         data: {
//           taskId,
//           employeeId: currentEmployee.id,
//           taskSessionStatus: "running",
//           startTime: new Date(),
//         }
//       })
//       return successResponse(res, 201, "created timer successfully", result)
//     }

//     //now existing break oprations
//     //state??
//     //running -> do nothing
//     // pushed?? -> find break -resume it,end timer
//     //completed?? -> create new timer








//     return successResponse(res, 200, "Not implemented", currentTask)
//   } catch (error) {
//     return errorResponse(res, 500, "Something went wrong", error.message)
//   }
// }

// export const startTaskSession = async (req, res) => {
//   try {
//     const taskId = req.params.taskId;
//     const userId = req.user.id;

//     const employee = await prisma.employee.findUnique({
//       where: { userId }
//     });

//     if (!employee) {
//       return errorResponse(res, 404, "Employee not found");
//     }

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const endOfToday = new Date();
//     endOfToday.setHours(23, 59, 59, 999);

//     // 1. Find latest active session (running or paused)
//     let session = await prisma.taskSessionTimer.findFirst({
//       where: {
//         taskId,
//         employeeId: employee.id,
//         taskSessionStatus: {
//           in: ["running", "paused"]
//         }
//       },
//       orderBy: { createdAt: "desc" }
//     });

//     // 2. Lazy rollover: if session belongs to previous day → close it
//     if (session && session.startTime < startOfToday) {
//       await prisma.taskSessionTimer.update({
//         where: { id: session.id },
//         data: {
//           taskSessionStatus: "completed",
//           endTime: new Date()
//         }
//       });

//       session = null;
//     }

//     // 3. CASE: No session → create new
//     if (!session) {
//       const newSession = await prisma.taskSessionTimer.create({
//         data: {
//           taskId,
//           employeeId: employee.id,
//           taskSessionStatus: "running",
//           startTime: new Date()
//         }
//       });

//       return successResponse(res, 201, "Session started", newSession);
//     }

//     // 4. CASE: running → do nothing
//     if (session.taskSessionStatus === "running") {
//       return successResponse(res, 200, "Session already running", session);
//     }

//     // 5. CASE: paused → resume
//     if (session.taskSessionStatus === "paused") {
//       // close active break
//       await prisma.break.updateMany({
//         where: {
//           taskSessionTimerId: session.id,
//           endedAt: null
//         },
//         data: {
//           endedAt: new Date()
//         }
//       });


//       // resume session
//       const updatedSession = await prisma.taskSessionTimer.update({
//         where: { id: session.id },
//         data: {
//           taskSessionStatus: "running"
//         }
//       });

//       return successResponse(res, 200, "Session resumed", updatedSession);
//     }

//     // fallback
//     return successResponse(res, 200, "No action taken", session);

//   } catch (error) {
//     return errorResponse(res, 500, "Something went wrong", error.message);
//   }
// };


export const startTaskSession = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return errorResponse(res, 404, "Employee not found");
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // -----------------------------------------------------
    // STEP 1: Auto-switch (pause another running task)
    // -----------------------------------------------------

    const runningSession = await prisma.taskSessionTimer.findFirst({
      where: {
        employeeId: employee.id,
        taskSessionStatus: "running"
      }
    });

    if (runningSession && runningSession.taskId !== taskId) {
      await prisma.$transaction([
        prisma.break.create({
          data: {
            taskSessionTimerId: runningSession.id,
            startedAt: new Date()
          }
        }),

        prisma.taskSessionTimer.update({
          where: {
            id: runningSession.id
          },
          data: {
            taskSessionStatus: "paused"
          }
        })
      ]);
    }

    // -----------------------------------------------------
    // STEP 2: Find today's session for requested task
    // -----------------------------------------------------

    let session = await prisma.taskSessionTimer.findFirst({
      where: {
        taskId,
        employeeId: employee.id,
        taskSessionStatus: {
          in: ["running", "paused"]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // -----------------------------------------------------
    // STEP 3: Lazy rollover
    // -----------------------------------------------------

    if (session && session.startTime < startOfToday) {
      await prisma.taskSessionTimer.update({
        where: {
          id: session.id
        },
        data: {
          taskSessionStatus: "completed",
          endTime: new Date()
        }
      });

      session = null;
    }

    // -----------------------------------------------------
    // STEP 4: Create new session
    // -----------------------------------------------------

    if (!session) {
      const newSession = await prisma.taskSessionTimer.create({
        data: {
          taskId,
          employeeId: employee.id,
          taskSessionStatus: "running",
          startTime: new Date()
        }
      });

      return successResponse(res, 201, "Session started", newSession);
    }

    // -----------------------------------------------------
    // STEP 5: Already running
    // -----------------------------------------------------

    if (session.taskSessionStatus === "running") {
      return successResponse(res, 200, "Session already running", session);
    }

    // -----------------------------------------------------
    // STEP 6: Resume paused session
    // -----------------------------------------------------

    await prisma.$transaction([
      prisma.break.updateMany({
        where: {
          taskSessionTimerId: session.id,
          endedAt: null
        },
        data: {
          endedAt: new Date()
        }
      }),

      prisma.taskSessionTimer.update({
        where: {
          id: session.id
        },
        data: {
          taskSessionStatus: "running"
        }
      })
    ]);

    const updatedSession = await prisma.taskSessionTimer.findUnique({
      where: {
        id: session.id
      }
    });

    return successResponse(res, 200, "Session resumed", updatedSession);

  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};


export const pauseTaskSession = async (req, res) => {
  try {

    const taskId = req.params.taskId;
    const userId = req.user.id;

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return errorResponse(res, 404, "Employee not found");
    }

   

    // 1. Find latest active session (running or paused)
    const session = await prisma.taskSessionTimer.findFirst({
      where: {
        taskId,
        employeeId: employee.id,
        taskSessionStatus:"running"
        
      },
      orderBy: { createdAt: "desc" }
    });

    if (!session) {
      return errorResponse(res, 404, "No active session found to pause");
    }

    const [createBreak] = await prisma.$transaction([
      prisma.break.create({
        data: {
          taskSessionTimerId: session.id,
          startedAt: new Date()
        }
      }),

      prisma.taskSessionTimer.update({
        where: {
          id: session.id
        },
        data: {
          taskSessionStatus: "paused"
        }
      })
    ]);

    //total sec on task resume only 

    return successResponse(res, 200, "Session paused", createBreak);

  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
}

export const stopTaskSession = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return errorResponse(res, 404, "Employee not found");
    }

    const session = await prisma.taskSessionTimer.findFirst({
      where: {
        taskId,
        employeeId: employee.id,
        taskSessionStatus: {
          in: ["running", "paused"]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!session) {
      return errorResponse(res, 404, "No active session found");
    }

    await prisma.$transaction([
      prisma.break.updateMany({
        where: {
          taskSessionTimerId: session.id,
          endedAt: null
        },
        data: {
          endedAt: new Date()
        }
      }),

      prisma.taskSessionTimer.update({
        where: {
          id: session.id
        },
        data: {
          taskSessionStatus: "completed",
          endTime: new Date()
          // totalSeconds: calculate later
        }
      })
    ]);

    const completedSession = await prisma.taskSessionTimer.findUnique({
      where: {
        id: session.id
      }
    });

    return successResponse(
      res,
      200,
      "Task session completed",
      completedSession
    );

  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};
