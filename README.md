# task-queue-js

一个没什么用的javaScript异步方法同步执行的任务队列插件。

## 使用方法

没有npm包，需要自己复制到项目里面。

### 浏览器导入

不需要兼容旧浏览器复制/dist/task-queue-min.js到自己项目里面。

需要兼容IE9及以上版本浏览器将/dist/es5/task-queue-min.js复制到自己项目里面。

```html

<script src="http://xxx/dist/es5/task-queue-min.js"></script>
```

### ES6导入

将整个项目克隆到node_modules下。

```javascript
import {TaskQueue, genSleepHandler} from 'task-queue-js'
```

### Node.js导入

将整个项目克隆到node_modules下。

```javascript
const {TaskQueue, genSleepHandler} = require('task-queue-js');
```

### [example1](/example/example1.js)

```javascript
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

```

### [example2](/example/example2.html)

不支持async/await的浏览器以同步方式写代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>example2</title>
    <script src="../dist/es5/task-queue-min.js"></script>
</head>
<body id="app">
<script>
    var taskQueue = new TaskQueue();
    var aw = taskQueue.await;

    var bodyEl = document.getElementById('app');

    if (bodyEl) {
        var resData = [];

        // 异步API
        aw(function (next) {
            bodyEl.innerText = '数据加载中...';
            setTimeout(function () {
                resData = [{name: 'Test1'}, {name: 'Test2'}, {name: 'Test3'}];
                next();
            }, 3000);
        });

        // 结果处理
        aw(function () {
            bodyEl.innerText = '';
            resData.forEach(function (item) {
                var divEl = document.createElement('div');
                divEl.innerText = '姓名：' + item.name;
                bodyEl.append(divEl);
            });
        });

        aw(function () {
            taskQueue.close();
        });
    }
</script>
</body>
</html>
```
