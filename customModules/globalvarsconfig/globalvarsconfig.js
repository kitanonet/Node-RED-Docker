const fs = require('fs')
const { isRegExp } = require('util')


function getVars(){
	var dataObj={}
	fs.readFile('/data/customData/vars.json','utf8',(err,data) => {
		if (err) {
			console.error(err)
			return
		}
		console.log(data)
		try {
			const vars = JSON.parse(data)
			//console.log("vars:\n" + vars)
			var counter=0
			var nodeId,ns,name,type,defval,namefields,db,struct,variable

			var dbArray=[]
			var dbCounter=0
			var structArray=[]
			var structCounter=0
			//var dataObj={}
			//dataObj{['db']=""}
			//dataObj['struct']=""
			//dataObj['variables']=[]
			var dataObjArray=[]

			vars.forEach(element => {
				console.log("element "+counter+": "+element)

				nodeId=element[0].split(';')
				ns=nodeId[0]
				name=nodeId[1].substr(nodeId[1].indexOf("s=")+2)
				type=element[1]
				defval=element[2]

				namefields=name.split('.')
				db=namefields[0]
				struct=namefields[1]
				const searchRegExp = /,/g;
				const replaceWith = '.';
				variable=namefields.slice(2).toString().replace(searchRegExp,replaceWith)

				//console.log("ns:"+ns+"\nname:"+name+"\nnamefields:"+namefields.length+"\ntype:"+type+"\ndefval:"+defval)

				//console.log(db+" "+struct+" "+variable)

				newDb=false
				newStruct=false

				if(!dbArray.includes(db)){
					dbArray[dbCounter]=db;
					dbCounter++;

					dataObj[db]={"name":db}
				}

				if(!structArray.includes(struct)){
					structArray[structCounter]=struct;
					structCounter++;
				}

				if (typeof dataObj[db][struct] == "undefined"){
					dataObj[db][struct]={"name":struct}
					dataObj[db][struct]['variables']=[]
				}

				dataObj[db][struct]['variables'].push(variable)
				//console.log(dataObj[db][struct])
				//dataObjArray.push(dataObj)

				counter++
			})

		} catch(err){
			console.error(err)
		}
	})
	console.log("dataObj"+dataObj)

	return dataObj

}


//var processVars = new Promise(function(resolve, reject) {

const processVars = (varfilePath) =>{
	return new Promise(function(resolve, reject) {
		var dataObj={}
		//fs.readFile('/data/customData/vars.json','utf8',(err,data) => {
		console.log(varfilePath)
		fs.readFile(varfilePath,'utf8',(err,data) => {
			if (err) {
				console.error(err)
				return
			}
			//console.log(data)
			try {
				const vars = JSON.parse(data)
				//console.log("vars:\n" + vars)
				var counter=0
				var nodeId,ns,name,type,defval,namefields,db,struct,variable

				var dbArray=[]
				var dbCounter=0
				var structArray=[]
				var structCounter=0
				//var dataObj={}
				//dataObj{['db']=""}
				//dataObj['struct']=""
				//dataObj['variables']=[]
				var dataObjArray=[]

				vars.forEach(element => {
					console.log("element "+counter+": "+element)

					nodeId=element[0].split(';')
					ns=nodeId[0]
					name=nodeId[1].substr(nodeId[1].indexOf("s=")+2)
					type=element[1]
					value=element[2]

					namefields=name.split('.')
					db=namefields[0]
					struct=namefields[1]
					const searchRegExp = /,/g;
					const replaceWith = '.';
					variable=namefields.slice(2).toString().replace(searchRegExp,replaceWith)

					//console.log("ns:"+ns+"\nname:"+name+"\nnamefields:"+namefields.length+"\ntype:"+type+"\ndefval:"+defval)

					//console.log(db+" "+struct+" "+variable)

					newDb=false
					newStruct=false

					if(!dbArray.includes(db)){
						dbArray[dbCounter]=db;
						dbCounter++;

						//dataObj[db]={"name":db}
						dataObj[db]={}
					}

					if(!structArray.includes(struct)){
						structArray[structCounter]=struct;
						structCounter++;
					}

					if (typeof dataObj[db][struct] == "undefined"){
						//dataObj[db][struct]={"name":struct}
						//dataObj[db][struct]['variables']=[]
						dataObj[db][struct]={}
					}
					//dataObj[db][struct]['variables'].push(variable)

					dataObj[db][struct][variable]={'type':type,'value':value}

					counter++
					
				})
				console.log("dataObj"+dataObj)
				resolve(dataObj);

			} catch(err){
				console.error(err)
				reject(err);
			}
		})	
	})
}

module.exports = function(RED) {

	function ConfigGlobalVars(config){
		RED.nodes.createNode(this,config);
		console.log('creating node')
		console.log(config)
		var node = this;
		
		node.conffile=config.conffile
        node.typedInputJSON=config.typedInputJSON
        node.select=config.select
		node.editableList=config.editableList
		Object.keys(node.editableList).forEach((key,id,arr)=>{
			console.log(id+" "+key)
			var obj = node.editableList[key]
			console.log(typeof(obj))
			console.log(obj)
		})

		//console.log(node.conffile)
		//console.log(node.editableList)
		

		

		node.on('input',function(msg){
			console.log(node.conffile)
			var filePath=node.conffile
			//processVars('/data/customData/vars.json').then((data)=>{
			processVars(filePath).then((data)=>{
				console.log("data:"+data)
				//console.log(node.typedInputJSON)
				//console.log(node.select)
	//			msg.payload = msg.payload.toLowerCase();
				msg.payload = data
				msg.editableList=node.editableList
				node.send(msg);
			})

		});

		console.log('node created')
	}
	
	RED.nodes.registerType("globalvarsconfig",ConfigGlobalVars)
}