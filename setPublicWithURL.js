const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const appSlugs = [
  'g_tomas_migone1/openfleettest'
]

async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    for (const slug of appSlugs) {
      const result = await balena.pine.patch({
        resource: 'application',
        id: { slug: slug },
        body: {
          is_public: true,
          is_stored_at__repository_url: 'https://github.com/balenalabs/balena-sound'
        }
      })
      console.log(result)
    }
  } catch (error) {
    console.log(error)
  }
}

run()
