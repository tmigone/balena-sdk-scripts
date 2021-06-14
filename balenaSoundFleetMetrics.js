const { getSdk } = require('balena-sdk')
const fs = require('fs')

const BALENA_API_TOKEN = fs.readFileSync('token', 'utf-8')
const balena = getSdk({
  apiUrl: 'https://api.balena-cloud.com/'
})

const applicationId = 1767644

async function run () {
  try {
    await balena.auth.loginWithToken(BALENA_API_TOKEN)

    const app = await getApplication(applicationId)
    console.log(`--- ${app.slug} ---`)

    // Device breakdown
    console.log('\nDevice breakdown:')

    const devices = await getApplicationDevices(applicationId)
    console.log(`- Total device count: ${devices.length}`)

    const devicesRunningRelease = devices.filter(d => d.is_running__release !== null)
    console.log(`- Devices running release: ${devicesRunningRelease.length} (${100 * devicesRunningRelease.length / devices.length}%)`)
    console.log(`- Devices on "Factory build": ${devices.length - devicesRunningRelease.length} (${100 * (devices.length - devicesRunningRelease.length) / devices.length}%)`)

    // Running release breakdown
    console.log('\nRunning a release breakdown:')

    // 56, 57 --> rpi and raspberry-pi2. Not running multi-room server, filter out.
    const dontSupportMultiRoomServer = [56, 57]
    const multiRoomServerCapable = devicesRunningRelease.filter(d => !dontSupportMultiRoomServer.includes(d.is_of__device_type.__id))
    console.log(`- Device type is multiroom server capable: ${multiRoomServerCapable.length} (${100 * multiRoomServerCapable.length / devicesRunningRelease.length}%)`)
    console.log(`- Device type is NOT multiroom server capable: ${devicesRunningRelease.length - multiRoomServerCapable.length} (${100 * (devicesRunningRelease.length - multiRoomServerCapable.length) / devicesRunningRelease.length}%)`)

    // Multiroom server capable breakdown
    console.log('\nMultiroom server capable breakdown:')
    const deviceUsed = []
    const deviceNotUsed = []
    const supervisorStarted = []
    const stdError = []

    for (const device of multiRoomServerCapable) {
      const lines = await balena.logs.history(device.uuid)
      const used = lines.map(l => l.message).some(m => m.includes('Playback started'))
      const pulseaudio = lines.map(l => l.message).some(m => m.includes('Connected to PulseAudio'))
      const error = lines.some(l => l.isStdErr)

      if (used) {
        deviceUsed.push(device)
      } else {
        deviceNotUsed.push(device)
        fs.writeFileSync(`./logs/${device.uuid}`, lines.map(l => l.message))
      }

      if (pulseaudio) {
        supervisorStarted.push(supervisorStarted)
      }

      if (error) {
        stdError.push(error)
      }
    }

    console.log(`- Device was used: ${deviceUsed.length} (${100 * deviceUsed.length / multiRoomServerCapable.length}%)`)
    console.log(`- Device was not used: ${deviceNotUsed.length} (${100 * (deviceNotUsed.length) / multiRoomServerCapable.length}%)`)

    console.log('\nExtras:')
    console.log(`- Supervisor started: ${supervisorStarted.length} (${100 * (supervisorStarted.length) / multiRoomServerCapable.length}%)`)
    console.log(`- StdErr: ${stdError.length} (${100 * (stdError.length) / multiRoomServerCapable.length}%)`)
  } catch (error) {
    console.log(error)
  }
}

run()

async function getApplication (appId) {
  return await balena.pine.get({
    resource: 'application',
    id: appId
  })
}

async function getApplicationDevices (appId) {
  return await balena.pine.get({
    resource: 'device',
    options: {
      $filter: {
        belongs_to__application: applicationId
      }
    }
  })
}

// async function getDevicesRunningARelease (applicationId) {
//   return await balena.pine.get({
//     resource: 'device',
//     select: ['uuid'],
//     options: {
//       $filter: {
//         belongs_to__application: applicationId,
//         is_running__release: { $ne: null }
//       }
//     }
//   })
// }
