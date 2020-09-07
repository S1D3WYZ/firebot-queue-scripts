exports.getScriptManifest = function () {
  return {
    name: 'Queue - Next',
    description: '!next # GAME',
    author: 'S1D3WYZ',
    version: '0.0.1',
  };
};
exports.getDefaultParameters = function () {
  return new Promise((resolve) => {
    resolve({
      queueLocation: {
        type: 'filepath',
        description: 'Whereis queue.json?',
        secondaryDescription: `(Suggested:) %APPDATA%\\Firebot\\v5\\profiles\\Main Profile\\scripts\\queue.json`,
      },
    });
  });
};
exports.run = function (runRequest) {
  return new Promise((resolve) => {
    const response = { success: false, errorMessage: '', effects: [] },
      logger = runRequest.modules.logger,
      fs = runRequest.modules.fs,
      queueFile = runRequest.parameters.queueLocation,
      queue = JSON.parse(fs.readFileSync(queueFile)),
      context = runRequest.command.args[0] ? runRequest.command.args[0] : 0;
    try {
      switch (context) {
        case 0:
          logger.error(`${context}`);
          response.effects.push({
            type: EffectType.CHAT,
            message: `Please include # of players for the next game`,
          });
          break;

        default:
          let pos = 0;
          queue.playing = queue.waiting.slice(pos, context);
          queue.waiting.splice(pos, context);
          logger.info(queue.playing);
          logger.info(queue.waiting);
          response.effects.push(
            {
              type: EffectType.TEXT_TO_FILE,
              filepath: queueFile,
              writeMode: 'replace',
              text: JSON.stringify(queue),
            },
            {
              type: EffectType.CHAT,
              message: `${queue.playing.length} new players, ${queue.waiting.length} waiting. Queue is ${queue.status}`,
            }
          );
          break;
      }
    } catch (error) {
      response.errorMessage = error;
    }
    // logger.error(runRequest.response.errorMessage);
    response.success = true;
    resolve(response);
  });
};
