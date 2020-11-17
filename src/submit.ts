export function replaceAnswer(answer: string) {
    if (document && $) {
        $('#puzzleForm').attr('onsubmit', `console.log('customer onsubmit');
        Game.saveState();
        Game.tickTimer();
        this.jstimerPersonal.value = Game.getTimer();
        this.ansH.value = '${answer}';`)
    }
}

export function submitAnswer() {
    (document.querySelector('#btnReady') as HTMLButtonElement | undefined)?.click();
}