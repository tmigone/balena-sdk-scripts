const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const appSlugs = [
  'g_tomas_migone1/balena-sounddwb2',
  'g_tomas_migone1/balenasound-rpi4',
  'g_tomas_migone1/openfleettest',
  'g_tomas_migone1/openfleettest2'
]

async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    for (const slug of appSlugs) {
      const result = await balena.pine.patch({
        resource: 'application',
        id: { slug: slug },
        body: {
          is_public: false
        }
      })
      console.log(result)
    }
  } catch (error) {
    console.log(error)
  }
}

run()
