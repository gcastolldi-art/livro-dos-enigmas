export const solution=()=>Array.from({length:25},(_,i)=>(i+1)%25);
export function valid(board){return Array.isArray(board)&&board.length===25&&board.every(Number.isInteger)&&new Set(board).size===25&&board.every(n=>n>=0&&n<25);}
export function solvable(board){if(!valid(board))return false;let inversions=0;const a=board.filter(Boolean);for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])inversions++;return inversions%2===0;}
export function neighbors(index){return Array.from({length:25},(_,i)=>i).filter(i=>Math.abs(Math.floor(i/5)-Math.floor(index/5))+Math.abs(i%5-index%5)===1);}
export function move(board,index){const empty=board.indexOf(0);if(!neighbors(empty).includes(index))return false;[board[index],board[empty]]=[board[empty],board[index]];return true;}
export const solved=board=>valid(board)&&board.every((n,i)=>n===(i+1)%25);
export function shuffle(random=Math.random){const board=solution();let previous=-1;for(let i=0;i<800;i++){const empty=board.indexOf(0),options=neighbors(empty).filter(n=>n!==previous);move(board,options[Math.floor(random()*options.length)]);previous=empty;}return solved(board)?shuffle(random):board;}
