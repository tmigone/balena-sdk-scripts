const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const appId = 1767644
const version = '3.5.3'

async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    const result = await balena.pine.get({
      resource: 'release',
      options: {
        $filter: {
          belongs_to__application: appId,
          release_version: version
        }
      }
    })
    console.log(result.map(r => r.id))

    for (const id of result.map(r => r.id)) {
      const deletedId = await balena.pine.delete({
        resource: 'release',
        id: id
      })
      console.log(`Deleted release with id ${id}: ${deletedId}`)
    }
  } catch (error) {
    console.log(error)
  }
}

run()
