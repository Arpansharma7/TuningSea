module.exports = {
  packagerConfig: {
    asar: true,
    name: 'TuningSea Studio',
    executableName: 'TuningSea Studio'
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'tuningsea_studio',
        setupExe: 'TuningSea-Studio-Setup.exe'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ]
};
