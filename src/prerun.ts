import * as core from '@actions/core'
import * as reportCore from './core'

async function run(): Promise<void> {
  try {
    const accessToken = await reportCore.getSpaceAccessToken()
    if (accessToken) {
      reportCore.updateReportStatus(
        accessToken,
        reportCore.ExecutionStatus.Running
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
