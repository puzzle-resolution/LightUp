
function parseTask(key: string, puzzleWidth: number, puzzleHeight: number) {
    const decodeChar = function (e: string) {
        return e.charCodeAt(0) - 96;
    };
    let task: any[][] = [];
    for (var e = [], i = 0, r = 0; r < key.length; r++)
        '0' <= key[r] && key[r] <= '9' // $.isNumeric(key[r])
            ? (e[i] = key[r], i++)
            : "B" == key[r]
                ? (e[i] = -2, i++)
                : i += decodeChar(key[r]);
    for (var r = 0; r < puzzleHeight; r++) {
        task[r] = [];
        for (var i = 0; i < puzzleWidth; i++) {
            var l = r * puzzleWidth + i;
            "undefined" == typeof e[l]
                ? task[r][i] = -1
                : task[r][i] = parseInt(e[l] as string);
        }
    }
    return task;
}
export default parseTask;