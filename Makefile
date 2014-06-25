#
# rumpelstiltskin
# https://github.com/chrisenytc/rumpelstiltskin
#
# Copyright (c) 2014, Christopher EnyTC
# Licensed under the MIT license.
#

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha -G -R spec -u bdd -t 6000 --globals chai --colors

.PHONY: test