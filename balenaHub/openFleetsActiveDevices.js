const { getSdk } = require('balena-sdk')

const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

async function run () {
  try {

    // Once https://github.com/balena-io/balena-api/issues/3172 gets solved
    // we can replace all this with the following query :)
    // await sdk.pine.get({
    //   resource: 'public_device',
    //   options: {
    //       $count: {
    //           $filter: {
    //               was_recently_online: true
    //           }
    //       }
    //   }
    // })
    const apps = await balena.pine.get({
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
    const publicDevices = apps.map(app => app.owns__public_device).flat()
    const activeDevices = publicDevices.filter(d => d.was_recently_online)
    console.log(`Total number of active devices in open fleets: ${activeDevices.length}`)
  } catch (error) {
    console.log(error)
  }
}

run()
