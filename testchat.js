exports.run = function (runRequest) {
  return new Promise((resolve) => {
    const logger = runRequest.modules.logger,
      user = runRequest.user.name,
      response = {
        success: false,
        errorMessage: ``,
        effects: [],
      };

    try {
      logger.debug(`${user} Starting Test`);
      response.effects.push({
        type: EffectType.CHAT,
        message: `${user} ran a challenging test.`,
        chatter: 'Streamer',
      });
    } catch (e) {
      logger.debug(`${user} SOMETHING WENT WRONG`);
    } finally {
      response.success = true;
      logger.debug(`${user} Ending Test`);
    }
    resolve(response);
  });
};
