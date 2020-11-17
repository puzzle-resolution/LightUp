import { BlankStatus, BlackStatus } from './block';
export interface State {
    //const
    // graph: BlockType[][],
    // blankBlocks: { x: number, y: number, count: BlankBlockType }[],
    //var
    currentRecuIndex: number,
    blankState: BlankStatus[][],
    blackState: BlackStatus[][],
}

export interface Case {

}