#
# rumpelstiltskin
# https://github.com/chrisenytc/rumpelstiltskin
#
# Copyright (c) 2015, Christopher EnyTC
# Licensed under the MIT license.
#

test:
	@NODE_ENV=test node ./node_modules/.bin/istanbul cover --root ./lib/core -x ./lib/core/debugger.js ./node_modules/mocha/bin/_mocha -- -R spec -u bdd -t 6000 --colors ./test/**/*.spec.js

view-coverage:
	./node_modules/.bin/serve ./coverage/lcov-report

docs:
	yuidoc ./

.PHONY: test
