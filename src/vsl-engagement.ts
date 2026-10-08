/** Accumulate verified forward playback, excluding pauses and seek jumps. */
export function playbackProgress(previous:number,current:number,playing:boolean){
 const delta=current-previous;return playing&&Number.isFinite(delta)&&delta>0&&delta<=2.5?delta:0;
}
