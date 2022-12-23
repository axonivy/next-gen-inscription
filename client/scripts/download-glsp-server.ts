/********************************************************************************
 * Copyright (c) 2020-2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { existsSync } from 'fs';
import download from 'mvn-artifact-download';
import { join, resolve } from 'path';
const config = {
    "releaseRepository": "https://repo1.maven.org/maven2/",
    "snapshotRepository": "https://oss.sonatype.org/content/repositories/snapshots/",
    "groupId": "org.eclipse.glsp.example",
    "artifactId": "org.eclipse.glsp.example.workflow",
    "version": "1.1.0",
    "isSnapShot": true,
    "classifier": "glsp"
};

const isClean = process.argv[2] === 'clean';

const { groupId, artifactId, classifier, version, isSnapShot } = config;
const serverDirectory = resolve(join(__dirname), '..', 'node_modules', '@eclipse-glsp-examples', 'workflow-theia', 'server');
export const jarFile = resolve(join(serverDirectory, `org.eclipse.glsp.example.workflow-${version}${isSnapShot ? '-SNAPSHOT' : ''}-glsp.jar`));

if (existsSync(jarFile)) {
    if (!isClean) {
        console.log('Workflow Example Java Server already present. If you want to re-download it, pass \'clean\' as argument.');
        process.exit(0);
    }
}

const mavenRepository = isSnapShot ? config.snapshotRepository : config.releaseRepository;
console.log('Downloading latest version of the Workflow Example Java Server from the maven repository...');
download({ groupId, artifactId, version, classifier, isSnapShot }, serverDirectory, mavenRepository).then(() => console.log('Download complete.'));
