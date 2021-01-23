import * as core from '@actions/core'
import * as reportCore from './core'

async function run(): Promise<void> {
  try {
    const status = core.getInput('job-status', { required: true }).toLowerCase();
    let accessToken = await reportCore.getSpaceAccessToken()
    if (accessToken) {
      switch (status) {
        case "success":
          reportCore.updateReportStatus(accessToken, reportCore.ExecutionStatus.Succeeded)
        default:
          reportCore.updateReportStatus(accessToken, reportCore.ExecutionStatus.Failed)
      }
      
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
