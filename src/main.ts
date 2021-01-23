import * as core from '@actions/core'
import * as reportCore from './core'

async function run(): Promise<void> {
  try {
    const status = core.getInput('job-status', {required: true}).toLowerCase()
    const accessToken = await reportCore.getSpaceAccessToken()
    if (accessToken) {
      switch (status) {
        case 'success':
          reportCore.updateReportStatus(
            accessToken,
            reportCore.ExecutionStatus.Succeeded
          )
          break
        default:
          reportCore.updateReportStatus(
            accessToken,
            reportCore.ExecutionStatus.Failed
          )
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
