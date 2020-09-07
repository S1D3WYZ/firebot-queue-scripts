exports.getScriptManifest = function () {
  return {
    name: 'Queue - Master',
    description: 'Main Queue Settings',
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
      context = runRequest.command.args[0],
      modifier = runRequest.command.args[1] ? runRequest.command.args[1] : 7;
    try {
      switch (context) {
        case 'on':
          queue.status = 'Open';
          response.effects.push(
            {
              type: EffectType.TEXT_TO_FILE,
              filepath: queueFile,
              writeMode: 'replace',
              text: JSON.stringify(queue),
            },
            {
              type: EffectType.CHAT,
              message: `Queue is now ${queue.status} - ${queue.playing.length} playing, ${queue.waiting.length} waiting`,
            }
          );
          break;
        case 'off':
          queue.status = 'Closed';
          response.effects.push(
            {
              type: EffectType.TEXT_TO_FILE,
              filepath: queueFile,
              writeMode: 'replace',
              text: JSON.stringify(queue),
            },
            {
              type: EffectType.CHAT,
              message: `Queue is now ${queue.status} - ${queue.playing.length} playing, ${queue.waiting.length} waiting`,
            }
          );
          break;
        case 'list':
          let pos = 0,
            list = queue.waiting.splice(pos, modifier),
            next = list.join(', ');
          response.effects.push({
            type: EffectType.CHAT,
            message: `Up next: ${next}`,
          });
          break;
        default:
          response.effects.push({
            type: EffectType.CHAT,
            message: `Queue is ${queue.status} - ${queue.playing.length} playing, ${queue.waiting.length} waiting`,
          });
          break;
      }
    } catch (error) {
      response.errorMessage = error;
    }
    logger.error(`Looks like we didn't fail`);
    response.success = true;
    resolve(response);
  });
};
