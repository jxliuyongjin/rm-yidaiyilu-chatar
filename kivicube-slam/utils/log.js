const VERSION = "1.13.1";

const canIUseLogManage = wx.canIUse("getLogManager");
const logger = canIUseLogManage ? wx.getLogManager({ level: 0 }) : null;
const realtimeLogger = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;

export function DEBUG(file, ...args) {
  console.debug(`[${VERSION}] ${file}  | `, ...args);
  if (canIUseLogManage) {
    logger.debug(`[${VERSION}]`, file, " | ", ...args);
  }

  realtimeLogger && realtimeLogger.info(`[${VERSION}]`, file, " | ", ...args);
}

export function RUN(file, ...args) {
  console.log(`[${VERSION}]`, file, " | ", ...args);
  if (canIUseLogManage) {
    logger.log(`[${VERSION}]`, file, " | ", ...args);
  } 
  realtimeLogger && realtimeLogger.info(`[${VERSION}]`, file, " | ", ...args);
}

export function ERROR(file, ...args) {
  console.error(`[${VERSION}]`, file, " | ", ...args);
  if (canIUseLogManage) {
    logger.error(`[${VERSION}]`, file, " | ", ...args);
  }

  realtimeLogger && realtimeLogger.error(`[${VERSION}]`, file, " | ", ...args);
}

export function getLogger(fileName) {
  return {
    DEBUG: function (...args) {
      DEBUG(fileName, ...args)
    },
    RUN: function (...args) {
      RUN(fileName, ...args)
    },
    ERROR: function (...args) {
      ERROR(fileName, ...args)
    }
  }
}