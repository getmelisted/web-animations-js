suite('group-player', function() {
  setup(function() {
    document.timeline.players = [];
  });

  function simpleAnimationGroup() {
    return new AnimationGroup([new Animation(document.body, [], 2000), new Animation(document.body, [], 1000), new Animation(document.body, [], 3000)]);
  }

  function simpleAnimationSequence() {
    return new AnimationSequence([new Animation(document.body, [], 2000), new Animation(document.body, [], 1000), new Animation(document.body, [], 3000)]);
  }

  // topTimes and restOfTimes contain duplets (startTime, currentTime)
  // and triplets (startTime, currentTime, startOffset)
  function checkTimes(player, topTimes, restOfTimes) {
    _checkTimes(player, topTimes, 0, 'toplevel');
    _checkTimes(player, restOfTimes, 0, 'internals');
  }

  function _checkTimes(player, timingList, index, trace) {
    if (timingList.length == 0) {
      return;
    }
    if (timingList[0] == null || typeof timingList[0] == 'number') {
      assert.equal(player._startTime, timingList[0], trace + ' startTime');
      assert.equal(player.currentTime, timingList[1], trace + ' currentTime');
      if (timingList.length == 3)
        assert.equal(player._startOffset, timingList[2], trace + ' startOffset');
    } else {
      _checkTimes(player.childPlayers[index], timingList[0], 0, trace + ' ' + index);
      _checkTimes(player, timingList.slice(1), index + 1, trace);
    }
  }

  test('playing an animationGroup works as expected', function() {
    tick(100);
    var p = document.timeline.play(simpleAnimationGroup());
    checkTimes(p, [100, 0], [[100, 0, 0], [100, 0, 0], [100, 0, 0]]);
    tick(300);
    checkTimes(p, [100, 200], [[100, 200], [100, 200], [100, 200]]);
    tick(1200);
    checkTimes(p, [100, 1100], [[100, 1100], [100, 1000], [100, 1100]]);
    tick(2200);
    checkTimes(p, [100, 2100], [[100, 2000], [100, 1000], [100, 2100]]);
    tick(3200);
    // TODO Limit toplevel currentTime
    checkTimes(p, [100, 3100], [[100, 2000], [100, 1000], [100, 3000]]);
  });

  test('playing an animationSequence works as expected', function() {
    tick(110);
    var p = document.timeline.play(simpleAnimationSequence());
    checkTimes(p, [110, 0], [[110, 0], [2110, -2000, 2000], [3110, -3000, 3000]]);
    tick(210);
    checkTimes(p, [110, 100], [[110, 100], [2110, -1900, 2000], [3110, -2900, 3000]]);
  });
});
