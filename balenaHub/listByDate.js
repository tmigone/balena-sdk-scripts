const { getSdk } = require('balena-sdk')

const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

async function run () {
  try {
    const fleetsAndProjects = await getFleetsAndProjects()
    const blocks = await getBlocks()

    for (const stuff of [...fleetsAndProjects, ...blocks]) {
      console.log(`[${stuff.created_at}] ${stuff.app_name} by ${stuff.slug.split('/')[0]}`)
    }
  } catch (error) {
    console.log(error)
  }
}

run()

async function getBlocks () {
  return await balena.pine.get({
    resource: 'application',
    options: {
      $filter: {
        is_public: true,
        is_discoverable: true,
        is_host: false,
        is_of__class: 'block',
        is_stored_at__repository_url: { $ne: null }
      },
      $orderby: 'created_at desc'
    }
  })
}

async function getFleetsAndProjects () {
  return await balena.pine.get({
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
      },
      $orderby: 'created_at desc'
    }
  })
}
