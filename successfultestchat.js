exports.run = function (runRequest) {
  return new Promise((resolve) => {
    const logger = runRequest.logger,
      user = runRequest.user.name,
      response = {
        success: false,
        errorMessage: ``,
        effects: [],
      };
    // difficutly = [no, easy, moderate, high, legendary],
    // threat = difficutly[runRequest.command.$(arg)];

    response.effects.push({
      type: EffectType.CHAT,
      message: `${user} ran a test`,
      chatter: 'Streamer',
    });
    response.errorMessage = `Couldn't run test`;
    response.success = true;

    resolve(response);
  });
};
