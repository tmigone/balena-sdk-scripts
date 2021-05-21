const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const appId = 1677085
const version = '2.0.0'

async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    const result = await balena.pine.get({
      resource: 'application',
      options: {
        $expand: {
          owns__public_device: {
            $select: ['was_recently_online']
          }
        },
        $filter: {
          is_public: true,
          is_discoverable: true,
          is_host: false,
          is_of__class: 'fleet',
          is_stored_at__repository_url: { $ne: null }
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
