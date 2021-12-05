/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/task-queue.ts":
/*!***************************!*\
  !*** ./src/task-queue.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.genSleepHandler = exports.TaskQueue = void 0;\r\n// 任务队列\r\n// 支持清除无效的异步任务（前端防抖）\r\nclass TaskQueue {\r\n    _close = false;\r\n    // 任务队列: 按顺序执行\r\n    _queueList = [];\r\n    // 监视队列: 监视任务队列中的任务ID, 对应任务队列ID执行后执行对应的监视队列项\r\n    _watchList = [];\r\n    constructor() {\r\n        const _this = this;\r\n        this.await = (handler) => {\r\n            _this.add({ handler });\r\n        };\r\n        this._runLoop().then();\r\n    }\r\n    _sleep(timeout) {\r\n        return new Promise((resolve => {\r\n            setTimeout(() => {\r\n                resolve(true);\r\n            }, timeout);\r\n        }));\r\n    }\r\n    async _runLoop() {\r\n        for (;;) {\r\n            if (this._close)\r\n                return;\r\n            const option = this._queueList[0];\r\n            if (option) {\r\n                try {\r\n                    await option?.handler();\r\n                    await this._execWatchList(option);\r\n                }\r\n                catch (e) {\r\n                    console.error(e);\r\n                }\r\n                this._queueList.shift();\r\n                continue;\r\n            }\r\n            await this._sleep(50);\r\n        }\r\n    }\r\n    async _execWatchList(option) {\r\n        const { taskID } = option;\r\n        if (!taskID)\r\n            return;\r\n        for (let i = 0; i < this._watchList.length; i++) {\r\n            const item = this._watchList[i];\r\n            if (item.watchTaskID === taskID) {\r\n                try {\r\n                    await item?.handler();\r\n                }\r\n                catch (e) {\r\n                    console.error(e);\r\n                }\r\n                // 执行完成后是否持续监视，否则清除任务\r\n                if (item.watchPersist)\r\n                    return;\r\n                this._watchList.splice(i, 1);\r\n            }\r\n        }\r\n    }\r\n    // 将一个普通函数转换为异步函数\r\n    newAsyncHandler(handler) {\r\n        return () => {\r\n            return new Promise(resolve => {\r\n                handler(() => {\r\n                    resolve(true);\r\n                });\r\n            });\r\n        };\r\n    }\r\n    // 不关闭会造成内存泄露, _runLoop不能结束\r\n    close() {\r\n        this._close = true;\r\n    }\r\n    add(option) {\r\n        // handler参数等于1则将其转换为异步函数，handler中必须调用next方法，不然会导致任务队列卡死。\r\n        if (option.handler && option.handler.length === 1) {\r\n            option = { ...option, handler: this.newAsyncHandler(option.handler) };\r\n        }\r\n        if (!!option.watchTaskID) {\r\n            this._watchList.push(option);\r\n            return;\r\n        }\r\n        if (!option.taskID) {\r\n            this._queueList.push(option);\r\n            return;\r\n        }\r\n        // 清除无效的异步任务（前端防抖）\r\n        this._queueList.forEach((item, index) => {\r\n            if (item.taskID === option.taskID && item.clean) {\r\n                item.clean();\r\n            }\r\n        });\r\n        this._queueList.push(option);\r\n    }\r\n    await;\r\n}\r\nexports.TaskQueue = TaskQueue;\r\n// 构造任务延迟执行option, 支持清除无效的异步任务（前端防抖）\r\nfunction genSleepHandler(option, timeout) {\r\n    // 执行状态\r\n    // 1: 等待执行, 2: 执行中, -1: 已清理\r\n    let execStatus = 1;\r\n    let clearTimer;\r\n    let resolveFn;\r\n    const result = {};\r\n    result.taskID = option.taskID;\r\n    result.handler = () => {\r\n        if (execStatus !== 1)\r\n            return;\r\n        execStatus = 2;\r\n        return new Promise((resolve) => {\r\n            resolveFn = resolve;\r\n            clearTimer = setTimeout(async () => {\r\n                await option.handler();\r\n                resolve(true);\r\n            }, timeout);\r\n        });\r\n    };\r\n    result.clean = () => {\r\n        execStatus = -1;\r\n        clearTimeout(clearTimer);\r\n        if (resolveFn)\r\n            resolveFn(false);\r\n    };\r\n    return result;\r\n}\r\nexports.genSleepHandler = genSleepHandler;\r\n\n\n//# sourceURL=webpack://task-queue-js/./src/task-queue.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/task-queue.ts"](0, __webpack_exports__);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});