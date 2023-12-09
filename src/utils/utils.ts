

export function checkArrayEqual<T>(arr1:T[],arr2:T[]):boolean{
	if(arr1.length!==arr2.length)return false;
	for(let i:uint=0,t=arr1.length;i<t;i++){
		if(arr1[i]!==arr2[i]){
			return false;
		}
	}
	return true;
}
