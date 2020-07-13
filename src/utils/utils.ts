const L=console.log

const getTimerStartTime=(new Date()).getTime()
export function getTimer():number{
	return (new Date()).getTime()-getTimerStartTime;
}