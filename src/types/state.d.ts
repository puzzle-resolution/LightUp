import { BlankStatus, BlackStatus, Position } from './block';
export interface State {
    //const
    // graph: BlockType[][],
    // blankBlocks: { x: number, y: number, count: BlackBlockType }[],
    //var
    currentRecuIndex: number,
    blankState: BlankStatus[][], //当前白色块的情况
    blackState: BlackStatus[][], //当前黑色块的完成情况
}

export interface Case {
    position: Position,
    choose: boolean,
}