const getTimerStartTime=(new Date()).getTime()
export function getTimer():uint{
	return (new Date()).getTime()-getTimerStartTime;
}

export function checkArrayEqual<T>(arr1:T[],arr2:T[]):boolean{
	if(arr1.length!==arr2.length)return false;
	for(let i:uint=0,t=arr1.length;i<t;i++){
		if(arr1[i]!==arr2[i]){
			return false;
		}
	}
	return true;
}

export const isBrowser =typeof window !== "undefined" && typeof window.document !== "undefined";

export const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
