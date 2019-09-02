
const LB = '\n';

class Util {
    static string2bool(s){
        if(s.toLowerCase() === 'true'){
            return true;
        }
        if(s.toLowerCase() === 'false'){
            return false
        }
        throw new Error(`[Util.string2bool] No boolean string. > ${s}`);
    }

    // @retval true yes
    // @retval false no or canceled
    static dialogConfirm(caption, bodymessage){
        let message = `[${caption}]${LB}${LB}${bodymessage}`;
        return window.confirm(message);
    }

    // @param lines An array expressed lines.
    static lines2str(lines){
        return lines.join(LB);
    }

    static round(floatNumber, whereFrom=1){
        // 12.3456
        //
        // 1   123.456 -> round -> 123   -> 12.3
        // 2   1234.56 -> round -> 1234  -> 12.34
        // 4   12345.6 -> round -> 12346 -> 12.346
        if(whereFrom == 0){
            return Math.round(floatNumber);
        }
        let f = floatNumber;
        let multipler = Math.pow(10, whereFrom);
        return Math.round(f*multipler) / multipler;
    }

    static toPrintableForHTML(s){
        let ret = s

        // Why not working???
        //ret = ret.replace('/ /g', '&nbsp;');
        ret = ret.split(' ').join('&nbsp;');

        return ret;
    }

    static deepcopy(obj){
        let obj_by_str = JSON.stringify(obj);
        let new_obj_by_str = obj_by_str;
        let new_obj = JSON.parse(new_obj_by_str);
        return new_obj;
    }

    static start_download_csv(data_by_string, basename){
        let ext = '.csv';
        let mime = 'text/csv';
        // To avoid encoding corruption when open a csv file with Excel,
        // the csv must have the BOM if UTF-8.
        let useBom = true;
        Util.start_download(data_by_string, basename, ext, mime, useBom)
    }

    static start_download(data_by_string, basename, ext_with_dot, mimetype='text/plain', useBom=false){
        let blob = new Blob(
            [data_by_string],
            {'type' : mimetype}
        );

        if(useBom){
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            blob = new Blob(
                [bom, data_by_string],
                {'type' : mimetype}
            );
        }

        let downloadee_filename = basename + ext_with_dot;

        let blob_url = window.URL.createObjectURL(blob);

        // Use HTML5 download attribute of <a> element.
        // So, need to create the element dynamically and remove after downloading.

        let a_element = document.createElement('a');
        a_element.download = downloadee_filename;
        a_element.href = blob_url;
        a_element.id   = 'tasklist_download_temp';
        let a_jquery_obj = $(a_element);

        // Must append an actual element to HTML to valid click event of <a> element.
        $('body').append(a_jquery_obj)

        a_jquery_obj[0].click();

        a_jquery_obj.remove();
    }
}

class LocalStorageManager {
    // @param storageInst a window.localStorage
    constructor(storageInst){
        this._storage = storageInst;
    }

    setItem(k, v){
        this._storage.setItem(k, v);
    }

    // @retval null if the key 'k' is not found.
    getItem(k){
        return this._storage.getItem(k);
    }

    removeItem(k){
        this._storage.removeItem(k);
    }

    reset(){
        this._storage.clear();
    }
}

class LocalStorageWrapper {
    // @param manager A LocalStorageManager instance
    // @param rootkey A string to use as the root key
    constructor(manager, rootkey){
        this._manager = manager;
        this._rootkey = rootkey
    }

   setItem(attribute_key, value_by_str){
        let root_jsonstr = this._manager.getItem(this._rootkey);
        let root_obj = {};
        if(root_jsonstr !== null){
            root_obj = JSON.parse(root_jsonstr);
        }

        root_obj[attribute_key] = value_by_str;

        let new_root_jsonstr = JSON.stringify(root_obj);
        this._manager.setItem(this._rootkey, new_root_jsonstr);
    }

    // @return A string value
    // @retval null if the attribute_key is not found or no data found.
   getItem(attribute_key){
       let root_jsonstr = this._manager.getItem(this._rootkey);
       if(root_jsonstr === null){
           return null;
       }
       let root_obj = JSON.parse(root_jsonstr);
       let value_by_str = root_obj[attribute_key];
       if(value_by_str === void 0){
           return null;
       }
       return value_by_str;
    }
}

class Datetime {
    static init(){
        moment.locale('ja');
    }

    static nowTimeStr(){
        let dt = new Datetime();
        return dt.toTimeString();
    }

    static nowDateStr(){
        let dt = new Datetime();
        return dt.toDateString();
    }

    static nowDowStr(){
        let dt = new Datetime();
        return dt.toDowString();
    }

    static nowShortTimeStr(){
        let dt = new Datetime();
        return dt.toShortTimeString();
    }

    static nowShortDateStr(){
        let dt = new Datetime();
        return dt.toShortDateString();
    }

    constructor(){
        this._moment = moment();
        this._timeformat = 'HH:mm:ss';
        this._dateformat = 'YYYY-MM-DD';
        this._dowtable = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    }

    getRawMoment(){
        return this._moment;
    }

    // @return A difference by seconds.
    diff(datetimeObjBeforeMe){
        let momentMe = this.getRawMoment();
        let momentBeforeMe = datetimeObjBeforeMe.getRawMoment();

        const unit = 'seconds';
        const useFloat= true;
        let diffBySec = momentMe.diff(momentBeforeMe, unit, useFloat);
        return diffBySec;
    }

    fromDatetimeString(datestr, timestr){
        let fmt = `${this._dateformat} ${this._timeformat}`
        let str = `${datestr} ${timestr}`;
        this._moment = moment(str, fmt);
    }

    toDowString(){
        let obj = this._moment;
        let fmt = 'e';
        let dowNum = obj.format(fmt);

        let dowStr = this._dowtable[dowNum];
        return dowStr;
    }

    toTimeString(){
        let obj = this._moment;
        let fmt = this._timeformat;
        return obj.format(fmt);
    }

    toDateString(){
        let obj = this._moment;
        let fmt = this._dateformat;
        return obj.format(fmt);;
    }

    toShortTimeString(){
        let obj = this._moment;
        let fmt = 'HHmmss';
        return obj.format(fmt);
    }

    toShortDateString(){
        let obj = this._moment;
        let fmt = 'YYMMDD';
        return obj.format(fmt);;
    }
}

class DataManager {
    static get DELIMITOR_FOR_LOCALSTORAGE(){
        // In the local storage, line breaks not saved as string.
        // So if you want to save including line breaks,
        // do prepare delimitor to express line break by string.
        return '<br>';
    }

    // @param localstorageWrapper A LocalStorageWrapper instance.
    constructor(localstorageWrapper){
        this._manager = localstorageWrapper;
        this.KEY_TASKS = 'tasks';
        this.KEY_VERSION = 'version';
        //this.KEY_CONFIG = 'config';
    }

    getTasks(){
        const key = this.KEY_TASKS;
        const tasksByString = this._manager.getItem(key);
        if(tasksByString === null){
            return [];
        }
        let taskStrings = tasksByString.split(DataManager.DELIMITOR_FOR_LOCALSTORAGE);

        let tasks = [];
        for(let taskString of taskStrings){
            // Skip invalid empty data especially [''] case.
            // This case can be occured when getting from the initial empty local storage.
            if(taskString.length == 0){
                continue;
            }
            let task = new Task();
            task.fromString(taskString);
            tasks.push(task);
        }

        return tasks;
    }

    // @param task An array of an instance of Task.
    saveTasks(tasks){
        let taskStrings = [];
        for(let task of tasks){
            let taskByString = task.toString();
            taskStrings.push(taskByString);
        }

        const tasksByString = taskStrings.join(DataManager.DELIMITOR_FOR_LOCALSTORAGE);

        const key = this.KEY_TASKS;
        const value = tasksByString;
        this._manager.setItem(key, value);
    }

    // @return A version information by string.
    // @retval null if version info not found
    getVersionInfo(){
        const key = this.KEY_VERSION;
        const version = this._manager.getItem(key);
        if(version === null){
            return version;
        }
        return version;
    }

    setVersionInfo(versionString){
        const key = this.KEY_VERSION;
        const value = versionString
        this._manager.setItem(key, value);
    }

    isFirstUse(){
        return this.getVersionInfo() === null;
    }

    onChangedTask(tasks){
        this.saveTasks(tasks);
    }

}

class TaskVisualizer {
    static getEmptytimeShort(){
        return Util.toPrintableForHTML(' '.repeat('hh:mm'.length));
    }

    static actualSeconds2Printable(floatSeconds){
        //   1s
        //   2s
        //  10s
        //  59s
        //   1m
        //   2m
        //  10m
        //  59m
        //   1h
        // 1.1h
        // 9.9h
        //  10h
        //  11h
        // 100h
        // 999h
        const unitSeconds = '[s]';
        const unitMinutes = '[m]';
        const unitHours = '[H]';

        const s = floatSeconds;
        if(s < 60){
            return `${s}${unitSeconds}`;
        }
        if(s < 3600){
            const m = Math.floor(s/60);
            return `${m}${unitMinutes}`;
        }
        if(s < 36000){
            const floatHourByMul10 = s*10/3600;
            const integerHourByMul10 = Math.floor(floatHourByMul10);
            const h = integerHourByMul10/10;
            return `${h}${unitHours}`;
        }
        const h = Math.floor(s/3600);
        return `${h}${unitHours}`;
    }

    constructor(target_ul_selector){
        this._target_selector = target_ul_selector;
    }

    clear(){
        $(this._target_selector).children().remove();
    }

    onChangedTask(tasks){
        this.visualize(tasks);
    }

    // @param tasks An array of an instance of Task.
    visualize(tasks){
        this.clear();

        const LIMIT_OF_DISPLAY_LOG_COUNT = 10;

        // header is task count for the convenience
        const taskCount = tasks.length;
        let headerLine = `<li>${taskCount} tasks</li>`;
        $(this._target_selector).append(headerLine);

        // tasks = [task1, task2, task3, ...]
        //        <----             ---->
        //       oldest              newest

        // parse with reverse order because want to display newest firstly.
        for(let i=tasks.length-1; i>=0; i--){
            if(tasks.length - i >= LIMIT_OF_DISPLAY_LOG_COUNT){
                break;
            }
            let task = tasks[i];

            let body = this._task2visualizeeString(task);
            let html = `<li>${body}</li>`;
            $(this._target_selector).append(html);
        }
    }

    _task2visualizeeString(task){
        let st = task.getStarttimeShort();
        let et = task.getEndtimeShort();

        const emptytime = TaskVisualizer.getEmptytimeShort()
        if(st == ''){
            st = emptytime;
        }
        if(et == ''){
            et = emptytime;
        }

        let actualsec = task.getActualSeconds();
        let actual = '';
        if(actualsec >= 0){
            actual = TaskVisualizer.actualSeconds2Printable(actualsec);
        }

        let taskname = task.getTaskname();

        return `${st} ${et} ${actual} ${taskname}`;
    }

}

class TaskFormatter {
    constructor(taskManager){
        this._taskManager = taskManager;
    }

    obtainBasenameWithDatetimeRange(){
        let tasks = this._taskManager.getTasks();
        let taskCount = tasks.length;

        if(taskCount == 0){
            return Datetime.nowDatestr();
        }

        if(taskCount == 1){
            return tasks[0].getShortDatetime();
        }

        let oldest = tasks[0].getShortDatetime();
        let newest = tasks[taskCount - 1].getShortDatetime();
        let ret = `${oldest}-${newest}-${taskCount}counts`;
        return ret;
    }

    obtainCSVLines(){
        let tasks = this._taskManager.getTasks();
        let csvLines = [];
        csvLines.push(this._headerCsvLine());
        for(let i=0; i<tasks.length; i++){
            let task = tasks[i];

            let csvLine = this._task2csvline(task);
            csvLines.push(csvLine);
        }
        return csvLines;
    }

    _headerCsvLine(){
        return "ExecutionDate,ExecutionDOW,StartTime,EndTime,Actual[m],Actual[h],TaskName";
    }

    _task2csvline(task){
        const whereFromOfActualRounding = 2;

        let dt = task.getExecutionDateRaw();
        let dow = task.getExecutionDOWRaw();
        let st = task.getStarttimeRaw();
        let et = task.getEndtimeRaw();
        let actualsec = task.getActualSeconds();
        let actualmin = Util.round(actualsec/60.0, whereFromOfActualRounding);
        let actualhour = Util.round(actualmin/60.0, whereFromOfActualRounding);
        let taskname = task.getTaskname();

        const emptytime = '';
        if(st == ''){
            st = emptytime;
        }
        if(et == ''){
            et = emptytime;
        }
        if(st == emptytime || et == emptytime){
            // Cannot calc the actual, so use zero toriaezu.
            actualmin = 0;
            actualhour = 0;
        }

        return `${dt},${dow},${st},${et},${actualmin},${actualhour},${taskname}`;
    }

}

class Task {
    static get STRINGIFYING_DELIMITOR(){
        return ',';
    }

    static get STRINGIFYING_TASKNAME_POSITION(){
        return 7;
    }

    // @property _executiondate A string with YYYY-MM-DD
    // @property _starttime A string with HH:MM
    // @property _endtime A string with HH:MM
    constructor(taskname){
        this._taskname = taskname;
        this._executiondate = '';
        this._executiondow = '';
        this._starttime = '';
        this._endtime = '';

        this._shortDatetime = '';

        this._isOverDate = false;
        this._actualtimeBySec = -1;
    }

    start(){
        this._starttime = Datetime.nowTimeStr();
        this._executiondate = Datetime.nowDateStr();
        this._executiondow = Datetime.nowDowStr();
        this._shortDatetime = `${Datetime.nowShortDateStr()}_${Datetime.nowShortTimeStr()}`;
    }

    end(){
        this._endtime = Datetime.nowTimeStr();
        this._calcActual();
    }

    _calcActual(){
        let dateWhenEnded = this._executiondate;
        let curDate = Datetime.nowDateStr();
        if(curDate != this._executiondate){
            this._isOverDate = true;
            dateWhenEnded = Datetime.nowDateStr();
        }

        let starttimeDtobj = new Datetime();
        let endtimeDtobj = new Datetime();
        starttimeDtobj.fromDatetimeString(this._executiondate, this._starttime);
        endtimeDtobj.fromDatetimeString(dateWhenEnded, this._endtime);
        this._actualtimeBySec = endtimeDtobj.diff(starttimeDtobj);
    }

    getShortDatetime(){
        return this._shortDatetime;
    }

    getStarttimeRaw(){
        return this._starttime;
    }

    getEndtimeRaw(){
        return this._endtime;
    }

    getStarttimeShort(){
        let timestr = this.getStarttimeRaw();
        return timestr.substr(0, 5);
    }

    getEndtimeShort(){
        let timestr = this.getEndtimeRaw();
        return timestr.substr(0, 5);
    }

    getExecutionDateRaw(){
        return this._executiondate;
    }

    getExecutionDOWRaw(){
        return this._executiondow;
    }

    getTaskname(){
        return this._taskname;
    }

    getActualSeconds(){
        return this._actualtimeBySec;
    }

    toString(){
        let array = [];

        // The taskname field must be last
        // because this contains a delimitor the part of string.
        array.push(
            this._executiondate,
            this._executiondow,
            this._starttime,
            this._endtime,
            this._shortDatetime,
            this._isOverDate.toString(),
            this._actualtimeBySec.toString(),
            this._taskname,                     // taskname position(0 origin)
        );

        let meByString = array.join(Task.STRINGIFYING_DELIMITOR);
        return meByString;
    }

    // @param stringifiedString A string generated from task.toString().
    fromString(stringifiedString){
        const DELIMITOR = Task.STRINGIFYING_DELIMITOR;
        const POSITION_TASKNAME = Task.STRINGIFYING_TASKNAME_POSITION;
        let arrayBeforeTaskname = stringifiedString.split(DELIMITOR, POSITION_TASKNAME);

        let taskname = stringifiedString.split(DELIMITOR).slice(POSITION_TASKNAME).join(DELIMITOR);

        // Do not use Destructuring_assignment.
        // Maybe not supported enough yet
        // See: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

        let array = arrayBeforeTaskname;
        this._executiondate = array[0];
        this._executiondow = array[1];
        this._starttime = array[2];
        this._endtime = array[3];
        this._shortDatetime = array[4];
        this._isOverDate = Util.string2bool(array[5]);
        this._actualtimeBySec = parseInt(array[6]);
        this._taskname = taskname;
    }
}

class TaskManager {
    constructor(){
        this._tasks = [];
        this._callbackInstancesOnChangedTask = [];
    }

    startTask(taskname){
        let nowtime = Datetime.nowTimeStr()

        let prevTask = this._getLatestTask()
        if(prevTask){
            prevTask.end();
        }

        let curTask = new Task(taskname);
        curTask.start();
        this._tasks.push(curTask);

        this._onChangedTask();
    }

    clearAllTasks(){
        // Save the latest task because it is your doing task currently.
        if(this._tasks.length > 0){
            const taskCount = this._tasks.length;
            let latestTask = this._tasks[taskCount - 1];
            this._tasks = [latestTask];
        }else{
            this._tasks = [];
        }
        this._onChangedTask();
    }

    _getLatestTask(){
        if(this._tasks.length == 0){
            return null;
        }
        const idx = this._tasks.length - 1;
        return this._tasks[idx];
    }

    getTasks(){
        return this._tasks;
    }

    loadTasks(tasks){
        this._tasks = tasks;
        this._onChangedTask();
    }

    // @param inst An instance which have a method `onChangedTask(tasks)`.
    addCallbackInstanceOnChangedTask(inst){
        this._callbackInstancesOnChangedTask.push(inst);
    }

    _onChangedTask(){
        let insts = this._callbackInstancesOnChangedTask;
        let tasks = this.getTasks();
        for(let inst of insts){
            inst['onChangedTask'](tasks);
        }
    }
}
