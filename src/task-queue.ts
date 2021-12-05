import {TaskQueueHandlerType, TaskQueueOptionType} from './types';
// 任务队列
// 支持清除无效的异步任务（前端防抖）
export class TaskQueue {
  private _close: boolean = false;
  // 任务队列: 按顺序执行
  private _queueList: TaskQueueOptionType[] = [];
  // 监视队列: 监视任务队列中的任务ID, 对应任务队列ID执行后执行对应的监视队列项
  private _watchList: TaskQueueOptionType[] = [];

  constructor() {
    const _this = this;
    this.await = (handler: TaskQueueHandlerType): void => {
      _this.add({handler});
    };
    this._runLoop().then();
  }

  _sleep(timeout: number) {
    return new Promise((resolve => {
      setTimeout(() => {
        resolve(true);
      }, timeout);
    }));
  }

  async _runLoop() {
    for (; ;) {
      if (this._close) return;
      const option = this._queueList[0];
      if (option) {
        try {
          await option?.handler();
          await this._execWatchList(option);
        } catch (e) {
          console.error(e);
        }
        this._queueList.shift();
        continue;
      }
      await this._sleep(50);
    }
  }

  async _execWatchList(option: TaskQueueOptionType) {
    const {taskID} = option;
    if (!taskID) return;
    for (let i = 0; i < this._watchList.length; i++) {
      const item = this._watchList[i];
      if (item.watchTaskID === taskID) {
        try {
          await item?.handler();
        } catch (e) {
          console.error(e);
        }
        // 执行完成后是否持续监视，否则清除任务
        if (item.watchPersist) return;
        this._watchList.splice(i, 1);
      }
    }
  }

  // 将一个普通函数转换为异步函数
  newAsyncHandler(handler: (next: () => void) => void) {
    return () => {
      return new Promise(resolve => {
        handler(() => {
          resolve(true);
        });
      });
    };
  }

  // 不关闭会造成内存泄露, _runLoop不能结束
  close() {
    this._close = true;
  }

  add(option: TaskQueueOptionType): void {
    // handler参数等于1则将其转换为异步函数，handler中必须调用next方法，不然会导致任务队列卡死。
    if (option.handler && option.handler.length === 1) {
      option = {...option, handler: this.newAsyncHandler(option.handler)};
    }
    if (!!option.watchTaskID) {
      this._watchList.push(option);
      return;
    }
    if (!option.taskID) {
      this._queueList.push(option);
      return;
    }
    // 清除无效的异步任务（前端防抖）
    this._queueList.forEach((item, index) => {
      if (item.taskID === option.taskID && item.clean) {
        item.clean();
      }
    });
    this._queueList.push(option);
  }

  await: { (handler: TaskQueueHandlerType): void };
}

// 构造任务延迟执行option, 支持清除无效的异步任务（前端防抖）
export function genSleepHandler(option: TaskQueueOptionType, timeout: number): TaskQueueOptionType {
  // 执行状态
  // 1: 等待执行, 2: 执行中, -1: 已清理
  let execStatus: number = 1;
  let clearTimer: any;
  let resolveFn: (reason?: any) => void;
  const result = {} as TaskQueueOptionType;

  result.taskID = option.taskID;
  result.handler = () => {
    if (execStatus !== 1) return;
    execStatus = 2;
    return new Promise((resolve) => {
      resolveFn = resolve;
      clearTimer = setTimeout(async () => {
        await option.handler();
        resolve(true);
      }, timeout);
    });
  };
  result.clean = () => {
    execStatus = -1;
    clearTimeout(clearTimer);
    if (resolveFn) resolveFn(false);
  };
  return result;
}
