const getTimerStartTime=(new Date()).getTime()
export function getTimer():uint{
	return (new Date()).getTime()-getTimerStartTime;
}