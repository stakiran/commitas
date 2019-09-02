'use strict';

const PRODUCT_NAME = 'Commitas'
const VERSION      = 'v0.0.2';
const CAPTION      = PRODUCT_NAME + ' - ' + VERSION;
const ROOT_KEY     = 'commitas'

const PATH_HELPPAGE = './help.html';

const K = {
    'ENTER'  : 13,
    'ESC'    : 27,
    'DELETE' : 46,
    'S'      : 83,
};
const SELECTOR_KEYWATCH_TARGET = 'body';
const SELECTOR_INPUT = '#yourtask';
const SELECTOR_LOG_INSERTEE = '#logAreaTop';
const SELECTOR_TRIGGER_FROM_CLICK_TO_FOCUS_INPUT = 'body';

function focusAndSelect(){
    $(SELECTOR_INPUT).focus().select();
}

function startTask(taskManager){
    let taskname = $(SELECTOR_INPUT).val();
    taskManager.startTask(taskname);
}

function doDownload(taskManager, taskFormatter){
    let csvLines = taskFormatter.obtainCSVLines()
    let csvStr = Util.lines2str(csvLines);
    let csvData = csvStr;

    let basename = taskFormatter.obtainBasenameWithDatetimeRange();

    Util.start_download_csv(csvData, basename);
}

function doClear(taskManager){
    let isOk = Util.dialogConfirm(PRODUCT_NAME, MsgConfirmClearTasks);
    if(!isOk){
        return;
    }
    taskManager.clearAllTasks();
}

function loadTasksFromLocalStorage(taskManager, dataManager){
    let tasks = dataManager.getTasks();
    taskManager.loadTasks(tasks);
}

function detectVersionDifference(dataManager){
    const thisVersion = VERSION;

    if(dataManager.isFirstUse()){
        dataManager.setVersionInfo(thisVersion);
        return;
    }

    const storagedVersion = dataManager.getVersionInfo();
    if(thisVersion == storagedVersion){
        return;
    }

    const caption = PRODUCT_NAME;
    const message = MsgConfirmVersionDifferent.replace('{{storagedVersion}}', storagedVersion).replace('{{thisVersion}}', thisVersion);
    const isYesFirstly = Util.dialogConfirm(caption, message);
    if(!isYesFirstly){
        throw new Error('[Abort] Canceled.');
    }
    dataManager.setVersionInfo(thisVersion);
}

$(function(){
    // button events
    // -------------

    $("#buttondownload").click(function(){
        doDownload(taskManager, taskFormatter);
    });

    $("#buttonclear").click(function(){
        doClear(taskManager);
    });

    $("#buttonhelp").click(function(){
        let url = PATH_HELPPAGE;
        let mode = '_blank';
        window.open(url, mode);
    });

    // input task area events
    // ----------------------
    // To avoid instantaneous key-repeating, use flag-based guard.

    $(SELECTOR_KEYWATCH_TARGET).keydown(function(e){
        const keycode = e.keyCode;
        const mod_alt = e.altKey;
        const mod_ctrl = e.ctrlKey;
        const mod_shift = e.shiftKey;

        if(keycode == K.ESC){
            focusAndSelect();
            return;
        }
    });

    $(SELECTOR_INPUT).keydown(function(e){
        const keycode = e.keyCode;
        const mod_alt = e.altKey;
        const mod_ctrl = e.ctrlKey;
        const mod_shift = e.shiftKey;

        // ---- shift ----

        if(!mod_alt && !mod_ctrl && mod_shift){
            if(keycode == K.ENTER){
                if(!('s_enter' in stickflags)){
                    stickflags['s_enter'] = '';
                    doDownload(taskManager, taskFormatter);
                }
                e.preventDefault();
            }
            if(keycode == K.DELETE){
                if(!('s_delete' in stickflags)){
                    stickflags['s_delete'] = '';
                    doClear(taskManager);
                    // After closing a dialog, not be passed below condition:
                    //
                    //   if(('s_delete' in stickflags) && keycode==K.DELETE)
                    //
                    // By this behavior, re-try of displaying dialog not working.
                    // So, do clear the flag here.
                    delete stickflags['s_delete'];
                }
                e.preventDefault();
            }
        }

        // ---- ctrl ----

        if(!mod_alt && mod_ctrl && !mod_shift){
            if(keycode == K.S){
                if(!('c_s' in stickflags)){
                    stickflags['c_s'] = '';
                    doDownload(taskManager, taskFormatter);
                }
                e.preventDefault();
            }
        }

        // ---- no modifier ----

        if(!mod_alt && !mod_ctrl && !mod_shift){
            if(keycode == K.ENTER){
                if(!('enter' in stickflags)){
                    stickflags['enter'] = '';
                    startTask(taskManager);
                    focusAndSelect();
                }
                e.preventDefault();
            }

            if(keycode == K.ESC){
                focusAndSelect();
                return;
            }
        }
    });

    $(SELECTOR_INPUT).keyup(function(e){
        let keycode = e.keyCode;
        let mod_alt = e.altKey;
        let mod_ctrl = e.ctrlKey;
        let mod_shift = e.shiftKey;

        if(('enter' in stickflags) && keycode == K.ENTER){
            delete stickflags['enter'];
        }
        if(('s_enter' in stickflags) && keycode==K.ENTER){
            delete stickflags['s_enter'];
        }
        if(('s_delete' in stickflags) && keycode==K.DELETE){
            delete stickflags['s_delete'];
        }
        if(('c_s' in stickflags) && keycode==K.S){
            delete stickflags['c_s'];
        }
    });

    $(window).focus(function(e){
        focusAndSelect();
    });

    // initialize objects
    // ------------------

    Datetime.init();

    let stickflags = {};

    let taskManager = new TaskManager();
    let taskVisualizer = new TaskVisualizer(SELECTOR_LOG_INSERTEE)
    let taskFormatter = new TaskFormatter(taskManager);

    let localstorageManager = new LocalStorageManager(window.localStorage);
    let localstorageWrapper = new LocalStorageWrapper(localstorageManager, ROOT_KEY);
    let dataManager = new DataManager(localstorageWrapper);

    detectVersionDifference(dataManager);

    taskManager.addCallbackInstanceOnChangedTask(taskVisualizer);
    taskManager.addCallbackInstanceOnChangedTask(dataManager);

    loadTasksFromLocalStorage(taskManager, dataManager);
});
