#
# rumpelstiltskin
# https://github.com/chrisenytc/rumpelstiltskin
#
# Copyright (c) 2015, Christopher EnyTC
# Licensed under the MIT license.
#

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha -G -R spec -u bdd -t 6000 --colors

.PHONY: test