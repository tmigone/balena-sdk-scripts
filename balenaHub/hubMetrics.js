const { getSdk } = require('balena-sdk')

const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

async function run () {
  try {
    const { fleets, projects } = await getFleetsAndProjects()
    const blocks = await getBlocks()
    const activeDevices = await getActiveDevices()
    console.log(`Open fleets: ${fleets}`)
    console.log(`Projects: ${projects}`)
    console.log(`Blocks: ${blocks}`)
    console.log(`28-day active devices in open fleets: ${activeDevices}`)
  } catch (error) {
    console.log(error)
  }
}

run()

async function getActiveDevices () {
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
  return activeDevices.length
}

async function getBlocks () {
  const blocks = await balena.pine.get({
    resource: 'application',
    options: {
      $filter: {
        is_public: true,
        is_discoverable: true,
        is_host: false,
        is_of__class: 'block',
        is_stored_at__repository_url: { $ne: null }
      }
    }
  })
  return blocks.length
}

async function getFleetsAndProjects () {
  const all = await balena.pine.get({
    resource: 'application',
    options: {
      $expand: {
        owns__release: {
          $select: ['contract'],
          $filter: {
            status: 'success'
          },
          $top: 1,
          $orderby: 'id desc'
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
  const projects = all.filter(f => f.owns__release.length > 0 && f.owns__release[0].contract && JSON.parse(f.owns__release[0].contract).joinable === false)
  return {
    fleets: all.length - projects.length,
    projects: projects.length
  }
}
