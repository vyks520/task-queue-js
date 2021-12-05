export declare type TaskQueueHandlerType = ((next?: () => void) => void) | (() => Promise<boolean>);

export declare type TaskQueueOptionType = {
  // 任务ID: 用于清除无效的异步任务标识
  taskID?: string | null;
  // 处理方法
  handler: TaskQueueHandlerType;
  // 清除无效的异步任务方法
  clean?: () => void;
  // 监视对应任务ID，对应ID的任务执行后触发执行当前任务
  watchTaskID?: string | null;
  // 执行完成后是否持续监视，否则清除任务
  watchPersist?: boolean;
};

export declare class TaskQueue {
  // 不关闭会造成内存泄露
  close(): void;

  constructor();

  // 添加任务队列项
  add(option: TaskQueueOptionType): void;

  await(handler: TaskQueueHandlerType): void;
}

// 构造TaskQueue延迟执行option, 支持清除无效的异步任务（前端防抖）
export declare function genSleepHandler(option: TaskQueueOptionType, timeout: number): TaskQueueOptionType;
