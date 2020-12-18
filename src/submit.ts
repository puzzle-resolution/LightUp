export function replaceAnswer(answer: string) {
    if (document && $) {
        $('#puzzleForm').attr('onsubmit', `console.log('customer onsubmit');
        Game.saveState();
        Game.tickTimer();
        this.jstimerPersonal.value = Game.getTimer();
        this.ansH.value = '${answer}';`);

        $("#btnReady").off("click"); //卸载post提交答案方法，绕过Game组件逻辑
    }
}

export function submitAnswer() {
    (document.querySelector('#btnReady') as HTMLButtonElement | undefined)?.click();
}