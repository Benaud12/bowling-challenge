describe("Frame", function() {

  var frame;
  var ballOne;
  var ballTwo;
  var ballThree;
  var ErrorMessage = "Illegal roll"

  beforeEach(function() {
    frame = new Frame();
    ballOne = jasmine.createSpyObj('ballOne', ['rolled']);
    ballOne.isRolled = true
    ballTwo = jasmine.createSpyObj('ballTwo', ['rolled']);
    ballTwo.isRolled = true
    ballThree = jasmine.createSpyObj('ballThree', ['rolled']);
    ballThree.isRolled = true
  });

  it("starts with 10 pins", function() {
    expect(frame.pinsRemaining).toEqual(10);
  })

  it("can be set as the last frame", function(){
    frame.setLastFrame();
    expect(frame.isLastFrame).toBe(true);
  });

  it("initializes with an empty bonuses array", function(){
    expect(frame.bonuses.length).toEqual(0);
  });

  describe("#roll", function(){

    it("assigns a ball a given score and retains it", function(){
      frame.roll(ballOne, 6);
      expect(frame.balls[0].score).toEqual(6);
    });

    it("reduces the number of pins remaining accordingley", function(){
      frame.roll(ballOne, 6);
      expect(frame.pinsRemaining).toEqual(4);
    });

    it("throws an error if score given is greater than the pins remaining", function(){
      expect(function() { frame.roll(ball, 11) }).toThrowError(ErrorMessage);
    });

    it("calls the ball's isRolled function", function(){
      frame.roll(ballOne, 6);
      expect(ballOne.rolled).toHaveBeenCalled();
    });

    it("when no score is given, generates random score based on pins remaining", function(){
      spyOn(Math, 'random').and.returnValue(0.6);
      frame.roll(ballOne);
      expect(frame.balls[0].score).toEqual(6);
      frame.roll(ballTwo);
      expect(frame.balls[1].score).toEqual(3);
    });

    it("doesn't allow more than two rolls", function(){
      frame.roll(ballOne, 1);
      frame.roll(ballTwo, 1);
      expect(function() { frame.roll(ballThree, 1) }).toThrowError(ErrorMessage);
    });

    it("returns score of the ball rolled", function(){
      expect(frame.roll(ballOne, 6)).toEqual(6);
    });

    describe("in last frame", function() {

      beforeEach(function() {
        frame.setLastFrame();
      });

      it("resets pins if a strike is rolled", function() {
        frame.roll(ballOne, 10);
        expect(frame.pinsRemaining).toEqual(10);
      });

      it("resets pins if a spare is rolled", function() {
        frame.roll(ballOne, 6);
        frame.roll(ballTwo, 4);
        expect(frame.pinsRemaining).toEqual(10);
      });

      it("allows a third roll following a strike", function() {
        frame.roll(ballOne, 10);
        frame.roll(ballTwo, 3);
        expect(function() { frame.roll(ballThree, 4) }).not.toThrowError();
      });

      it("allows a third roll following a spare", function() {
        frame.roll(ballOne, 6);
        frame.roll(ballTwo, 4);
        expect(function() { frame.roll(ballThree, 4) }).not.toThrowError();
      });

    });

  })

  describe("#isComplete", function(){

    it("returns false initially and after first roll not being a strike", function() {
      expect(frame.isComplete()).toBe(false);
      frame.roll(ballOne, 6);
      expect(frame.isComplete()).toBe(false);
    });

    it("returns true if two balls have been rolled", function() {
      frame.roll(ballOne, 3);
      frame.roll(ballTwo, 4);
      expect(frame.isComplete()).toBe(true);
    });

    it("returns true after a strike", function() {
      frame.roll(ballOne, 10);
      expect(frame.isComplete()).toBe(true);
    });

    describe("in last frame", function(){

      beforeEach(function() {
        frame.setLastFrame();
      });

      it("returns false after one roll and two rolls if a strike was thrown", function(){
        frame.roll(ballOne, 10);
        expect(frame.isComplete()).toBe(false);
        frame.roll(ballTwo, 4);
        expect(frame.isComplete()).toBe(false);
      });

      it("returns false after two rolls if a spare was thrown", function(){
        frame.roll(ballOne, 6);
        frame.roll(ballTwo, 4);
        expect(frame.isComplete()).toBe(false);
      });

      it("returns true if neither a spare nor strike is thrown after two rolls", function(){
        frame.roll(ballOne, 2);
        frame.roll(ballTwo, 4);
        expect(frame.isComplete()).toBe(true);
      });

      it("returns true after the third ball is rolled", function(){
        frame.roll(ballOne, 6);
        frame.roll(ballTwo, 4);
        frame.roll(ballThree, 5);
        expect(frame.isComplete()).toBe(true);
      });

    });

  });

  describe("#totalScore", function(){

    it("gives total of all balls rolled plus bonuses", function(){
      frame.roll(ballOne, 6);
      frame.roll(ballTwo, 4);
      frame.bonuses.push(4);
      expect(frame.totalScore()).toEqual(14);
    });

  });

  describe("#isStrike", function(){

    it("returns true if a strike was thrown first roll", function(){
      frame.roll(ballOne, 10);
      expect(frame.isStrike()).toBe(true);
    });

    it("returns false if a strike wasn't thrown", function(){
      frame.roll(ballOne, 6);
      frame.roll(ballTwo, 4);
      expect(frame.isStrike()).toBe(false);
    });

  });

  describe("#isSpare", function(){

    it("returns false if a strike was thrown first roll", function(){
      frame.roll(ballOne, 10);
      expect(frame.isSpare()).toBe(false);
    });

    it("returns true if a spare is thrown", function(){
      frame.roll(ballOne, 6);
      frame.roll(ballTwo, 4);
      expect(frame.isSpare()).toBe(true);
    });

    it("returns false if neither spare nor strike", function(){
      frame.roll(ballOne, 2);
      frame.roll(ballTwo, 4);
      expect(frame.isSpare()).toBe(false);
    });

  });

  describe("#isAwaitingBonus", function(){

    it("returns true if strike and number of bonuses less than 2", function(){
      frame.roll(ballOne, 10);
      frame.bonuses.push(5);
      expect(frame.isAwaitingBonus()).toBe(true);
    });

    it("returns true if spare and number of bonuses less than 1", function(){
      frame.roll(ballOne, 6);
      frame.roll(ballTwo, 4);
      expect(frame.isAwaitingBonus()).toBe(true);
    });

    it("returns false if strike and number of bonuses 2", function(){
      frame.roll(ballOne, 10);
      frame.bonuses.push(5);
      frame.bonuses.push(7);
      expect(frame.isAwaitingBonus()).toBe(false);
    });

    it("returns false if spare and number of bonuses 1", function(){
      frame.roll(ballOne, 6);
      frame.roll(ballTwo, 4);
      frame.bonuses.push(7);
      expect(frame.isAwaitingBonus()).toBe(false);
    });

  });

});
