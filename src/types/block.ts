
// export type BlockType =
//     -1  //空白块
//     | 0 //不带数字的黑色块
//     | 1 //数字为1的黑色块
//     | 2 //数字为2的黑色块
//     | 3 //数字为3的黑色块
//     | 4 //数字为4的黑色块
//     ;
export enum BlockType {
    WHITE = -1, //空白块
    BLACK = -2, //不带数字的黑色块
    ZERO = 0,   //数字为0的黑色块
    ONE = 1,    //数字为1的黑色块
    TWO = 2,    //数字为2的黑色块
    THREE = 3,  //数字为3的黑色块
    FOUR = 4,   //数字为4的黑色块
}
export enum BlackBlockType {
    ONE = BlockType.ONE,    //数字为1的黑色块
    TWO = BlockType.TWO,    //数字为2的黑色块
    THREE = BlockType.THREE,//数字为3的黑色块
    FOUR = BlockType.FOUR,  //数字为4的黑色块
}

export enum BlankStatus { //空白块状态
    NONE = -2, //不是空白块
    Disabled = -1, //空白块，已被禁止选中
    Blank = 0, //空白块，未选中
    Checked = 1, //空白块，已选中
    Lighted = 2, //空白块，已被灯点亮
}
export type BlackStatus = -1 | -2 | 0 | 1 | 2 | 3 | 4; //黑色块完成状态 (-1表示 不是黑色块，-2表示无数字的黑色块）

export interface Position {
    x: number,
    y: number,
}