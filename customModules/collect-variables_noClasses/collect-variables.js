const fs = require('fs')
const { isRegExp } = require('util')

const readData = (varfilePath) =>{
	return new Promise(function(resolve, reject) {
		
		//fs.readFile('/data/customData/vars.json','utf8',(err,data) => {
		console.log(varfilePath)
		fs.readFile(varfilePath,'utf8',(err,data) => {
			if (err) {
				console.error(err)
				reject(err)
			}else{
				resolve(data)
			}
			
		})	
	})
}

const processData = (data)=>{
	return new Promise(function(resolve, reject) {
		//console.log(data)
		var dataObj={}
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
				//console.log("element "+counter+": "+element)
				nodeId=element[0]
				nodeId_arr=nodeId.split(';')
				ns=nodeId_arr[0]
				name=nodeId_arr[1].substr(nodeId_arr[1].indexOf("s=")+2)
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
			//console.log("dataObj"+dataObj)
			resolve(dataObj)

		} catch(err){
			console.error(err)
			reject(err)
		}
	})
}

const createOpcMessages = (data,node)=>{
	return new Promise(function(resolve, reject) {
		var counter = 0;
		var addNodeMsg;
		var setNodeMsg;
		var setFolderMsg;
		var addFolderMsg;
		
		var nodeId;
		var dataType;
		var value;
		var dbString;
		var dbArray;
		var folderArray=[];
		var folderCounter=0;

		var opcMessages = []

		try {
			const vars = JSON.parse(data)
			vars.forEach(function(element) {
				
				counter++;
				nodeId=element[0]
				nodeId_arr=nodeId.split(';')
				ns_string=nodeId_arr[0]
				ns=ns_string.substr(ns_string.indexOf("ns=")+3)
				name=nodeId_arr[1].substr(nodeId_arr[1].indexOf("s=")+2)
				type=element[1]
				value=element[2]
				
				varName=nodeId.substr(nodeId.indexOf(";s=")+3);
				varNameArray=Array.from(varName.split("."));
				msg2={}
				if(!folderArray.includes(varNameArray[0])){
					folderArray[folderCounter]=varNameArray[0];
					folderCounter++;
					
					setFolderMsg={
						topic: ns_string+";s=Objects" ,
						payload: { "opcuaCommand": "setFolder"}
					}
					//console.log(setFolderMsg)
					opcMessages.push(setFolderMsg)
					msg2=setFolderMsg
					node.send([null,msg2])
					
					addFolderMsg={
						topic: ns_string+";s="+varNameArray[0] ,
						payload: { "opcuaCommand": "addFolder"}
					}
					//console.log(addFolderMsg)
					opcMessages.push(addFolderMsg)
					msg2=addFolderMsg
					node.send([null,msg2])
					
				}else{
					setFolderMsg={
						topic: ns_string+";s="+varNameArray[0] ,
						payload: { "opcuaCommand": "setFolder"}
					}
					//console.log(setFolderMsg)
					opcMessages.push(setFolderMsg)
					msg2=setFolderMsg
					node.send([null,msg2])
				}
				
			
				addNodeMsg={
						topic: nodeId + ';datatype=' + type,
						payload: { "opcuaCommand": "addVariable"}
				}
				//console.log(addNodeMsg)
				opcMessages.push(addNodeMsg)
				msg2=addNodeMsg
				node.send([null,msg2])

				setNodeMsg={
						topic: '',
						payload: { "messageType" : "Variable",  "variableName":ns+":"+varName,  "variableValue": value }
				}
				//console.log(setNodeMsg)
				opcMessages.push(setNodeMsg)
				msg2=setNodeMsg
				node.send([null,msg2])
				
			});

			//console.log("createOpcMessages done")
			//resolve("createOpcMessages done")
			//console.log(opcMessages)
			resolve(opcMessages)

		} catch(err){
			console.error(err)
			reject(err)
		}
	})
}




module.exports = function(RED) {
	//var globalContext = this.context().global;
	function CollectVariables(config){
		RED.nodes.createNode(this,config);
		console.log('creating node')
		console.log(config)
		var node = this;
		
		node.varfile=config.varfile
        node.typedInputJSON=config.typedInputJSON

		//console.log(node.conffile)

		node.on('input',function(msg){
			console.log(node.varfile)
			var httpReqUrl=msg.req.url
			var httpReqMethod=msg.req.method
			console.log(httpReqMethod+" "+httpReqUrl)

			var filePath=node.varfile
			//processVars('/data/customData/vars.json').then((data)=>{
			readData(filePath).then((data)=>{
				//console.log("data:"+data)
				//console.log(node.typedInputJSON)
				//console.log(node.select)
/*				
				processData(data).then((dataObj)=>{
					msg.payload = dataObj
					node.send(msg);
				})
				createOpcMessages(data).then((result)=>{
					console.log("createOpcMessages result: "+result)
				})
*/
				msg2={}

				processData(data).then((dataObj)=>{
					msg.payload = dataObj
					node.send(msg)
					//node.done
					if(httpReqUrl=='/setOPC'){
						createOpcMessages(data,node).then((opcMessages)=>{
							console.log(opcMessages)
							//msg2.opcMessages = opcMessages
							//node.send([msg,msg2]);
							/*
							opcMessages.forEach(message=>{
								msg2=message
								node.send([{},msg2])
								node.done
							})
							*/
							
						})
					}
					//node.done()	
				})
			})
		});

		console.log('node created')
	}
	
	RED.nodes.registerType("collect-variables",CollectVariables)
}