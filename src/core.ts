import * as core from '@actions/core'
import * as github from '@actions/github'
import * as auth from 'simple-oauth2'
import axios from 'axios';

export enum ExecutionStatus {
    Pending = "PENDING",
	Running = "RUNNING",
	Succeeded = "SUCCEEDED",
	Failed = "FAILED",
}

export const JobStatus: string = "JOB_STATUS"

export async function getSpaceAccessToken(): Promise<auth.AccessToken | undefined> {
    let tokenHost: string = `https://${core.getInput('space-service-url')}/oauth/token`
    const config: auth.ModuleOptions = {
        client: {
            id: core.getInput('client-id'),
            secret: core.getInput('client-secret')
        },
        auth: {
            tokenHost: tokenHost
        }
    };
    
    const client: auth.ClientCredentials = new auth.ClientCredentials(config);
    const tokenConfig: auth.ClientCredentialTokenConfig = {}
    try {
        const accessToken = await client.getToken(tokenConfig);
        return accessToken
    } catch (error) {
        console.log('Access Token error', error.message);
    }
}

export async function updateReportStatus(accessToken: auth.AccessToken, status: ExecutionStatus) {
    const GITHUB_WORKFLOW = process.env.GITHUB_WORKFLOW;
    const GITHUB_REF = process.env.GITHUB_REF;
    const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL;
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;

    var url = `https://${core.getInput('space-service-url')}/api/http/projects/id:${core.getInput('project-id')}/repositories/${core.getInput('repository-name')}/revision/${GITHUB_REF}/external-checks`
    console.log(`ReportStatus.url: ${url}`);

    var data = {
        "branch":GITHUB_REF,
        "executionStatus":status,
        "url":`${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
        "externalServiceName":"Github Actions",
        "taskName":GITHUB_WORKFLOW,
        "taskId":GITHUB_RUN_ID,
        "timestamp":Date.now()
     }

     console.log(`ReportStatus.data: ${JSON.stringify(data)}`);

    axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken.token;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.post(url, data).then(function (response) {
        if(response.status == 200) {
            console.log(response.data);
        } else {
            core.setFailed('Space was not notified')
        }
      });
}

/*
const core = require('@actions/core');
const github = require('@actions/github');
const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');

const executionStatus = {
	PENDING: "PENDING",
	RUNNING: "RUNNING",
	SUCCEEDED: "SUCCEEDED",
	FAILED: "FAILED",
}

async function getSpaceAccessToken() {
    var tokenHost = `https://${core.getInput('space-service-url')}/oauth/token`
    console.log(`tokenHost: ${tokenHost}`);

    const config = {
        client: {
          id: core.getInput('client-id'),
          secret: core.getInput('client-secret')
        },
        auth: {
          tokenHost: tokenHost
        }
      };

    const client = new ClientCredentials(config);
  
    try {
    //   const accessToken = await client.getToken(tokenParams);
      const accessToken = await client.getToken();
      return accessToken
    } catch (error) {
      console.log('Access Token error', error.message);
    }
}

function updateReportStatus(accessToken, status) {
    var request = require('request');

    const GITHUB_WORKFLOW = process.env.GITHUB_WORKFLOW;
    const GITHUB_REF = process.env.GITHUB_REF;
    const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL;
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
    const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;

    var url = `https://${core.getInput('space-service-url')}/api/http/projects/id:${core.getInput('project-id')}/repositories/${core.getInput('repository-name')}/revision/${GITHUB_REF}/external-checks`
    console.log(`ReportStatus.url: ${url}`);

    var data = {
        "branch":GITHUB_REF,
        "executionStatus":status,
        "url":`${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
        "externalServiceName":"Github Actions",
        "taskName":GITHUB_WORKFLOW,
        "taskId":GITHUB_RUN_ID,
        "timestamp":Date.now()
     }

     console.log(`ReportStatus.data: ${JSON.stringify(data)}`);

    var headers = {
        'Authorization':'Bearer ' + accessToken.token,
        'Content-Type': 'application/json'
    }

    var options = {
        method: 'POST',
        body: data,
        json: true,
        url: url,
        headers: headers
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        } else {
            core.setFailed('Space was not notified')
        }
    }

    request(options, callback);
}
*/