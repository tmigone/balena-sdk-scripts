const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const orgId = 182277
async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    const result = await balena.pine.get({
      resource: 'application',
      options: {
        $filter: {
          organization: orgId
        }
      }
    })
    console.log(result.map(r => r.id))

    for (const id of result.map(r => r.id)) {
      const updatedId = await balena.pine.patch({
        resource: 'application',
        id: id,
        body: {
          is_of__class: 'block'
        }
      })
      console.log(`Updated application ${id}: ${updatedId}`)
    }
  } catch (error) {
    console.log(error)
  }
}

run()
