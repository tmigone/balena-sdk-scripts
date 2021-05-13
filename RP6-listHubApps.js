const { getSdk } = require('balena-sdk')

const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

async function run () {
  try {
    const result = await balena.pine.get({
      resource: 'application',
      options: {
        $select: [
          'id',
          'app_name',
          'is_stored_at__repository_url',
          'owns__release',
          'is_for__device_type'
        ],
        $expand: {
          owns__release: {
            $select: ['contract'],
            $filter: {
              status: 'success'
            },
            $top: 1,
            $orderby: 'id desc'
          },
          is_for__device_type: {
            $select: ['slug']
          }
        },
        $filter: {
          is_public: true,
          is_host: false,
          is_discoverable: true,
          is_stored_at__repository_url: { $ne: null }
        }
      }
    })
    console.log(result.map(r => r.app_name))
  } catch (error) {
    console.log(error)
  }
}

run()
