const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const appsToPull = [
 'balena-minecraft-server',
 'balena-adguard',
 'balena-bookstack',
 'balena-pihole'
]

async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    for (const appName of appsToPull) {
      const result = await balena.pine.patch({
        resource: 'application',
        body: {
          is_public: false
        },
        options: {
          $filter: {
            is_public: true,
            app_name: appName
          }
        }
      })
      console.log(`Updated application ${appName}: ${result}`)
    }
  } catch (error) {
    console.log(error)
  }
}

run()
