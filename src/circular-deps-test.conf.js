/**
 * @license
 * Copyright (C) Gnucoop soc. coop.
 *
 * This file is part of the Dewco (dewco).
 *
 * Dewco (dewco) is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * Dewco (dewco) is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Dewco (dewco).
 * If not, see http://www.gnu.org/licenses/.
 *
 */

const path = require('path');

module.exports = {
  baseDir: '../',
  goldenFile: '../goldens/ts-circular-deps.json',
  glob: `./**/*.ts`,
  // Command that will be displayed if the golden needs to be updated.
  approveCommand: 'yarn ts-circular-deps:approve',
  resolveModule,
};

/**
 * Custom module resolver that maps specifiers starting with `@dewco/` to the
 * local packages folder. This ensures that imports using the module name can be
 * resolved. Cross entry-point/package circular dependencies are already be detected
 * by Bazel, but in rare cases, the module name is used for imports within entry-points.
 */
function resolveModule(specifier) {
  if (specifier.startsWith('@ajf/')) {
    return path.join(__dirname, specifier.substr('@ajf/'.length));
  }
  return null;
}
