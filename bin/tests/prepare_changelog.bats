#!/usr/bin/env bats

load 'libs/bats-assert/load'

@test "changelog" {
    changelog=$(cat ./bin/tests/data/changelog.txt)

    run ./bin/prepare_changelog.sh "${changelog}"
    assert_success
    assert_line -n 0 "::set-output name=changelog::'%0A'8bb1d12 Break single quote for replace string'%0A'0b138bb Ensure error response parsing for 4xx and 5xx heartbeat response errors"
}
