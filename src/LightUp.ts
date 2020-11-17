import parseTask from './parsetask';
import { replaceAnswer, submitAnswer } from './submit';
import { BlockType, BlankBlockType, BlankStatus, BlackStatus, Position } from './types/block';
import { State, Case } from './types/state';

const mockTask = true; //mock调试模式
const mockData = {
    taskKey: "b1b0aBl1c0c2lBa0b2b",
};

export default class LightUp {
    graph: BlockType[][];
    blackBlocks: { x: number, y: number, count: BlankBlockType }[];
    answer?: string;
    constructor(graph: BlockType[][]) {
        this.graph = graph;
        this.blackBlocks = this.initBlackBlocks(graph);
    }

    initBlackBlocks(Graph: BlockType[][]) {
        let blocks: { x: number, y: number, count: BlankBlockType }[] = [];
        for (let x of Graph.keys())
            for (let y of Graph[x].keys())
                if (Graph[x][y] !== BlockType.WHITE && Graph[x][y] !== BlockType.ZERO)
                    blocks.push({ x, y, count: Graph[x][y] as unknown as BlankBlockType });
        return blocks;
    }
    initState(Graph: BlockType[][]) {
        let blankState: BlankStatus[][] = [], blackState: BlackStatus[][] = [];
        for (let x of Graph.keys()) {
            blankState[x] = [];
            for (let y of Graph[x].keys()) {
                if (Graph[x][y] === BlockType.WHITE) { //空白
                    blankState[x][y] = BlankStatus.Blank;
                    blackState[x][y] = -1;
                } else {
                    blankState[x][y] = BlankStatus.Disabled;
                    blackState[x][y] = 0;
                }
            }
        }
        return [blankState, blackState];
    }
    cloneState<T>(arr: T[][]) { //深拷贝二维数组
        return arr.map(a => a.map(b => b));
    }

    findNext(data: State): Position | false { //寻找一个未完成的位置

    }
    restBlankCanChoose(data: State, p: Position): [Position | undefined, Position | undefined, Position | undefined, Position | undefined] { //返回黑色块四周是否有可用的空白块,返回位置[上,右,下,左]

    }
    updateEqual(data: State, p: Position, queue: Position[]): boolean { //更新节点的等价状态
        const { x, y } = p;
        let { blankState, blackState } = data;
        switch (this.graph[x][y]) {
            case BlockType.WHITE:
                if (blankState[x][y] === BlankStatus.Blank) { //空白块
                    for (let cx = x - 1; cx >= 0; cx--) {

                    }
                    for (let cx = x + 1; cs < this.graph)
                        for
                    for
                        
                } else if (blankState[x][y] === BlankStatus.Disabled) { //禁用块

                } else { } //忽略已选中的块
                break;
            case BlockType.ZERO: //忽略纯黑块
                break;
            default: //节点
                const state = blackState[x][y]; if (state === -1) { throw new Error('assert 1'); }
                const total = this.graph[x][y];
                const restPoints = this.restBlankCanChoose(data, p), rest = restPoints.filter(i => i !== undefined).length;
                if (rest === total) {
                    for (const p of restPoints)
                        if (p) if (this.choosePosition(data, queue, p)) { console.log('选择动作失败1'); return false; }
                } else if (rest < total) { console.log('周围没有足够的可用空白块'); return false; } //周围没有足够的可用空白块
                else {
                    if (total === 1 && rest === 2) {
                        const [p1, p2, p3, p4] = restPoints;
                        if ((p1 !== undefined && p3 !== undefined)
                            || (p2 !== undefined && p4 !== undefined)) { } //两点为水平角度，无动作
                        else {
                            if (p1 !== undefined && p2 !== undefined) {//上右
                                this.disablePosition(data, { x: x + 1, y: y - 1 });
                            } else if (p2 !== undefined && p3 !== undefined) {//右下
                                this.disablePosition(data, { x: x + 1, y: y + 1 });
                            } else if (p3 !== undefined && p4 !== undefined) {//下左
                                this.disablePosition(data, { x: x - 1, y: y + 1 });
                            } else if (p4 !== undefined && p1 !== undefined) {//左上
                                this.disablePosition(data, { x: x - 1, y: y - 1 });
                            } else { throw new Error('assert 2'); }
                        }
                    } else if (total === 1 && rest === 3) { } //无动作
                    else if (total === 1 && rest === 4) { } //无动作
                    else if (total === 2 && rest === 3) {
                        const [p1, p2, p3, p4] = restPoints;
                        if (p1 === undefined) {
                            this.disablePosition(data, { x: x - 1, y: y + 1 });
                            this.disablePosition(data, { x: x + 1, y: y + 1 });
                        } else if (p2 === undefined) {
                            this.disablePosition(data, { x: x - 1, y: y - 1 });
                            this.disablePosition(data, { x: x - 1, y: y + 1 });
                        } else if (p3 === undefined) {
                            this.disablePosition(data, { x: x - 1, y: y - 1 });
                            this.disablePosition(data, { x: x + 1, y: y - 1 });
                        } else if (p4 === undefined) {
                            this.disablePosition(data, { x: x - 1, y: y - 1 });
                            this.disablePosition(data, { x: x + 1, y: y + 1 });
                        } else { throw new Error('assert 3'); }
                    } else if (total === 2 && rest === 4) { } //无动作
                    else if (total === 3 && rest === 4) {
                        this.disablePosition(data, { x: x - 1, y: y + 1 });
                        this.disablePosition(data, { x: x + 1, y: y + 1 });
                        this.disablePosition(data, { x: x - 1, y: y - 1 });
                        this.disablePosition(data, { x: x + 1, y: y - 1 });
                    } else { throw new Error('assert 4'); }
                }
        }
        return true;
    }

    checkBoundary(p: Position): boolean {
        return !(p.x < 0 || p.x >= this.graph.length || p.y < 0 || p.y >= this.graph[0].length);
    }
    leftPosition(p: Position): Position {
        return { x: p.x, y: p.y - 1 };
    }
    rightPosition(p: Position): Position {
        return { x: p.x, y: p.y + 1 };
    }
    topPosition(p: Position): Position {
        return { x: p.x - 1, y: p.y };
    }
    bottomPosition(p: Position): Position {
        return { x: p.x + 1, y: p.y };
    }
    disablePosition(data: State, p: Position): boolean {
        const { x, y } = p;
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了禁用动作'); return false; } //判断边界
        if (this.graph[x][y] !== BlockType.WHITE) { console.log('//对非空白块执行了禁用动作'); return false; } //检查非空白块

        data.blankState[x][y] = BlankStatus.Disabled;
        return true;
    }
    choosePosition(data: State, queue: Position[], p: Position): boolean { //p为最新选中的方块
        const { x, y } = p;
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了选择动作'); return false; } //判断边界
        if (this.graph[x][y] !== BlockType.WHITE) { console.log('//对非空白块执行了选择动作'); return false; } //检查非空白块

    }
    appendUpdateQueue(data: State, queue: Position[], p: Position): boolean {

    }
    clearUpdateQueue(data: State, queue: Position[]): boolean { //清空等待队列

    }

    getPositionCases(data: State, p: Position): Case[] {

    }
    applyPositionCase(data: State, queue: Position[], c: Case): boolean {

    }
    recu(data: State): State | false {
        const { currentRecuIndex } = data;
        let queue: Position[] = [];
        if (currentRecuIndex == 0) { //初始动作，更新所有节点(黑色块)状态
            for (let { x, y, count } of this.blackBlocks.values())
                if (!this.updateEqual(data, { x, y }, queue)) { console.log("//该位置更新失败"); return false; } //该位置更新失败
            if (this.clearUpdateQueue(data, queue)) {
                const newData = {
                    currentRecuIndex,
                    blankState: this.cloneState(data.blankState),
                    blackState: this.cloneState(data.blackState),
                };
                return this.recu({ ...newData, currentRecuIndex: newData.currentRecuIndex + 1 });
            } else { return false; } //队列清理失败
        } else { //寻找一个位置，递归尝试所有方案
            const nextPosition = this.findNext(data);
            if (nextPosition) {
                const cases = this.getPositionCases(data, nextPosition);
                if (cases.length == 0) { console.log("//该位置没有可用方案"); return false; } //该位置没有可用方案
                else {
                    for (let c of cases) {
                        const newData = {
                            currentRecuIndex,
                            blankState: this.cloneState(data.blankState),
                            blackState: this.cloneState(data.blackState),
                        };
                        if (this.applyPositionCase(newData, queue, c) && this.clearUpdateQueue(newData, queue)) {
                            const result = this.recu({ ...newData, currentRecuIndex: newData.currentRecuIndex + 1 });
                            if (result) { return result };
                        }
                    }
                    console.log("//所有方案都失败");
                    return false; //所有方案都失败
                }
            } else { return data; } //已完成全图
        }
    }

    solve(): string {
        const [blankState, blackState] = this.initState(this.graph);
        const result = this.recu({
            blankState: this.cloneState(blankState),
            blackState: this.cloneState(blackState),
            currentRecuIndex: 0,
        });
        return (this.answer = (result ? this.generaterAnawer(result.blankState) : ''));
    }
    generaterAnawer(blankState: State["blankState"]): string {
        return 'success';
    }
}


(() => {
    const puzzleSize = ({
        0: [7, 7], 1: [7, 7], 2: [7, 7],
        3: [10, 10], 4: [10, 10], 5: [10, 10],
        6: [14, 14], 7: [14, 14], 8: [14, 14],
        9: [25, 25], 10: [25, 25], 11: [25, 25],
        13: [30, 30], 12: [30, 40], 14: [40, 50],
    } as { [key in number]: [number, number] })[+Object.fromEntries([...new URL(location.href).searchParams]).size || 0];
    const taskKey: string = mockTask ? mockData.taskKey : task; //test
    const tasks: BlockType[][] = (mockTask ? parseTask(taskKey, ...puzzleSize) as BlockType[][] : Game.task);
    console.log('task', taskKey, tasks);

    const lightup = new LightUp(tasks);
    const timer1 = new Date;
    const answer = lightup.solve();
    const timer2 = new Date;
    console.log('answer', answer);
    console.log('耗时', timer2.valueOf() - timer1.valueOf(), 'ms');

    replaceAnswer(answer);
    window.submit = submitAnswer;
    // const onmessage = (e: MessageEvent<string>) => {
    //     const tasks = JSON.parse(e.data);
    //     const puzzleWidth = ({
    //         0: 7, 1: 7, 2: 7,
    //         3: 10, 4: 10, 5: 10,
    //         6: 15, 7: 15, 8: 15,
    //         9: 25, 10: 25, 11: 25,
    //         13: 30, 12: 30, 14: 40,
    //     } as { [key in number]: number })[+Object.fromEntries([...new URL(location.href).searchParams]).size || 0];
    //     const hashi = new Hashi(tasks, puzzleWidth);
    //     const answer = hashi.solve();
    //     (postMessage as any)(answer);
    // }
    // //此处采用hack写法，需要写进所有依赖函数
    // const scriptStr = `
    //     cross=${cross.toString()}
    //     intersection=${intersection.toString()} 
    //     ${Hashi.toString()} 
    //     onmessage=${onmessage.toString()}
    // `;
    // const timer1 = new Date;
    // registerWorkerWithBlob({
    //     scriptStr,
    //     postMessageStr: JSON.stringify(tasks),
    //     onMessage: (e: MessageEvent<string>) => {
    //         const timer2 = new Date;
    //         const answer = e.data;
    //         console.log('answer', answer);
    //         console.log('耗时', timer2.valueOf() - timer1.valueOf(), 'ms');

    //         replaceAnswer(answer);
    //         window.submit = submitAnswer;
    //     }
    // });
})();

declare global {
    interface Window {
        submit: any;
    }
}