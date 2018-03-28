const exec = require('child_process').execSync
const execThunk = command => _ => exec(command)
const axios = require('axios')
const links = require('./links.json')

const SEPARATOR = 's/' // splits after GH org names ending in s, like ga-wdi-lessons/ and ga-wdi-exercises/
const repos = links.map(link => link.split(SEPARATOR)[1])

const ORG_NAME = 'dc-wdi-react-redux'
const remote = repo => `https://git.generalassemb.ly/${ORG_NAME}/${repo}`
const tryClone = repo => tryMe(execThunk(`git clone ${repo}`))
const tryPush = repo => {
  tryMe(execThunk(`cd ${repo} && git remote add upstream ${remote(repo)}`))
  tryMe(execThunk(`cd ${repo} && git push -u upstream master`))
}

// links.forEach(tryClone)
// repos.forEach(tryPost)
// repos.forEach(tryPush)

function tryPost (repo) {
  const postURL = `https://git.generalassemb.ly/api/v3/orgs/dc-wdi-react-redux/repos?access_token=${process.env.token}`
  axios
  .post(postURL, {name: repo})
  .then(res => {
    console.log(`${res.data.url} created`)
    tryPush()
  })
  .catch(error => console.error(error.response.data))
}

function tryMe (tryThis) {
  try {
    tryThis()
  } catch (error) {
    console.error(`☠️  PID ${error.pid} exited with status code ${error.status}`)
  }
}
