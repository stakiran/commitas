
describe('TaskVisualizer', function () {
    it('actualSeconds2Printable', function(){
        let f = TaskVisualizer.actualSeconds2Printable;

        let actual = f(2);
        let expect = '2[s]';
        assert.strictEqual(expect, actual);

        actual = f(11);
        expect = '11[s]';
        assert.strictEqual(expect, actual);

        actual = f(59);
        expect = '59[s]';
        assert.strictEqual(expect, actual);

        actual = f(60);
        expect = '1[m]';
        assert.strictEqual(expect, actual);

        actual = f(3600-1);
        expect = '59[m]';
        assert.strictEqual(expect, actual);

        actual = f(3600);
        expect = '1[H]';
        assert.strictEqual(expect, actual);

        actual = f(3600+359);
        expect = '1[H]';
        assert.strictEqual(expect, actual);

        actual = f(3600+360);
        expect = '1.1[H]';
        assert.strictEqual(expect, actual);

        actual = f(3600*9 + 3600-1);
        expect = '9.9[H]';
        assert.strictEqual(expect, actual);

        actual = f(3600*9 + 3600);
        expect = '10[H]';
        assert.strictEqual(expect, actual);

        let min12 = 60*12;
        let hour0_2 = min12;
        actual = f(3600*10 + hour0_2);
        expect = '10[H]';
        assert.strictEqual(expect, actual);

        actual = f(3600*11);
        expect = '11[H]';
        assert.strictEqual(expect, actual);

    });

});

describe('Task', function () {
    let assertTasks = (task1, task2) => {
        let f = assert.strictEqual;
        let methodNameLists = [
            'getShortDatetime',
            'getStarttimeRaw',
            'getEndtimeRaw',
            'getStarttimeShort',
            'getEndtimeShort',
            'getExecutionDateRaw',
            'getExecutionDOWRaw',
            'getTaskname',
            'getActualSeconds'
        ];
        for(let methodName of methodNameLists){
            f(task1[methodName](), task2[methodName]());
        }
    }

    it('toString fromString', function(){
        const taskname = '0123456789,a-zＡ－Ｚ,あいう \t 越後の龍甲斐の虎相模の獅子';
        let task = new Task(taskname);
        task.start();
        task.end();
        let taskByString = task.toString();

        let newTask = new Task('dummy');
        newTask.fromString(taskByString);

        assertTasks(task, newTask);
    });
});
