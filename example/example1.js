const {TaskQueue, genSleepHandler} = require('../dist/task-queue');

const taskQueue = new TaskQueue();

// genSleepHandler生成睡眠一定时间后执行option配置
// genSleepHandler配合相同的taskID可以清除无效的异步任务（前端防抖）
console.log('曾经有一位前辈存在过...');
taskQueue.add(genSleepHandler({
  taskID: 'test1', handler: () => {
    console.log('一位前辈');
  }
}, 3000));

// 第一个任务被取消了
taskQueue.add(genSleepHandler({
  taskID: 'test1', handler: () => {
    console.log('一个后浪');
  }
}, 2000));

// 一个普通任务
taskQueue.add({
  handler: () => {
    console.log('普通任务，立即执行');
  }
});

// 自定义异步方法
taskQueue.add({
  handler: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('三秒后执行的Promise方法');
        // 必须resolve或reject, 没有超时机制，不然会导致任务队列卡死。
        resolve(true);
      }, 3000);
    });
  }
});

// 添加监视任务
// 由其他任务触发执行
// 注意: 监视任务不能清除无效的异步任务
console.log('一个靓仔在这里等待...');
taskQueue.add({
  handler: () => {
    console.log('前面没有小姐姐我走不动路！');
  },
  watchTaskID: 'girl',
  // 执行完成后是否持续监视，否则清除任务
  watchPersist: true
});

// 这里不能使用genSleepHandler，不然会被下面的任务清理掉
taskQueue.add({
  taskID: 'girl', handler: (next) => {
    setTimeout(() => {
      console.log('三秒后经过的小姐姐QAQ');
      next();
    }, 3000);
  }
});
taskQueue.add({
  taskID: 'girl', handler: (next) => {
    setTimeout(() => {
      console.log('又过了三秒后经过的第二个小姐姐QAQ');
      next();
    }, 3000);
  }
});

taskQueue.add({
  taskID: 'next', handler: function (next) {
    setTimeout(function () {
      console.log('使用next参数方法创建异步方法同步执行！');
      setTimeout(function () {
        // 必须执行next()，不然会导致任务队列卡死。
        next();
        console.log('next参数方法执行结束！');
      }, 3000);
    }, 3000);
  }
});

taskQueue.add({
  handler: () => {
    console.log('关闭任务队列！');
    // 不关闭会造成内存泄露，任务监视循环不会结束
    taskQueue.close();
  }
});
