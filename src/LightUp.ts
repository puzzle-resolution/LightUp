import parseTask from './parsetask';
import { replaceAnswer, submitAnswer } from './submit';
import { BlockType, BlackBlockType, BlankStatus, BlackStatus, Position } from './types/block';
import { State, Case } from './types/state';

const mockTask = true; //mock调试模式
const mockData = {
    taskKey: "b1b0aBl1c0c2lBa0b2b",
};

type QueueType = Set<string>;

export default class LightUp {
    graph: BlockType[][];
    blackBlocks: { x: number, y: number, count: BlackBlockType }[];
    answer?: string;
    constructor(graph: BlockType[][]) {
        this.graph = graph;
        this.blackBlocks = this.initBlackBlocks(graph);
    }

    initBlackBlocks(Graph: BlockType[][]) {
        let blocks: { x: number, y: number, count: BlackBlockType }[] = [];
        for (let x of Graph.keys())
            for (let y of Graph[x].keys())
                if (Graph[x][y] !== BlockType.WHITE && Graph[x][y] !== BlockType.BLACK)
                    blocks.push({ x, y, count: Graph[x][y] as unknown as BlackBlockType });
        return blocks;
    }
    initState(Graph: BlockType[][]): [BlankStatus[][], BlackStatus[][]] {
        let blankState: BlankStatus[][] = [], blackState: BlackStatus[][] = [];
        for (let x of Graph.keys()) {
            blankState[x] = [], blackState[x] = [];
            for (let y of Graph[x].keys()) {
                if (Graph[x][y] === BlockType.WHITE) { //空白
                    blankState[x][y] = BlankStatus.Blank;
                    blackState[x][y] = -1;
                } else {
                    blankState[x][y] = BlankStatus.NONE;
                    blackState[x][y] = Graph[x][y];
                }
            }
        }
        return [blankState, blackState];
    }

    cloneState<T>(arr: T[][]) { //深拷贝二维数组
        return arr.map(a => a.map(b => b));
    }
    checkBoundary(p: Position): boolean {
        return !(p.x < 0 || p.x >= this.graph.length || p.y < 0 || p.y >= this.graph[0].length);
    }
    clonePosition(p: Position): Position { //拷贝对象
        // return { x: p.x, y: p.y };
        return { ...p };
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

    listTRBL(p: Position, breakCondition: (p: Position) => boolean, applyCondition: (p: Position) => boolean): Position[] { //返回任意位置四个方向上，满足(!breakCondition&&applyCondition)条件的位置；breakCondition用于中止单个方向上的遍历
        let list: Position[] = [];
        for (let p1 = this.leftPosition(p); ; p1 = this.leftPosition(p1)) {
            if (this.checkBoundary(p1) && breakCondition(this.clonePosition(p1))) {
                if (applyCondition(this.clonePosition(p1))) { list.push(this.clonePosition(p1)); }
            } else { break; } //到达边界 或 符合中止条件
        }
        for (let p1 = this.rightPosition(p); ; p1 = this.rightPosition(p1)) {
            if (this.checkBoundary(p1) && breakCondition(this.clonePosition(p1))) {
                if (applyCondition(this.clonePosition(p1))) { list.push(this.clonePosition(p1)); }
            } else { break; } //到达边界 或 符合中止条件
        }
        for (let p1 = this.topPosition(p); ; p1 = this.topPosition(p1)) {
            if (this.checkBoundary(p1) && breakCondition(this.clonePosition(p1))) {
                if (applyCondition(this.clonePosition(p1))) { list.push(this.clonePosition(p1)); }
            } else { break; } //到达边界 或 符合中止条件
        }
        for (let p1 = this.bottomPosition(p); ; p1 = this.bottomPosition(p1)) {
            if (this.checkBoundary(p1) && breakCondition(this.clonePosition(p1))) {
                if (applyCondition(this.clonePosition(p1))) { list.push(this.clonePosition(p1)); }
            } else { break; } //到达边界 或 符合中止条件
        }
        return list;
    }
    listAccessableBlank(data: State, p: Position): Position[] { //返回任意方块四个方向上连通的、可用的空白块
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了listAccessableBlank动作'); return []; } //判断边界
        const { blankState } = data;
        const breakCondition = (p: Position): boolean => {
            return this.graph[p.x][p.y] !== BlockType.WHITE;
        }
        const applyCondition = (p: Position): boolean => {
            return this.graph[p.x][p.y] === BlockType.WHITE && blankState[p.x][p.y] === BlankStatus.Blank;
        }
        return this.listTRBL(p, breakCondition, applyCondition);
    }
    listUnlightBlank(data: State, p: Position): Position[] { //返回任意方块四个方向上连通的、未被点亮的空白块
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了listUnlightBlank动作'); return []; } //判断边界
        const { blankState } = data;
        const breakCondition = (p: Position): boolean => {
            return this.graph[p.x][p.y] !== BlockType.WHITE;
        }
        const applyCondition = (p: Position): boolean => {
            return this.graph[p.x][p.y] === BlockType.WHITE && (blankState[p.x][p.y] !== BlankStatus.Lighted && blankState[p.x][p.y] !== BlankStatus.Checked);
        }
        return this.listTRBL(p, breakCondition, applyCondition);
    }
    aroundTRBL(p: Position, applyCondition: (p: Position) => boolean): Partial<[Position, Position, Position, Position]> { //返回任意位置周围四个位置，满足applyCondition条件的位置
        let result = [undefined, undefined, undefined, undefined] as Partial<[Position, Position, Position, Position]>;
        const top = this.topPosition(p);
        if (applyCondition(this.clonePosition(top))) { result[0] = top; }
        const right = this.rightPosition(p);
        if (applyCondition(this.clonePosition(right))) { result[1] = right; }
        const bottom = this.bottomPosition(p);
        if (applyCondition(this.clonePosition(bottom))) { result[2] = bottom; }
        const left = this.leftPosition(p);
        if (applyCondition(this.clonePosition(left))) { result[3] = left; }
        return result;
    }
    restBlankCanChoose(data: State, p: Position): Partial<[Position, Position, Position, Position]> { //返回黑色块四周可用的空白块,返回位置[上,右,下,左]
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了restBlankCanChoose动作'); return [undefined, undefined, undefined, undefined]; } //判断边界
        if (this.graph[p.x][p.y] === BlockType.WHITE) { console.log('//对非黑色块执行了restBlankCanChoose动作'); return [undefined, undefined, undefined, undefined]; } //检查非空白块

        const { blankState } = data;
        const condition = (px: Position): boolean => {
            return this.checkBoundary(px) && this.graph[px.x][px.y] === BlockType.WHITE && blankState[px.x][px.y] === BlankStatus.Blank;
        }
        return this.aroundTRBL(p, condition);
    }
    restBlackUnsolved(data: State, p: Position): Partial<[Position, Position, Position, Position]> { //返回任意方块四周未完成的节点,返回位置[上,右,下,左]
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了restBlackUnsolved动作'); return [undefined, undefined, undefined, undefined]; } //判断边界

        const { blackState } = data;
        const condition = (px: Position): boolean => {
            return this.checkBoundary(px) && this.graph[px.x][px.y] !== BlockType.WHITE && this.graph[px.x][px.y] !== BlockType.BLACK && this.graph[px.x][px.y] !== BlockType.ZERO && blackState[px.x][px.y] === this.graph[px.x][px.y];
        }
        return this.aroundTRBL(p, condition);
    }

    disablePosition(data: State, queue: QueueType, p: Position): boolean { //禁用空白块p
        const { x, y } = p;
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了禁用动作'); return false; } //判断边界
        if (this.graph[x][y] !== BlockType.WHITE) { console.log('//对非空白块执行了禁用动作'); return false; } //检查非空白块

        if (data.blankState[x][y] === BlankStatus.Blank) {
            data.blankState[x][y] = BlankStatus.Disabled;
            //四周未完成的节点，加入队列
            const blacks = this.restBlackUnsolved(data, { x, y });
            this.appendToUpdateQueue(data, queue, blacks.filter(i => i) as NonNullable<(typeof blacks)[number]>[]);
            //四个方向上连通的，未被点亮的空白块，加入队列
            const blanks = this.listUnlightBlank(data, { x, y });
            this.appendToUpdateQueue(data, queue, blanks);
            return true;
        } else { return false; }
    }
    lightPosition(data: State, queue: QueueType, p: Position): boolean {
        //四周未完成的节点，加入队列
        const blacks = this.restBlackUnsolved(data, p);
        this.appendToUpdateQueue(data, queue, blacks.filter(i => i) as NonNullable<(typeof blacks)[number]>[]);
        //四个方向上(2个方向)连通的，未被点亮的空白块，加入队列
        const blanks = this.listUnlightBlank(data, p);
        this.appendToUpdateQueue(data, queue, blanks);
        return true;
    }
    choosePosition(data: State, queue: QueueType, p: Position): boolean { //选中空白块p
        const { x, y } = p;
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了选择动作'); return false; } //判断边界
        if (this.graph[x][y] !== BlockType.WHITE) { console.log('//对非空白块执行了选择动作'); return false; } //检查非空白块

        if (data.blankState[x][y] === BlankStatus.Blank) {
            //更新空白块状态为已选中
            data.blankState[x][y] = BlankStatus.Checked;
            //更新空白块四周的未完成节点的状态，并将应用了更新动作的节点加入队列
            //此处直接加入队列，更新动作由队列处理
            const blacks = this.restBlackUnsolved(data, { x, y });
            this.appendToUpdateQueue(data, queue, blacks.filter(i => i) as NonNullable<(typeof blacks)[number]>[]);
            //点亮四个方向上连通的空白块
            const blanks = this.listUnlightBlank(data, { x, y });
            blanks.map(i => this.lightPosition(data, queue, i));
            return true;
        }
        return false;
    }
    updateEqual(data: State, queue: QueueType, p: Position): boolean { //更新节点的等价状态
        if (!this.checkBoundary(p)) { console.log('//对边界外区域执行了更新动作'); return false; } //判断边界
        const { x, y } = p;
        let { blankState, blackState } = data;
        switch (this.graph[x][y]) {
            case BlockType.WHITE:
                if (blankState[x][y] === BlankStatus.Blank) { //空白块
                    //查找四个方向上，是否有连通的可用的空白块
                    //若没有，则选中当前空白块；否则无动作
                    const blanks = this.listAccessableBlank(data, p);
                    if (blanks.length === 0) {
                        if (this.choosePosition(data, queue, p)) { console.log('选择动作失败1'); return false; }
                    }
                } else if (blankState[x][y] === BlankStatus.Disabled) { //禁用块
                    //查找四个方向上，是否有连通的可用的空白块
                    //若没有，则当前状态无解；若仅有一个，则选中该空白块；否则无动作
                    const blanks = this.listAccessableBlank(data, p);
                    if (blanks.length === 0) { return false; }
                    else if (blanks.length === 1) {
                        if (this.choosePosition(data, queue, p)) { console.log('选择动作失败2'); return false; }
                    }
                } else { } //忽略已选中的块
                break;
            case BlockType.BLACK: //忽略纯黑块
                break;
            default: //节点
                const state = blackState[x][y]; if (state === -1) { throw new Error('assert 1'); }
                const total = this.graph[x][y];
                const restPoints = this.restBlankCanChoose(data, p), rest = restPoints.filter(i => i !== undefined).length;
                if (rest === total) {
                    for (const p of restPoints)
                        if (p) if (this.choosePosition(data, queue, p)) { console.log('选择动作失败3'); return false; }
                } else if (rest < total) { console.log('周围没有足够的可用空白块'); return false; } //周围没有足够的可用空白块
                else {
                    if (total === 0) {
                        this.disablePosition(data, queue, this.leftPosition({ x, y }));
                        this.disablePosition(data, queue, this.topPosition({ x, y }));
                        this.disablePosition(data, queue, this.rightPosition({ x, y }));
                        this.disablePosition(data, queue, this.bottomPosition({ x, y }));
                    } else if (total === 1 && rest === 2) {
                        const [p1, p2, p3, p4] = restPoints;
                        if ((p1 !== undefined && p3 !== undefined)
                            || (p2 !== undefined && p4 !== undefined)) { } //两点为水平角度，无动作
                        else {
                            if (p1 !== undefined && p2 !== undefined) {//上右
                                this.disablePosition(data, queue, this.topPosition(this.leftPosition({ x, y })));
                            } else if (p2 !== undefined && p3 !== undefined) {//右下
                                this.disablePosition(data, queue, this.rightPosition(this.bottomPosition({ x, y })));
                            } else if (p3 !== undefined && p4 !== undefined) {//下左
                                this.disablePosition(data, queue, this.bottomPosition(this.leftPosition({ x, y })));
                            } else if (p4 !== undefined && p1 !== undefined) {//左上
                                this.disablePosition(data, queue, this.leftPosition(this.topPosition({ x, y })));
                            } else { throw new Error('assert 2'); }
                        }
                    } else if (total === 1 && rest === 3) { } //无动作
                    else if (total === 1 && rest === 4) { } //无动作
                    else if (total === 2 && rest === 3) {
                        const [p1, p2, p3, p4] = restPoints;
                        if (p1 === undefined) { //右下左,禁用右下和下左
                            this.disablePosition(data, queue, this.rightPosition(this.bottomPosition({ x, y })));
                            this.disablePosition(data, queue, this.bottomPosition(this.leftPosition({ x, y })));
                        } else if (p2 === undefined) { //下左上,禁用下左和左上
                            this.disablePosition(data, queue, this.bottomPosition(this.leftPosition({ x, y })));
                            this.disablePosition(data, queue, this.leftPosition(this.topPosition({ x, y })));
                        } else if (p3 === undefined) { //左上右,禁用左上和上右
                            this.disablePosition(data, queue, this.leftPosition(this.topPosition({ x, y })));
                            this.disablePosition(data, queue, this.topPosition(this.leftPosition({ x, y })));
                        } else if (p4 === undefined) { //上右下,禁用上右和右下
                            this.disablePosition(data, queue, this.topPosition(this.leftPosition({ x, y })));
                            this.disablePosition(data, queue, this.rightPosition(this.bottomPosition({ x, y })));
                        } else { throw new Error('assert 3'); }
                    } else if (total === 2 && rest === 4) { } //无动作
                    else if (total === 3 && rest === 4) { //禁用四角的空白块
                        this.disablePosition(data, queue, { x: x - 1, y: y + 1 });
                        this.disablePosition(data, queue, { x: x + 1, y: y + 1 });
                        this.disablePosition(data, queue, { x: x - 1, y: y - 1 });
                        this.disablePosition(data, queue, { x: x + 1, y: y - 1 });
                    } else { throw new Error('assert 4'); }
                }
        }
        return true;
    }

    // 判断位置是否已完成，已完成的位置满足以下条件
    // 1. 空白块 已选中 / 已被点亮
    // 2. 纯黑块
    // 3. 黑块 已完成
    isSolvedPosition(data: State, p: Position): boolean {
        const { x, y } = p;
        switch (this.graph[x][y]) {
            case BlockType.WHITE: //空白块
                return data.blankState[x][y] === BlankStatus.Checked || data.blankState[x][y] === BlankStatus.Lighted;
            case BlockType.ZERO: //纯黑块
                return true;
            default: //黑块
                return data.blackState[x][y] === this.graph[x][y];
        }
    }

    appendToUpdateQueue(data: State, queue: QueueType, points: Position[]): boolean { //将p插入等待队列
        for (let { x, y } of points) {
            const queueKey = `${x},${y}`;
            //去重
            if (queue.has(queueKey)) { continue; }
            //校验位置是否完成
            if (this.isSolvedPosition(data, { x, y })) { continue; }
            //添加到队列
            queue.add(queueKey);
        }
        return true;
    }
    clearUpdateQueue(data: State, queue: QueueType): boolean { //清空等待队列
        let count = 0;
        try {
            while (queue.size > 0) {
                const pos = [...queue.keys()][0];
                queue.delete(pos);
                console.log('clear queue', count++, pos);

                const [x, y] = pos.split(',').map(i => +i);
                this.updateEqual(data, queue, this.clonePosition({ x, y }));
            }
        } catch (err) {
            console.error('clear queue error', err);
            return false;
        }
        return true;
    }

    findNext(data: State): Position | false { //寻找一个未完成的空白块
        const { blankState } = data;
        for (let x of this.graph.keys())
            for (let y of this.graph[x].keys())
                if (this.graph[x][y] === BlockType.WHITE
                    && (blankState[x][y] !== BlankStatus.Lighted
                        && blankState[x][y] !== BlankStatus.Checked)) return { x, y };
        return false;
    }
    verificate(data: State): boolean {
        const { blackState, blankState } = data;
        for (let x of this.graph.keys()) {
            for (let y of this.graph[x].keys()) {
                if (this.graph[x][y] === BlockType.WHITE) {
                    if (!(blankState[x][y] == BlankStatus.Lighted || blankState[x][y] == BlankStatus.Checked))
                        return false;
                } else if (this.graph[x][y] !== BlockType.BLACK) {
                    if (blackState[x][y] != this.graph[x][y])
                        return false;
                }
            }
        }
        return true;
    }

    getPositionCases(data: State, p: Position): Case[] { //获取一个未完成空白块的所有方案(两种)
        return [
            { position: this.clonePosition(p), choose: true },
            { position: this.clonePosition(p), choose: false },
        ];
    }
    applyPositionCase(data: State, queue: QueueType, c: Case): boolean { //应用一个未完成空白块的某一方案
        const { position, choose } = c;
        if (choose) {
            return this.choosePosition(data, queue, position);
        } else {
            return this.disablePosition(data, queue, position);
        }
    }
    recu(data: State): State | false {
        const { currentRecuIndex } = data;
        let queue = new Set<string>();
        if (currentRecuIndex == 0) { //初始动作，更新所有节点(黑色块)状态
            for (let { x, y, count } of this.blackBlocks.values())
                if (!this.updateEqual(data, queue, { x, y })) { console.log("//该位置更新失败"); return false; } //该位置更新失败
            if (this.clearUpdateQueue(data, queue)) {
                const newData = {
                    currentRecuIndex,
                    blankState: this.cloneState(data.blankState),
                    blackState: this.cloneState(data.blackState),
                };
                return this.recu({ ...newData, currentRecuIndex: newData.currentRecuIndex + 1 });
            } else { return false; } //队列清理失败
        } else {
            //寻找未完成的空白块，递归尝试
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
                        const newQueue = new Set(queue);
                        if (this.applyPositionCase(newData, newQueue, c) && this.clearUpdateQueue(newData, newQueue)) {
                            const result = this.recu({ ...newData, currentRecuIndex: newData.currentRecuIndex + 1 });
                            if (result) { return result };
                        }
                    }
                    console.log("//所有方案都失败");
                    return false; //所有方案都失败
                }
            } else {
                if (this.verificate(data)) { //已完成全图
                    return data;
                } else { //空白块全部已完成时，存在未完成的节点
                    return false;
                }
            }
        }
    }

    solve(): string {
        const [blankState, blackState] = this.initState(this.graph);
        const result = this.recu({
            blankState: this.cloneState(blankState),
            blackState: this.cloneState(blackState),
            currentRecuIndex: 0,
        });
        return (this.answer = (result ? this.generaterAnawer(result.blankState) : 'failed'));
    }
    generaterAnawer(blankState: State["blankState"]): string {
        return 'success';
    }
}


(() => {
    console.log('start');
    // const puzzleSize = ({
    //     0: [7, 7], 1: [7, 7], 2: [7, 7],
    //     3: [10, 10], 4: [10, 10], 5: [10, 10],
    //     6: [14, 14], 7: [14, 14], 8: [14, 14],
    //     9: [25, 25], 10: [25, 25], 11: [25, 25],
    //     13: [30, 30], 12: [30, 40], 14: [40, 50],
    // } as { [key in number]: [number, number] })[+Object.fromEntries([...new URL(location.href).searchParams]).size || 0];
    const puzzleSize: [number, number] = [7, 7];
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