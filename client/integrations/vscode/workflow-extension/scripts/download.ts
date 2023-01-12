import { existsSync } from 'fs';
import download from 'mvn-artifact-download';
import { join, resolve } from 'path';
import { exit } from 'process';
import * as config from '../src/server-config.json';

const downloadDir = join(__dirname, '../server');
const { groupId, artifactId, classifier, version, isSnapShot, launcherClass } = config;
const mavenRepository = isSnapShot ? config.snapshotRepository : config.releaseRepository;

const serverExecutable = resolve(__dirname, `../server/${artifactId}-${version}-SNAPSHOT-${classifier}.jar`);
if (existsSync(serverExecutable)) {
  console.log('Workflow Example Java Server already downloaded.');
  exit(0);
}
console.log('Downloading latest version of the Workflow Example Java Server from the maven repository...');
download({ groupId, artifactId, version, classifier, isSnapShot }, downloadDir, mavenRepository)
  .then(() =>
    console.log(
      `Download completed. Start the server using this command: \njava -jar ${artifactId}-${version}${
        isSnapShot ? '-SNAPSHOT' : ''
      }-${classifier}.jar ${launcherClass}\n\n`
    )
  )
  .catch(err => console.error(err));
