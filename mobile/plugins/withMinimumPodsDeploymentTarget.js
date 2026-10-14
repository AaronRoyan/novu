const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

// Xcode 27 refuses to build targets that declare an iOS deployment target
// below 15.0. A few libraries' resource bundles still say 11–13, so raise
// every pod target to at least Expo SDK 54's minimum (15.1) after pod install.
const MINIMUM = '15.1';
const MARKER = '# novu: minimum pods deployment target';

module.exports = function withMinimumPodsDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const podfile = path.join(modConfig.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(MARKER)) {
        contents = contents.replace(
          /post_install do \|installer\|\n/,
          (match) =>
            `${match}    ${MARKER}\n` +
            `    installer.pods_project.targets.each do |target|\n` +
            `      target.build_configurations.each do |build_config|\n` +
            `        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']\n` +
            `        if current.nil? || Gem::Version.new(current) < Gem::Version.new('${MINIMUM}')\n` +
            `          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MINIMUM}'\n` +
            `        end\n` +
            `      end\n` +
            `    end\n`,
        );
        fs.writeFileSync(podfile, contents);
      }
      return modConfig;
    },
  ]);
};
