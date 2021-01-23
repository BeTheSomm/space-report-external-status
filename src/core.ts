import * as core from '@actions/core'
import axios from 'axios'
import ClientOAuth2 from 'client-oauth2'

export enum ExecutionStatus {
  Pending = 'PENDING',
  Running = 'RUNNING',
  Succeeded = 'SUCCEEDED',
  Failed = 'FAILED'
}

export const JobStatus = 'JOB_STATUS'

export async function getSpaceAccessToken(): Promise<
  ClientOAuth2.Token | undefined
> {
  const spaceServiceURL = core.getInput('space-service-url')
  const clientID = core.getInput('client-id')
  const clientSecret = core.getInput('client-secret')
  const tokenHost = `https://${spaceServiceURL}/oauth/token`

  const spaceAuth = new ClientOAuth2({
    clientId: clientID,
    clientSecret,
    accessTokenUri: tokenHost,
    scopes: ['Project:PushCommitStatus']
  })

  try {
    const accessToken = await spaceAuth.credentials.getToken()
    return accessToken
  } catch (error) {
    console.log('Access Token error', error.message)
  }
}

export async function updateReportStatus(
  accessToken: ClientOAuth2.Token,
  status: ExecutionStatus
): Promise<void> {
  const GITHUB_WORKFLOW = process.env.GITHUB_WORKFLOW
  const GITHUB_REF = process.env.GITHUB_REF
  const GITHUB_SHA = process.env.GITHUB_SHA
  const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY
  const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID
  const spaceServiceURL = core.getInput('space-service-url')
  const projectID = core.getInput('project-id')
  const repositoryName = core.getInput('repository-name')

  const url = `https://${spaceServiceURL}/api/http/projects/id:${projectID}/repositories/${repositoryName}/revisions/${GITHUB_SHA}/external-checks`
  console.log(`ReportStatus.url: ${url}`)

  const data = {
    branch: GITHUB_REF,
    executionStatus: status,
    url: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
    externalServiceName: 'Github Actions',
    taskName: GITHUB_WORKFLOW,
    taskId: GITHUB_RUN_ID,
    timestamp: Date.now()
  }

  try {
    axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${accessToken.accessToken}`
    axios.defaults.headers.common['content-type'] = 'application/json'
    const response = await axios.post(url, data)
    if (response.status === 200) {
      console.log(response.data)
    } else {
      core.setFailed('Space was not notified')
    }
  } catch (error) {
    console.log(`Space POST failed: ${error.message}`)
    core.setFailed('Space was not notified')
  }
}
