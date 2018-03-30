const exec = require('child_process').execSync
const execThunk = command => _ => exec(command)
const axios = require('axios')
const links = require('./links.json')

// splits after GH org names ending in s, like ga-wdi-lessons/ and ga-wdi-exercises/
const ORG_AGNOSTIC_SEPARATOR = 's/'
const repos = links.map(link => link.split(ORG_AGNOSTIC_SEPARATOR)[1])
const orgRepos = links.map(link => link.replace('https://git.generalassemb.ly/', ''))

// links.forEach(tryClone)
// repos.forEach(createRemoteRepo)
// repos.forEach(transferBranchesPush)

// repos.forEach(nuke)
// repos.forEach(privatize)

function remote (repo) {
  const TARGET_ORG_NAME = 'dc-wdi-react-redux'
  return `https://git.generalassemb.ly/${TARGET_ORG_NAME}/${repo}`
}

function tryClone (repo) {
  tryMe(execThunk(`cd repos/ && git clone ${repo}`))
}

function transferBranchesPush (repo) {
  let dirPath = `repos/${repo}`
  tryMe(execThunk(`cd ${dirPath} && git pull origin *:*`))
  tryMe(execThunk(`cd ${dirPath} && git remote add upstream ${remote(repo)}`))
  tryMe(execThunk(`cd ${dirPath} && git push -u upstream *:*`))
}

function privatize (repo) {
  axios
  .patch(`https://git.generalassemb.ly/api/v3/repos/${TARGET_ORG_NAME}/${repo}?access_token=${process.env.token}`, {private: true})
  .then(res => console.log(`${res.data.url} updated to private`))
  .catch(error => console.error(error.response.data))
}

function createRemoteRepo (repo) {
  const postURL = `https://git.generalassemb.ly/api/v3/orgs/dc-wdi-react-redux/repos?access_token=${process.env.token}`
  axios
  .post(postURL, {name: repo})
  .then(res => {
    console.log(`${res.data.url} created`)
    transferBranchesPush()
  })
  .catch(error => console.error(error.response.data))
}

function nuke (repo) {
  axios
  .delete(`https://git.generalassemb.ly/api/v3/repos/dc-wdi-react-redux/${repo}?access_token=${process.env.token}`)
  .then(res => console.log(`deleted ${repo}`))
  .catch(error => console.error(error))
}

function tryMe (tryThis) {
  try {
    tryThis()
  } catch (error) {
    console.error(`☠️  PID ${error.pid} exited with status code ${error.status}`)
  }
}
