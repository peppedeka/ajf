/**
 * @license
 * Copyright (C) Gnucoop soc. coop.
 *
 * This file is part of the Advanced JSON forms (ajf).
 *
 * Advanced JSON forms (ajf) is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * Advanced JSON forms (ajf) is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Advanced JSON forms (ajf).
 * If not, see http://www.gnu.org/licenses/.
 *
 */

import * as minimist from 'minimist';

import {DevServer} from './dev-server';
import {setupBazelWatcherSupport} from './ibazel';

const args = process.argv.slice(2);
const {root_paths: _rootPathsRaw, port, historyApiFallback} =
    minimist(args, {boolean: 'historyApiFallback'});
const rootPaths = _rootPathsRaw ? _rootPathsRaw.split(',') : ['/'];

const server = new DevServer(port, rootPaths, historyApiFallback);

// Setup ibazel support.
setupBazelWatcherSupport(server);

// Start the devserver. The server will always bind to the loopback and
// the public interface of the current host.
server.start();

